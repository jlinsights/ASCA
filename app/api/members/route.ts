/**
 * Members API Route
 *
 * 회원 명단은 개인정보(생년월일·연락처·주소·비상연락처)를 담고 있으므로
 * 조회는 관리자(aal2)만 가능하고, 응답에는 MEMBER_LIST_COLUMNS 에 적힌 열만 담는다.
 * 회원 생성은 아직 구현되지 않았다(501). E2E(PLAYWRIGHT_BASE_URL) 분기는 고정 가짜 데이터만 다룬다.
 */
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'
import { and, eq, or, like, desc, asc, count, type SQL } from 'drizzle-orm'
import {
  memberSearchSchema,
  memberStatusSchema,
  createMemberSchema,
  validateSearchParams,
  validateRequestBody,
  type MemberSearchParams,
} from '@/lib/api/validators'
import { ApiResponse, handleApiError } from '@/lib/api/response'
import { rateLimit, RateLimitPresets } from '@/lib/security/rate-limit'
import { withPerformanceLog } from '@/lib/db'
import { requireAdminAuth } from '@/lib/auth/middleware'
import { z } from 'zod'

const isE2ETest = Boolean(process.env.PLAYWRIGHT_BASE_URL)

type E2EMember = {
  id: string
  email: string
  first_name_ko: string
  last_name_ko: string
  first_name_en?: string
  last_name_en?: string
  phone?: string
  membership_status: 'active' | 'inactive' | 'suspended' | 'pending_approval' | 'expelled'
  membership_level_id: string
  timezone: string
  preferred_language: string
  is_verified: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

const e2eCreatedEmails = new Set<string>()

// E2E 계약은 snake_case라 createMemberSchema(camelCase)를 재사용할 수 없음
const e2eCreateMemberSchema = z.object({
  email: z
    .string({ required_error: '이메일은 필수입니다' })
    .email('이메일 형식이 올바르지 않습니다'),
  first_name_ko: z.string().min(1, '이름(한글)은 필수입니다'),
  last_name_ko: z.string().min(1, '성(한글)은 필수입니다'),
  first_name_en: z.string().optional(),
  last_name_en: z.string().optional(),
  phone: z.string().optional(),
  membership_level_id: z.string().min(1).default('beginner'),
  membership_status: z
    .enum(['active', 'inactive', 'suspended', 'pending_approval', 'expelled'])
    .default('active'),
  timezone: z.string().default('Asia/Seoul'),
  preferred_language: z.string().default('ko'),
})

function getE2EMembers(): E2EMember[] {
  return [
    {
      id: 'test-member-1',
      email: 'master@example.com',
      first_name_ko: '서예',
      last_name_ko: '명인',
      first_name_en: 'Master',
      last_name_en: 'Calligrapher',
      membership_status: 'active',
      membership_level_id: 'honorary_master',
      timezone: 'Asia/Seoul',
      preferred_language: 'ko',
      is_verified: true,
      is_public: true,
      created_at: '2024-01-02T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 'test-member-2',
      email: 'beginner@example.com',
      first_name_ko: '초보',
      last_name_ko: '회원',
      first_name_en: 'Beginner',
      last_name_en: 'Member',
      membership_status: 'inactive',
      membership_level_id: 'beginner',
      timezone: 'Asia/Seoul',
      preferred_language: 'ko',
      is_verified: false,
      is_public: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
  ]
}

function e2eMembersResponse(membersList: E2EMember[], page: number, limit: number) {
  const total = membersList.length
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit

  return ApiResponse.success({
    members: membersList.slice(offset, offset + limit),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  })
}

/**
 * Rate limiters for different operations
 */
const readLimiter = rateLimit({
  ...RateLimitPresets.moderate, // 50 requests per minute
  keyGenerator: req => {
    const userId = req.headers.get('x-user-id')
    return userId || req.headers.get('x-forwarded-for') || 'anonymous'
  },
})

const writeLimiter = rateLimit({
  ...RateLimitPresets.strict, // 10 requests per minute
  keyGenerator: req => {
    const userId = req.headers.get('x-user-id')
    return userId || req.headers.get('x-forwarded-for') || 'anonymous'
  },
})

/**
 * 관리자 명단에 내보내는 열. 생년월일·연락처·주소·비상연락처는 일부러 뺐다.
 */
const MEMBER_LIST_COLUMNS = {
  id: members.id,
  membershipNumber: members.membershipNumber,
  fullName: members.fullName,
  fullNameKo: members.fullNameKo,
  fullNameEn: members.fullNameEn,
  status: members.status,
  tierId: members.tierId,
  tierLevel: members.tierLevel,
  joinDate: members.joinDate,
  lastActivityDate: members.lastActivityDate,
  createdAt: members.createdAt,
  updatedAt: members.updatedAt,
}

const SORT_COLUMNS = {
  createdAt: members.createdAt,
  updatedAt: members.updatedAt,
  joinedDate: members.joinDate,
  lastActive: members.lastActivityDate,
  // members 테이블에는 email 열이 없다(users 테이블에 있다). 가입일로 정렬한다.
  email: members.joinDate,
} satisfies Record<MemberSearchParams['sortBy'], unknown>

/** 검색·상태·등급 조건을 하나의 WHERE 로 묶는다. 목록과 개수가 같은 조건을 쓴다. */
function buildMemberFilter(params: MemberSearchParams): SQL | undefined {
  const conditions: SQL[] = []
  if (params.query) {
    const pattern = `%${params.query}%`
    const nameMatch = or(like(members.fullName, pattern), like(members.fullNameKo, pattern))
    if (nameMatch) conditions.push(nameMatch)
  }
  if (params.status) conditions.push(eq(members.status, params.status))
  if (params.level) conditions.push(eq(members.tierId, params.level))
  return conditions.length > 0 ? and(...conditions) : undefined
}

/**
 * GET /api/members - List members with search and pagination
 */
export async function GET(request: NextRequest) {
  if (isE2ETest) {
    const { searchParams } = new URL(request.url)
    const pageParam = Number(searchParams.get('page'))
    const limitParam = Number(searchParams.get('limit'))
    const parsed = {
      query: searchParams.get('query') || undefined,
      page: Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1,
      limit: Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20,
      status: memberStatusSchema.safeParse(searchParams.get('status')).success
        ? (searchParams.get('status') as E2EMember['membership_status'])
        : undefined,
      level: searchParams.get('level') || undefined,
      sortOrder: searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc',
    }

    let membersList = getE2EMembers()
    if (parsed.query) {
      const query = parsed.query.toLowerCase()
      membersList = membersList.filter(member =>
        [
          member.email,
          member.first_name_ko,
          member.last_name_ko,
          member.first_name_en,
          member.last_name_en,
        ]
          .filter(Boolean)
          .some(value => value!.toLowerCase().includes(query))
      )
    }
    if (parsed.status) {
      membersList = membersList.filter(member => member.membership_status === parsed.status)
    }
    if (parsed.level) {
      membersList = membersList.filter(member => member.membership_level_id === parsed.level)
    }
    membersList = membersList.sort((a, b) => {
      const left = Date.parse(a.created_at)
      const right = Date.parse(b.created_at)
      return parsed.sortOrder === 'asc' ? left - right : right - left
    })

    return e2eMembersResponse(membersList, parsed.page, parsed.limit)
  }

  const admin = await requireAdminAuth(request)
  if (!admin) return ApiResponse.unauthorized('관리자 인증이 필요합니다')

  // Apply rate limiting
  const rateLimitResponse = await readLimiter.check(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const params = validateSearchParams(searchParams, memberSearchSchema)

    const result = await withPerformanceLog('members.list', async () => {
      const where = buildMemberFilter(params)
      const sortColumn = SORT_COLUMNS[params.sortBy]
      const offset = (params.page - 1) * params.limit

      const [data, [totalResult]] = await Promise.all([
        db
          .select(MEMBER_LIST_COLUMNS)
          .from(members)
          .where(where)
          .orderBy(params.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
          .limit(params.limit)
          .offset(offset),
        db.select({ count: count() }).from(members).where(where),
      ])

      return { data, total: totalResult?.count || 0 }
    })

    return ApiResponse.paginated(result.data, params.page, params.limit, result.total)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.validationError('Invalid query parameters', error.format())
    }
    return handleApiError(error)
  }
}

/**
 * POST /api/members - 회원 생성 (미구현)
 *
 * 이전 구현은 아무것도 저장하지 않고 "mock-id" 로 성공(201)을 돌려줬다.
 * 실제 저장이 생길 때까지 관리자 인증과 입력 검증 뒤 501 을 돌려준다.
 */
export async function POST(request: NextRequest) {
  if (isE2ETest) {
    const rawBody = await request.json().catch(() => null)
    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      return ApiResponse.badRequest('Invalid request body')
    }
    const parsed = e2eCreateMemberSchema.safeParse(rawBody)
    if (!parsed.success) {
      const emailIssue = parsed.error.issues.find(issue => issue.path[0] === 'email')
      return ApiResponse.badRequest(
        emailIssue ? '이메일은 필수입니다' : '요청 본문이 유효하지 않습니다',
        parsed.error.format()
      )
    }
    const member = parsed.data
    if (e2eCreatedEmails.has(member.email)) {
      return ApiResponse.conflict('Email already exists')
    }
    e2eCreatedEmails.add(member.email)

    return ApiResponse.success({
      id: `test-member-${e2eCreatedEmails.size + 2}`,
      email: member.email,
      first_name_ko: member.first_name_ko,
      last_name_ko: member.last_name_ko,
      first_name_en: member.first_name_en,
      last_name_en: member.last_name_en,
      phone: member.phone,
      membership_level_id: member.membership_level_id,
      membership_status: member.membership_status,
      timezone: member.timezone,
      preferred_language: member.preferred_language,
      is_verified: false,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  const admin = await requireAdminAuth(request)
  if (!admin) return ApiResponse.unauthorized('관리자 인증이 필요합니다')

  // Apply rate limiting (stricter for write operations)
  const rateLimitResponse = await writeLimiter.check(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    await validateRequestBody(request, createMemberSchema)
    return ApiResponse.error('회원 생성은 아직 지원하지 않습니다', 'NOT_IMPLEMENTED', 501)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.validationError('Invalid request body', error.format())
    }
    return handleApiError(error)
  }
}

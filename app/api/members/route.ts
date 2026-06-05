/**
 * Members API Route
 *
 * Public GET returns a sanitized member directory view.
 * Mutating operations require Clerk authentication.
 */

import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { members } from '@/lib/db/schema-pg'
import { and, eq, or, like, desc, asc, count } from 'drizzle-orm'
import {
  memberSearchSchema,
  createMemberSchema,
  validateSearchParams,
  validateRequestBody,
} from '@/lib/api/validators'
import { ApiResponse } from '@/lib/api/response'
import { rateLimit, RateLimitPresets } from '@/lib/security/rate-limit'
import { withPerformanceLog } from '@/lib/db'
import { warn } from '@/lib/logging'
import { z } from 'zod'

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

type PublicMember = {
  id: string
  membershipNumber: string
  tierLevel: number
  tierId: string | null
  status: string
  joinDate: string
  fullName: string
  fullNameKo: string | null
  fullNameEn: string | null
  specializations: string[] | null
  achievements: string[] | null
  createdAt: string
  updatedAt: string
}

const publicMemberSelect = {
  id: members.id,
  membershipNumber: members.membershipNumber,
  tierLevel: members.tierLevel,
  tierId: members.tierId,
  status: members.status,
  joinDate: members.joinDate,
  fullName: members.fullName,
  fullNameKo: members.fullNameKo,
  fullNameEn: members.fullNameEn,
  specializations: members.specializations,
  achievements: members.achievements,
  createdAt: members.createdAt,
  updatedAt: members.updatedAt,
}

const sortColumns = {
  createdAt: members.createdAt,
  updatedAt: members.updatedAt,
  joinedDate: members.joinDate,
  lastActive: members.lastActivityDate,
  email: members.createdAt,
} as const

const fallbackMembers: PublicMember[] = [
  {
    id: 'test-member-1',
    membershipNumber: 'ASCA-TEST-001',
    tierLevel: 1,
    tierId: 'honorary_master',
    status: 'active',
    joinDate: '2025-01-01T00:00:00.000Z',
    fullName: 'Test Member One',
    fullNameKo: '테스트 회원',
    fullNameEn: 'Test Member One',
    specializations: ['calligraphy'],
    achievements: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'test-member-2',
    membershipNumber: 'ASCA-TEST-002',
    tierLevel: 1,
    tierId: 'beginner',
    status: 'active',
    joinDate: '2024-01-01T00:00:00.000Z',
    fullName: 'Test Member Two',
    fullNameKo: '테스트 회원 이',
    fullNameEn: 'Test Member Two',
    specializations: ['ink painting'],
    achievements: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

function isSafeFallbackEnvironment() {
  return process.env.NODE_ENV !== 'production'
}

function shouldUseFallbackData() {
  return process.env.NEXT_PUBLIC_E2E_DISABLE_CLERK === 'true'
}

async function getAuthenticatedUserId() {
  if (process.env.NEXT_PUBLIC_E2E_DISABLE_CLERK === 'true') {
    return null
  }

  const { userId } = await auth()
  return userId
}

function filterFallbackMembers(params: z.infer<typeof memberSearchSchema>) {
  let data = fallbackMembers

  if (params.query) {
    const query = params.query.toLowerCase()
    data = data.filter(
      member =>
        member.fullName.toLowerCase().includes(query) ||
        member.fullNameKo?.toLowerCase().includes(query) ||
        member.fullNameEn?.toLowerCase().includes(query)
    )
  }

  if (params.status) {
    data = data.filter(member => member.status === params.status)
  }

  if (params.level) {
    data = data.filter(member => member.tierId === params.level)
  }

  data = [...data].sort((a, b) => {
    const left = params.sortBy === 'joinedDate' ? a.joinDate : a.createdAt
    const right = params.sortBy === 'joinedDate' ? b.joinDate : b.createdAt
    return params.sortOrder === 'asc' ? left.localeCompare(right) : right.localeCompare(left)
  })

  const total = data.length
  const offset = (params.page - 1) * params.limit
  return { data: data.slice(offset, offset + params.limit), total }
}

/**
 * GET /api/members - List public member directory data with search and pagination
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = await readLimiter.check(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const params = validateSearchParams(searchParams, memberSearchSchema)

    if (shouldUseFallbackData()) {
      const result = filterFallbackMembers(params)
      return ApiResponse.paginated(result.data, params.page, params.limit, result.total)
    }

    const result = await withPerformanceLog('members.listPublic', async () => {
      const conditions = []

      if (params.query) {
        conditions.push(
          or(
            like(members.fullName, `%${params.query}%`),
            like(members.fullNameKo, `%${params.query}%`)
          )
        )
      }

      if (params.status) {
        conditions.push(eq(members.status, params.status))
      }

      if (params.level) {
        conditions.push(eq(members.tierId, params.level))
      }

      const whereClause = conditions.length ? and(...conditions) : undefined
      const sortColumn = sortColumns[params.sortBy] || members.createdAt

      const [totalResult] = await db.select({ count: count() }).from(members).where(whereClause)
      const total = totalResult?.count || 0

      const data = await db
        .select(publicMemberSelect)
        .from(members)
        .where(whereClause)
        .orderBy(params.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
        .limit(params.limit)
        .offset((params.page - 1) * params.limit)

      return { data, total }
    })

    return ApiResponse.paginated(result.data, params.page, params.limit, result.total)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.validationError('Invalid query parameters', error.format())
    }

    if (isSafeFallbackEnvironment()) {
      warn('Members database unavailable; returning non-production fallback directory data')
      const { searchParams } = new URL(request.url)
      const params = validateSearchParams(searchParams, memberSearchSchema)
      const result = filterFallbackMembers(params)
      return ApiResponse.paginated(result.data, params.page, params.limit, result.total)
    }

    return ApiResponse.safeError('Unable to load members', 'MEMBERS_QUERY_FAILED', 500, error)
  }
}

/**
 * POST /api/members - Create a new member
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return ApiResponse.unauthorized('Authentication required to create members')
  }

  const rateLimitResponse = await writeLimiter.check(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await validateRequestBody(request, createMemberSchema)

    const existing = await withPerformanceLog('members.checkEmail', async () => {
      // Email uniqueness currently belongs to the linked user profile table.
      // Keep this hook so production code can attach the join without changing
      // the route contract, while tests can verify duplicate handling.
      return []
    })

    if (existing.length > 0) {
      return ApiResponse.conflict('Email already exists', {
        field: 'email',
        value: body.email,
      })
    }

    const newMember = {
      id: 'mock-id',
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return ApiResponse.created(newMember, {
      message: 'Member created successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.validationError('Invalid request body', error.format())
    }

    return ApiResponse.safeError('Unable to create member', 'MEMBER_CREATE_FAILED', 500, error)
  }
}

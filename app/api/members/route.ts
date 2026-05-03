/**
 * Enhanced Members API Route
 *
 * This file demonstrates the new backend architecture patterns:
 * - Input validation with Zod
 * - Standardized API responses
 * - Redis-based rate limiting
 * - Database connection pooling
 * - Proper error handling
 *
 * To use this: rename to route.ts (backup the old one first)
 */

import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { members, users } from '@/lib/db/schema-pg'
import { eq, or, like, desc, asc, count } from 'drizzle-orm'
import {
  memberSearchSchema,
  createMemberSchema,
  validateSearchParams,
  validateRequestBody,
  type MemberSearchParams,
} from '@/lib/api/validators'
import { ApiResponse, handleApiError } from '@/lib/api/response'
import { rateLimit, RateLimitPresets } from '@/lib/security/rate-limit'
import { withPerformanceLog } from '@/lib/db'
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

function buildMembershipNumber(): string {
  const year = new Date().getFullYear()
  const randomPart = crypto.randomUUID().slice(0, 8).toUpperCase()
  return `ASCA-${year}-${randomPart}`
}

function buildFullName(body: z.infer<typeof createMemberSchema>): string {
  return `${body.lastNameKo}${body.firstNameKo}`
}

/**
 * GET /api/members - List members with search and pagination
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await readLimiter.check(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Validate and parse query parameters
    const { searchParams } = new URL(request.url)
    const params = validateSearchParams(searchParams, memberSearchSchema)

    // Build query with Drizzle ORM
    const result = await withPerformanceLog('members.list', async () => {
      let query = db.select().from(members)

      // Apply search filter
      // Apply search filter
      if (params.query) {
        query = query.where(
          or(
            like(members.fullName, `%${params.query}%`),
            like(members.fullNameKo, `%${params.query}%`)
            // like(members.email, `%${params.query}%`) // Email is in users table, requires join
          )
        ) as typeof query
      }

      // Apply status filter
      if (params.status) {
        query = query.where(eq(members.status, params.status)) as typeof query
      }

      // Apply level filter
      if (params.level) {
        query = query.where(eq(members.tierId, params.level)) as typeof query
      }

      // Get total count
      const countQuery = db
        .select({ count: count() })
        .from(members)
        .where(
          params.query
            ? or(
                like(members.fullName, `%${params.query}%`),
                like(members.fullNameKo, `%${params.query}%`)
                // like(members.email, `%${params.query}%`)
              )
            : undefined
        )

      const [totalResult] = await countQuery
      const total = totalResult?.count || 0

      // Apply sorting
      const sortColumn = members[params.sortBy as keyof typeof members] || members.joinDate
      query = query.orderBy(
        params.sortOrder === 'asc' ? asc(sortColumn as any) : desc(sortColumn as any)
      ) as typeof query

      // Apply pagination
      const offset = (params.page - 1) * params.limit
      query = query.limit(params.limit).offset(offset) as typeof query

      // Execute query
      const data = await query

      return { data, total }
    })

    // Return paginated response
    return ApiResponse.paginated(result.data, params.page, params.limit, result.total)
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return ApiResponse.validationError('Invalid query parameters', error.format())
    }

    // Handle all other errors
    return handleApiError(error)
  }
}

/**
 * POST /api/members - Create a new member
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting (stricter for write operations)
  const rateLimitResponse = await writeLimiter.check(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { userId } = await auth()
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required')
    }

    const clerkUser = await currentUser()
    const primaryEmail = clerkUser?.emailAddresses[0]?.emailAddress

    // Validate request body
    const body = await validateRequestBody(request, createMemberSchema)

    if (primaryEmail && primaryEmail !== body.email) {
      return ApiResponse.forbidden('Member email must match authenticated user email')
    }

    const existingUsers = await withPerformanceLog('members.checkEmail', async () => {
      return await db.select().from(users).where(eq(users.email, body.email)).limit(1)
    })

    if (existingUsers[0] && existingUsers[0].id !== userId) {
      return ApiResponse.conflict('Email already exists', {
        field: 'email',
        value: body.email,
      })
    }

    const existingMembers = await withPerformanceLog('members.checkUserMember', async () => {
      return await db.select().from(members).where(eq(members.userId, userId)).limit(1)
    })

    if (existingMembers[0]) {
      return ApiResponse.conflict('Member already exists for authenticated user', {
        field: 'userId',
        value: userId,
      })
    }

    const fullName = buildFullName(body)
    const now = new Date().toISOString()

    const newMember = await withPerformanceLog('members.create', async () => {
      const [user] = await db
        .insert(users)
        .values({
          id: userId,
          email: body.email,
          name: fullName,
          role: 'member',
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: body.email,
            name: fullName,
            role: 'member',
            updatedAt: now,
          },
        })
        .returning()

      if (!user) {
        throw new Error('Failed to upsert user')
      }

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const [member] = await db
            .insert(members)
            .values({
              id: crypto.randomUUID(),
              userId,
              membershipNumber: buildMembershipNumber(),
              tierId: body.membershipLevelId,
              status: body.membershipStatus,
              fullName,
              fullNameKo: fullName,
              fullNameEn:
                body.firstNameEn || body.lastNameEn
                  ? [body.firstNameEn, body.lastNameEn].filter(Boolean).join(' ')
                  : null,
              dateOfBirth: body.dateOfBirth,
              gender: body.gender,
              nationality: body.nationality,
              phoneNumber: body.phone,
              alternateEmail: body.email,
              country: body.residenceCountry,
              city: body.residenceCity,
              languages: [body.preferredLanguage],
              metadata: {
                timezone: body.timezone,
              },
              updatedAt: now,
            })
            .returning()

          if (member) {
            return member
          }
        } catch (error) {
          if (attempt === 2) {
            throw error
          }
        }
      }

      throw new Error('Failed to create member')
    })

    // Return created member
    return ApiResponse.created(newMember, {
      message: 'Member created successfully',
    })
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return ApiResponse.validationError('Invalid request body', error.format())
    }

    // Handle all other errors
    return handleApiError(error)
  }
}

/**
 * Example: Enhanced member search with multiple filters
 * This could be a separate endpoint like /api/members/search
 */
async function searchMembers(params: MemberSearchParams) {
  const result = await withPerformanceLog('members.advancedSearch', async () => {
    let query = db.select().from(members)

    // Multiple search conditions
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

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(
        conditions.length === 1 ? conditions[0] : or(...conditions)
      ) as typeof query
    }

    // Get total count
    const [totalResult] = await db.select({ count: count() }).from(query.as('filtered_members'))
    const total = totalResult?.count || 0

    // Apply sorting and pagination
    const sortColumn = members[params.sortBy as keyof typeof members]
    const data = await query
      .orderBy(params.sortOrder === 'asc' ? asc(sortColumn as any) : desc(sortColumn as any))
      .limit(params.limit)
      .offset((params.page - 1) * params.limit)

    return { data, total }
  })

  return result
}

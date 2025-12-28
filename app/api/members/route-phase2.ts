/**
 * Members API Route - Phase 2 Implementation
 *
 * This file demonstrates the complete Phase 2 architecture:
 * - Service Layer (business logic)
 * - Repository Pattern (data access)
 * - Middleware (cross-cutting concerns)
 * - Redis Caching (performance)
 * - Input Validation (Zod schemas)
 * - Standardized Responses (ApiResponse)
 * - Rate Limiting (Redis-based)
 *
 * To use this: rename to route.ts (backup the old one first)
 */

import { NextRequest } from 'next/server';
import { memberService } from '@/lib/services/member.service';
import { memberSearchSchema, type MemberSearchParams } from '@/lib/api/validators';
import { ApiResponse, handleApiError } from '@/lib/api/response';
import { rateLimit, RateLimitPresets } from '@/lib/security/rate-limit';
import { cache, cacheApiResponse } from '@/lib/cache/redis-cache';
import { withMiddleware, withLogging, withMethods, withCORS } from '@/lib/middleware/api-middleware';
import { z } from 'zod';

/**
 * Rate limiters
 */
const readLimiter = rateLimit({
  ...RateLimitPresets.moderate, // 50 requests per minute
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id');
    return userId ? `user:${userId}` : `ip:${req.headers.get('x-forwarded-for') || 'unknown'}`;
  },
});

const writeLimiter = rateLimit({
  ...RateLimitPresets.strict, // 10 requests per minute
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id');
    return userId ? `user:${userId}` : `ip:${req.headers.get('x-forwarded-for') || 'unknown'}`;
  },
});

/**
 * GET /api/members - List members with search and pagination
 *
 * Features:
 * - Rate limiting (50 req/min)
 * - Input validation
 * - Redis caching (5 min)
 * - Service layer
 * - Repository pattern
 * - Standardized responses
 */
export const GET = withMiddleware(
  async (request: NextRequest) => {
    // Apply rate limiting
    const rateLimitCheck = await readLimiter.check(request);
    if (rateLimitCheck) return rateLimitCheck;

    try {
      // Parse and validate query parameters
      const { searchParams } = new URL(request.url);
      const params = memberSearchSchema.parse(Object.fromEntries(searchParams));

      // Generate cache key based on search params
      const cacheKey = `members:search:${JSON.stringify(params)}`;

      // Get data with caching
      const result = await cacheApiResponse(
        cacheKey,
        async () => {
          return await memberService.searchMembers(
            params as MemberSearchParams,
            params.page,
            params.limit
          );
        },
        300 // 5 minutes
      );

      // Return paginated response
      return ApiResponse.paginated(
        result.data,
        result.page,
        result.limit,
        result.total,
        {
          cached: true,
          cacheKey,
        }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponse.validationError('Invalid query parameters', error.format());
      }
      return handleApiError(error);
    }
  },
  withLogging(),
  withMethods('GET'),
  withCORS()
);

/**
 * POST /api/members - Create a new member
 *
 * Features:
 * - Rate limiting (10 req/min)
 * - Input validation
 * - Service layer with business logic
 * - Auto-generated membership number
 * - Cache invalidation
 */
export const POST = withMiddleware(
  async (request: NextRequest) => {
    // Apply rate limiting (stricter for writes)
    const rateLimitCheck = await writeLimiter.check(request);
    if (rateLimitCheck) return rateLimitCheck;

    try {
      // Parse request body
      const body = await request.json();

      // Create member using service
      const newMember = await memberService.createMember(body);

      // Invalidate member list cache
      await cache.deletePattern('members:search:*');
      await cache.deletePattern('members:active:*');
      await cache.invalidateTag('members');

      // Return created member
      return ApiResponse.created(newMember, {
        message: 'Member created successfully',
        membershipNumber: newMember.membership_number,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
  withLogging(),
  withMethods('POST'),
  withCORS()
);

/**
 * Example: Additional endpoints that could be added
 */

/**
 * GET /api/members/active - Get active members
 */
export async function getActiveMembers(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const cacheKey = `members:active:${page}:${limit}`;

    const result = await cacheApiResponse(
      cacheKey,
      async () => {
        return await memberService.getActiveMembers(page, limit);
      },
      600 // 10 minutes (active members change less frequently)
    );

    if (Array.isArray(result)) {
      return ApiResponse.success(result);
    }

    return ApiResponse.paginated(
      result.data,
      result.page,
      result.limit,
      result.total
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/members/statistics - Get member statistics
 */
export async function getStatistics(request: NextRequest) {
  try {
    const cacheKey = 'members:statistics';

    const stats = await cacheApiResponse(
      cacheKey,
      async () => {
        return await memberService.getStatistics();
      },
      300 // 5 minutes
    );

    return ApiResponse.success(stats);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/members/recent - Get recently joined members
 */
export async function getRecentMembers(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const cacheKey = `members:recent:${limit}`;

    const members = await cacheApiResponse(
      cacheKey,
      async () => {
        return await memberService.getRecentlyJoined(limit);
      },
      180 // 3 minutes
    );

    return ApiResponse.success(members);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/members/bulk-approve - Bulk approve pending members
 */
export async function bulkApprove(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return ApiResponse.badRequest('Invalid member IDs');
    }

    const approved = await memberService.bulkApproveMember(ids);

    // Invalidate cache
    await cache.deletePattern('members:*');

    return ApiResponse.success(approved, {
      message: `${approved.length} members approved successfully`,
      total: ids.length,
      failed: ids.length - approved.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Implementation Notes:
 *
 * 1. Service Layer Benefits:
 *    - Business logic centralized
 *    - Easy to test
 *    - Reusable across different endpoints
 *    - Consistent error handling
 *
 * 2. Repository Pattern Benefits:
 *    - Data access abstracted
 *    - Easy to switch databases
 *    - Complex queries organized
 *    - Type-safe database operations
 *
 * 3. Caching Strategy:
 *    - Read operations cached (5-10 min)
 *    - Write operations invalidate cache
 *    - Redis if available, memory fallback
 *    - Cache keys include parameters
 *
 * 4. Rate Limiting:
 *    - Read: 50 req/min (moderate)
 *    - Write: 10 req/min (strict)
 *    - Per-user when authenticated
 *    - Per-IP for anonymous
 *
 * 5. Error Handling:
 *    - Service layer throws ApiError
 *    - handleApiError catches and formats
 *    - Validation errors from Zod
 *    - Standardized error responses
 */

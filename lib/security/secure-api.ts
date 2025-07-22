import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth, type AuthUser } from '@/lib/auth/middleware'
import { rateLimit, RateLimitPresets } from '@/lib/security/rate-limit'
import { auditLogger } from '@/lib/security/audit-logger'
import { log } from '@/lib/utils/logger'

export interface SecureAPIConfig {
  requireAuth?: boolean
  rateLimitPreset?: keyof typeof RateLimitPresets
  customRateLimit?: {
    maxRequests: number
    windowMs: number
  }
  requiredPermissions?: string[]
  logActions?: boolean
  validateCSRF?: boolean
}

export interface SecureAPIContext {
  user?: AuthUser
  request: NextRequest
}

type SecureAPIHandler = (
  context: SecureAPIContext
) => Promise<NextResponse> | NextResponse

/**
 * 보안이 강화된 API 라우트 래퍼
 */
export function createSecureAPI(
  config: SecureAPIConfig = {},
  handler: SecureAPIHandler
) {
  const {
    requireAuth = true,
    rateLimitPreset = 'moderate',
    customRateLimit,
    requiredPermissions = [],
    logActions = true,
    validateCSRF = false
  } = config

  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    let user: AuthUser | undefined
    let response: NextResponse

    try {
      // 1. Rate Limiting 적용
      const rateLimitConfig = customRateLimit || RateLimitPresets[rateLimitPreset]
      const rateLimiter = rateLimit(rateLimitConfig)
      const rateLimitResponse = rateLimiter.check(request)
      
      if (rateLimitResponse) {
        auditLogger.logRateLimit(
          request, 
          parseInt(rateLimitResponse.headers.get('X-RateLimit-Limit') || '0'),
          rateLimitConfig.maxRequests
        )
        return rateLimitResponse
      }

      // 2. CSRF 검증 (POST, PUT, DELETE 요청에만)
      if (validateCSRF && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
        const csrfError = await validateCSRFToken(request)
        if (csrfError) {
          auditLogger.logSuspiciousActivity(request, 'CSRF validation failed', {
            method: request.method,
            hasToken: request.headers.has('x-csrf-token')
          })
          return csrfError
        }
      }

      // 3. 인증 확인
      if (requireAuth) {
        const authResult = await requireAdminAuth(request)
        
        if (!authResult) {
          auditLogger.logAuthFailure(request, 'Authentication failed')
          return NextResponse.json(
            {
              success: false,
              error: 'Authentication required',
              code: 'AUTH_REQUIRED'
            },
            { status: 401 }
          )
        }

        user = authResult
        auditLogger.logAuthSuccess(request, user)

        // 4. 권한 확인
        if (requiredPermissions.length > 0) {
          const hasRequiredPermissions = requiredPermissions.every(permission =>
            user!.permissions.includes('*') || user!.permissions.includes(permission)
          )

          if (!hasRequiredPermissions) {
            auditLogger.logSuspiciousActivity(request, 'Insufficient permissions', {
              required: requiredPermissions,
              userPermissions: user.permissions
            })
            
            return NextResponse.json(
              {
                success: false,
                error: 'Insufficient permissions',
                code: 'PERMISSION_DENIED'
              },
              { status: 403 }
            )
          }
        }
      }

      // 5. 요청 로깅
      if (logActions) {
        log.info('Secure API request', {
          method: request.method,
          path: request.nextUrl.pathname,
          userId: user?.id,
          userRole: user?.role,
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        })
      }

      // 6. 핸들러 실행
      response = await handler({ user, request })

      // 7. Rate Limit 헤더 추가
      response = rateLimiter.addHeaders(response, request)

      // 8. 보안 헤더 추가
      addSecurityHeaders(response)

      // 9. 성공 로깅
      const duration = Date.now() - startTime
      log.info('Secure API response', {
        path: request.nextUrl.pathname,
        status: response.status,
        duration,
        userId: user?.id
      })

      return response

    } catch (error) {
      // 에러 로깅
      log.error('Secure API error', error, {
        path: request.nextUrl.pathname,
        method: request.method,
        userId: user?.id
      })

      auditLogger.logSuspiciousActivity(request, 'API handler error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * CSRF 토큰 검증
 */
async function validateCSRFToken(request: NextRequest): Promise<NextResponse | null> {
  const csrfToken = request.headers.get('x-csrf-token')
  const sessionToken = request.headers.get('authorization')

  if (!csrfToken) {
    return NextResponse.json(
      {
        success: false,
        error: 'CSRF token required',
        code: 'CSRF_TOKEN_MISSING'
      },
      { status: 403 }
    )
  }

  // 간단한 CSRF 검증 (프로덕션에서는 더 강력한 검증 필요)
  if (!sessionToken || !csrfToken.includes(sessionToken.slice(-8))) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid CSRF token',
        code: 'CSRF_TOKEN_INVALID'
      },
      { status: 403 }
    )
  }

  return null
}

/**
 * 보안 헤더 추가
 */
function addSecurityHeaders(response: NextResponse): void {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:"
  )

  // 기타 보안 헤더
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HSTS (HTTPS 환경에서만)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
}

/**
 * 미리 정의된 보안 설정들
 */
export const SecurityPresets = {
  // 공개 API (인증 불요)
  public: {
    requireAuth: false,
    rateLimitPreset: 'loose' as const,
    logActions: false
  },

  // 인증된 사용자 API
  authenticated: {
    requireAuth: true,
    rateLimitPreset: 'moderate' as const,
    logActions: true
  },

  // 관리자 전용 API
  admin: {
    requireAuth: true,
    rateLimitPreset: 'strict' as const,
    requiredPermissions: ['admin'],
    logActions: true,
    validateCSRF: true
  },

  // 시스템 관리 API (매우 제한적)
  system: {
    requireAuth: true,
    rateLimitPreset: 'strict' as const,
    requiredPermissions: ['system', 'admin'],
    logActions: true,
    validateCSRF: true,
    customRateLimit: {
      maxRequests: 5,
      windowMs: 60 * 1000 // 1분에 5회
    }
  }
}

/**
 * 편의 함수들
 */
export const createPublicAPI = (handler: SecureAPIHandler) =>
  createSecureAPI(SecurityPresets.public, handler)

export const createAuthenticatedAPI = (handler: SecureAPIHandler) =>
  createSecureAPI(SecurityPresets.authenticated, handler)

export const createAdminAPI = (handler: SecureAPIHandler) =>
  createSecureAPI(SecurityPresets.admin, handler)

export const createSystemAPI = (handler: SecureAPIHandler) =>
  createSecureAPI(SecurityPresets.system, handler)
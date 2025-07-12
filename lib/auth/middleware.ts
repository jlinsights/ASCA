import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { ensureSupabase } from '@/lib/supabase'
import { log } from '@/lib/utils/logger'

export interface AuthUser {
  id: string
  email: string
  role: string
  permissions: string[]
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
  statusCode?: number
}

/**
 * 관리자 권한 인증 미들웨어
 * Supabase와 Clerk 인증을 모두 지원하며, 환경에 따라 적절한 방식을 선택
 */
export async function requireAdminAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // 1. 개발 환경에서 특별 관리자 계정 확인 (환경변수로 제어)
    if (process.env.NODE_ENV === 'development' && process.env.DEV_ADMIN_BYPASS === 'true') {
      const authHeader = request.headers.get('authorization')
      if (authHeader === `Bearer ${process.env.DEV_ADMIN_TOKEN}`) {
        log.debug('Development admin bypass used')
        return {
          success: true,
          user: {
            id: 'dev-admin',
            email: 'dev@admin.local',
            role: 'admin',
            permissions: ['*']
          }
        }
      }
    }

    // 2. Clerk 인증 시도
    try {
      const auth = getAuth(request)
      if (auth.userId) {
        const claims = auth.sessionClaims as any
        
        // 관리자 권한 확인
        if (claims?.publicMetadata?.role === 'admin') {
          return {
            success: true,
            user: {
              id: auth.userId,
              email: claims.email || '',
              role: 'admin',
              permissions: claims.publicMetadata?.permissions || ['admin']
            }
          }
        }
        
        return {
          success: false,
          error: 'Insufficient permissions',
          statusCode: 403
        }
      }
    } catch (clerkError) {
      log.debug('Clerk authentication failed', { error: clerkError })
    }

    // 3. Supabase 인증 시도 (Bearer 토큰)
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
        const supabase = ensureSupabase()
        const { data: { user }, error } = await supabase.auth.getUser(token)
        
        if (error || !user) {
          return {
            success: false,
            error: 'Invalid token',
            statusCode: 401
          }
        }

        // 사용자 권한 확인
        const { data: profile } = await supabase
          .from('users')
          .select('role, permissions')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'admin') {
          return {
            success: false,
            error: 'Insufficient permissions',
            statusCode: 403
          }
        }

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email || '',
            role: profile.role,
            permissions: profile.permissions || ['admin']
          }
        }
      } catch (supabaseError) {
        log.debug('Supabase authentication failed', { error: supabaseError })
      }
    }

    // 4. 모든 인증 방법 실패
    return {
      success: false,
      error: 'Authentication required',
      statusCode: 401
    }

  } catch (error) {
    log.error('Authentication middleware error', error)
    return {
      success: false,
      error: 'Internal authentication error',
      statusCode: 500
    }
  }
}

/**
 * API 라우트용 인증 래퍼
 */
export function withAuth(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await requireAdminAuth(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
          code: 'AUTH_FAILED'
        },
        { status: authResult.statusCode || 401 }
      )
    }

    // 요청 로깅
    log.info('Authenticated API request', {
      method: request.method,
      url: request.url,
      userId: authResult.user!.id,
      userRole: authResult.user!.role
    })

    return handler(request, authResult.user!)
  }
}

/**
 * 특정 권한 확인
 */
export function requirePermission(permission: string) {
  return (user: AuthUser): boolean => {
    return user.permissions.includes('*') || user.permissions.includes(permission)
  }
}
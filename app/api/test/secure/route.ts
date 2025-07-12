import { createAdminAPI, type SecureAPIContext } from '@/lib/security/secure-api'
import { NextResponse } from 'next/server'

/**
 * 보안 시스템 테스트용 API 엔드포인트
 * 관리자 권한과 강력한 보안 설정 적용
 */
async function handler({ user, request }: SecureAPIContext) {
  const method = request.method
  
  switch (method) {
    case 'GET':
      return NextResponse.json({
        success: true,
        message: 'Secure API test successful',
        data: {
          timestamp: new Date().toISOString(),
          user: {
            id: user?.id,
            email: user?.email,
            role: user?.role,
            permissions: user?.permissions
          },
          security: {
            authenticated: !!user,
            rateLimited: true,
            auditLogged: true,
            secureHeaders: true
          }
        }
      })
      
    case 'POST':
      const body = await request.json().catch(() => ({}))
      
      return NextResponse.json({
        success: true,
        message: 'Secure POST request processed',
        data: {
          received: body,
          processedBy: user?.email,
          timestamp: new Date().toISOString()
        }
      })
      
    default:
      return NextResponse.json(
        {
          success: false,
          error: 'Method not allowed',
          allowedMethods: ['GET', 'POST']
        },
        { status: 405 }
      )
  }
}

// 관리자 전용 보안 API로 래핑
export const GET = createAdminAPI(handler)
export const POST = createAdminAPI(handler)
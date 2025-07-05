import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isDev = process.env.NODE_ENV === 'development'
  
  // 개발 환경에서 요청 로깅
  if (isDev && process.env.ENABLE_CONSOLE_LOGS === 'true') {
    console.log(`🔍 [${new Date().toISOString()}] ${request.method} ${pathname}`)
  }

  // 정적 파일들은 바로 통과
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // 개발 환경에서 CORS 헤더 추가
  const response = NextResponse.next()
  
  if (isDev) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  // 관리자 페이지 접근 확인
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지와 개발 로그인 페이지는 제외
    if (pathname === '/admin/login' || pathname === '/admin/dev-login') {
      return response
    }

    // 개발 모드에서 관리자 권한 체크 우회 (보안 주의!)
    if (isDev && process.env.DEV_ADMIN_MODE === 'true') {
      console.warn('⚠️  개발 모드: 관리자 권한 체크 우회됨')
      return response
    }

    // 클라이언트 사이드에서 인증 상태를 확인하도록 허용
    // 실제 인증 체크는 AdminProtectedRoute 컴포넌트에서 수행
    return response
  }

  // 개발 환경에서 성능 헤더 추가
  if (isDev) {
    response.headers.set('X-Dev-Mode', 'true')
    response.headers.set('X-Build-Time', new Date().toISOString())
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 
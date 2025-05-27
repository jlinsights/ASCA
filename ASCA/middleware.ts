import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 관리자 페이지 접근 확인
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지와 개발 로그인 페이지는 제외
    if (pathname === '/admin/login' || pathname === '/admin/dev-login') {
      return NextResponse.next()
    }

    // 클라이언트 사이드에서 인증 상태를 확인하도록 허용
    // 실제 인증 체크는 AdminProtectedRoute 컴포넌트에서 수행
    return NextResponse.next()
  }

  return NextResponse.next()
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
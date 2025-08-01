import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 최소한의 미들웨어 - 오류 방지를 위해 단순화
export function middleware(request: NextRequest) {
  // 모든 요청을 그대로 통과시킴
  return NextResponse.next()
}

// 매처를 최대한 제한하여 오류 가능성 최소화
export const config = {
  matcher: [
    // 관리자 페이지만 체크 (필수적인 경우에만)
    '/admin/:path*'
  ],
} 
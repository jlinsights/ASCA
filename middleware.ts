import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditLogger } from '@/lib/security/audit-logger'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const WEBHOOK_PATH = /^\/api\/webhooks\//

const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/admin(.*)',
  '/members/apply(.*)',
  '/exhibitions/create(.*)',
  '/contests/(.*)/apply',
  '/commissioning-application(.*)',
])

async function securityMiddleware(request: NextRequest) {
  // [1] CSRF Origin guard — Clerk auth 이전 (callback 첫 줄, design §2.1.1).
  //
  // Clerk SDK 가 callback 진입 전 세션 쿠키를 파싱하지만 redirect/401 같은
  // 부수효과는 auth.protect() 호출 시에만 발생. early return 으로 그 호출을
  // 차단하므로 cross-site 요청은 Clerk 영향 없이 403 종료된다.
  if (MUTATING_METHODS.has(request.method) && !WEBHOOK_PATH.test(new URL(request.url).pathname)) {
    const result = checkOrigin(request)
    if (!result.ok) {
      auditLogger.logCSRFOriginMismatch(request, result)
      return NextResponse.json(
        {
          success: false,
          error: 'CSRF origin validation failed',
          code: 'CSRF_ORIGIN_MISMATCH',
        },
        { status: 403 }
      )
    }
  }

  return NextResponse.next()
}

const clerkSecurityMiddleware = clerkMiddleware(async (auth, request) => {
  const originGuard = await securityMiddleware(request)
  if (originGuard.status !== 200) {
    return originGuard
  }

  // [2] Clerk auth — 기존 동작 유지
  if (isProtectedRoute(request)) {
    await auth.protect()
  }

  return
})

export default process.env.NEXT_PUBLIC_E2E_DISABLE_CLERK === 'true'
  ? securityMiddleware
  : clerkSecurityMiddleware

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditLogger } from '@/lib/security/audit-logger'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const WEBHOOK_PATH = /^\/api\/webhooks\//
const IS_E2E_TEST = process.env.NODE_ENV === 'test' || Boolean(process.env.PLAYWRIGHT_BASE_URL)

const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/admin(.*)',
  // /members 는 Rails API 를 부르는 미완성 관리 화면(회원 목록·상태 필터)이라 공개하지 않는다
  '/members(.*)',
  '/exhibitions/create(.*)',
  '/contests/(.*)/apply',
  // /commissioning-application(위원 위촉 지원)은 공개 — 자격·수당 안내와 공개 Tally 양식뿐이라
  // 로그인 벽이 지원자만 돌려보낸다(옛 사이트도 공개). 2026-10-24 메뉴에 올리면서 뺐다.
])

function enforceOrigin(request: NextRequest) {
  // [1] CSRF Origin guard — Clerk auth 이전 (callback 첫 줄, design §2.1.1).
  //
  // Clerk SDK 가 callback 진입 전 세션 쿠키를 파싱하지만 redirect/401 같은
  // 부수효과는 auth.protect() 호출 시에만 발생. early return 으로 그 호출을
  // 차단하므로 cross-site 요청은 Clerk 영향 없이 403 종료된다.
  if (MUTATING_METHODS.has(request.method) && !WEBHOOK_PATH.test(request.nextUrl.pathname)) {
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

  return undefined
}

async function e2eProxy(request: NextRequest) {
  return enforceOrigin(request)
}

const clerkProxy = clerkMiddleware(async (auth, request) => {
  const originResponse = enforceOrigin(request)
  if (originResponse) return originResponse

  // [2] Clerk auth — 기존 동작 유지
  if (isProtectedRoute(request)) {
    await auth.protect()
  }

  return
})

export const proxy = IS_E2E_TEST ? e2eProxy : clerkProxy

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

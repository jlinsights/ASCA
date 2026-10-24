import { NextRequest, NextResponse } from 'next/server'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditLogger } from '@/lib/security/audit-logger'
import { refreshSupabaseSession } from '@/lib/auth/supabase/session'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const PROTECTED =
  /^\/(?:profile|admin|members|exhibitions\/create|artworks\/upload)(?:\/|$)|^\/contests\/[^/]+\/apply(?:\/|$)/

export async function proxy(request: NextRequest) {
  if (
    MUTATING_METHODS.has(request.method) &&
    !request.nextUrl.pathname.startsWith('/api/webhooks/')
  ) {
    const result = checkOrigin(request)
    if (!result.ok) {
      auditLogger.logCSRFOriginMismatch(request, result)
      return NextResponse.json(
        { success: false, error: 'CSRF origin validation failed', code: 'CSRF_ORIGIN_MISMATCH' },
        { status: 403 }
      )
    }
  }
  // Exchange the PKCE code before getUser can clear an expired session and its verifier.
  if (request.method === 'GET' && request.nextUrl.pathname === '/auth/callback') {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.append('Vary', 'Cookie')
    return response
  }
  try {
    const { user, applySession } = await refreshSupabaseSession(request)
    if (!user && PROTECTED.test(request.nextUrl.pathname)) {
      const url = new URL('/sign-in', request.url)
      url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
      return applySession(NextResponse.redirect(url))
    }
    return applySession()
  } catch {
    return NextResponse.json(
      { error: 'AUTH_UNAVAILABLE' },
      {
        status: 503,
        headers: { 'Cache-Control': 'private, no-store' },
      }
    )
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

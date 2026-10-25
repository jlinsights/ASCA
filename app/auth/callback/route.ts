import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeAuthRedirect } from '@/lib/auth/supabase/redirect'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = safeAuthRedirect(request.nextUrl.searchParams.get('next'))
  if (code && !request.nextUrl.searchParams.has('error')) {
    try {
      const client = await createClient({ writable: true })
      const { error } = await client.auth.exchangeCodeForSession(code)
      if (!error) {
        const response = NextResponse.redirect(new URL(next, request.url), 303)
        response.headers.set('Cache-Control', 'private, no-store')
        return response
      }
    } catch {
      /* Do not expose provider responses, codes or cookies in the redirect. */
    }
  }
  const recovery = next.split('?')[0] === '/reset-password'
  const response = NextResponse.redirect(
    new URL(recovery ? '/forgot-password?error=callback' : '/sign-in?error=callback', request.url),
    303
  )
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

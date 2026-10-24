import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeAuthRedirect } from '@/lib/auth/supabase/redirect'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (code && !request.nextUrl.searchParams.has('error')) {
    const client = await createClient({ writable: true })
    const { error } = await client.auth.exchangeCodeForSession(code)
    if (!error) {
      const next = safeAuthRedirect(request.nextUrl.searchParams.get('next'))
      const response = NextResponse.redirect(new URL(next, request.url), 303)
      response.headers.set('Cache-Control', 'private, no-store')
      return response
    }
  }
  const response = NextResponse.redirect(new URL('/sign-in?error=callback', request.url), 303)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

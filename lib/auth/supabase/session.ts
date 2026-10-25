import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { AccountAuthError, isInvalidSession } from './errors'

/** Keep refreshed cookies both on the forwarded request and on every response. */
export async function refreshSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { secure: process.env.NODE_ENV === 'production' },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: values => {
          values.forEach(({ name, value }) => request.cookies.set(name, value))
          const previous = response.cookies.getAll()
          response = NextResponse.next({ request })
          previous.forEach(cookie => response.cookies.set(cookie))
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data, error } = await client.auth.getUser()
  if (error && !isInvalidSession(error)) throw new AccountAuthError('AUTH_UNAVAILABLE', 503)

  function applySession(target: NextResponse = response) {
    if (target !== response) response.cookies.getAll().forEach(cookie => target.cookies.set(cookie))
    target.headers.set('Cache-Control', 'private, no-store')
    target.headers.append('Vary', 'Cookie')
    return target
  }
  return { user: error ? null : data.user, applySession }
}

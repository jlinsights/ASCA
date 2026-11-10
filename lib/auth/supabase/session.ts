import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { AccountAuthError, isInvalidSession } from './errors'
import { LOCALE_HEADER } from '@/lib/i18n/locale-routing'
import type { Language } from '@/lib/i18n/types'

export interface SessionForwardOptions {
  /** 언어 접두사를 뗀 내부 주소(/en/history → /history). 없으면 그대로 넘긴다 */
  rewrite?: URL
  /** 서버 컴포넌트에 넘길 언어. 한국어면 헤더를 달지 않는다 */
  language?: Language
}

/**
 * 넘길 요청 헤더. 들어온 언어 헤더는 늘 지운다 — 방문자가 직접 보낸 값으로 한국어 주소가
 * 다른 언어로 그려지지 않게 한다. 쿠키는 request.cookies.set 이 request.headers 에 써 둔 값을 복사한다.
 */
function forwardHeaders(request: NextRequest, language: Language | undefined): Headers {
  const headers = new Headers(request.headers)
  headers.delete(LOCALE_HEADER)
  if (language && language !== 'ko') headers.set(LOCALE_HEADER, language)
  return headers
}

/** Keep refreshed cookies both on the forwarded request and on every response. */
export async function refreshSupabaseSession(
  request: NextRequest,
  { rewrite, language }: SessionForwardOptions = {}
) {
  const forward = () => {
    const init = { request: { headers: forwardHeaders(request, language) } }
    return rewrite ? NextResponse.rewrite(rewrite, init) : NextResponse.next(init)
  }
  let response = forward()
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
          response = forward()
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

import type { NextRequest, NextResponse } from 'next/server'
import {
  AUTO_LOCALE_COOKIE,
  isLocalizedPath,
  languageFromCookie,
  localizePath,
  LOCALE_COOKIE,
  PREFIXED_LANGUAGES,
  splitLocale,
} from './locale-routing'
import type { Language } from './types'
import { firstVisitLanguage } from './first-visit-language'

/** proxy 가 언어 주소를 어떻게 처리할지 */
export type LocaleDecision =
  /** 다른 주소로 보낸다(307 — 번역 페이지 목록이 늘면 바뀔 수 있어 영구 리다이렉트를 쓰지 않는다) */
  | { kind: 'redirect'; location: URL; firstVisit?: boolean }
  /** /en/history 를 /history 로 내부에서 그리고 언어를 헤더로 넘긴다 */
  | { kind: 'rewrite'; rewrite: URL; language: Language; path: string }
  /** 한국어 주소 그대로 */
  | { kind: 'pass'; path: string }

const READ_METHODS = new Set(['GET', 'HEAD'])

function savedLanguage(request: NextRequest): Language | null {
  const value = request.cookies.get(LOCALE_COOKIE)?.value
  return value && (PREFIXED_LANGUAGES as readonly string[]).includes(value)
    ? (value as Language)
    : null
}

/**
 * - /en/<번역 페이지>      → 내부 rewrite + 언어 헤더
 * - /en/<번역 안 된 페이지> → 한국어 주소로 307 (번역 안 된 사본을 만들지 않는다)
 * - 한국어 주소 + 언어 선택 쿠키(en·ja·zh) + 번역 페이지 → 그 언어 주소로 307.
 *   본문 곳곳의 링크가 아직 한국어 주소라, 영어를 고른 방문자가 링크를 눌러도 영어에 머물게 한다.
 *   검색 로봇은 쿠키가 없어 이 리다이렉트를 받지 않는다.
 * - 쿠키 없는 첫 방문 `/` → 브라우저 언어·국가가 en·ja·zh 면 그 언어 홈으로 307(lib/i18n/first-visit-language.ts).
 *   검색 로봇·링크 미리보기는 제외. 이동한 언어 주소에서 rememberLocale 이 쿠키를 남겨 다음부터는 판단하지 않는다.
 * 읽기(GET·HEAD)만 보낸다. 다른 메서드는 주소를 바꾸지 않는다.
 */
export function decideLocale(request: NextRequest): LocaleDecision {
  const { pathname, search } = request.nextUrl
  const split = splitLocale(pathname)
  const isRead = READ_METHODS.has(request.method)

  if (split.prefixed) {
    if (!isLocalizedPath(split.path)) {
      if (!isRead) return { kind: 'pass', path: split.path }
      return { kind: 'redirect', location: new URL(split.path + search, request.url) }
    }
    return {
      kind: 'rewrite',
      rewrite: new URL(split.path + search, request.url),
      language: split.language,
      path: split.path,
    }
  }

  // 첫 방문 홈 — 언어를 고른 적이 없으면(쿠키 없음, 한국어 선택도 쿠키 'ko' 로 남는다) 브라우저 언어·국가로 정한다
  if (
    isRead &&
    pathname === '/' &&
    !languageFromCookie(request.cookies.get(LOCALE_COOKIE)?.value)
  ) {
    const first = firstVisitLanguage({
      userAgent: request.headers.get('user-agent'),
      acceptLanguage: request.headers.get('accept-language'),
      country: request.headers.get('x-vercel-ip-country'),
    })
    if (first && first !== 'ko') {
      return {
        kind: 'redirect',
        location: new URL(localizePath('/', first) + search, request.url),
        firstVisit: true,
      }
    }
  }

  const saved = isRead ? savedLanguage(request) : null
  if (saved && isLocalizedPath(pathname)) {
    return {
      kind: 'redirect',
      location: new URL(localizePath(pathname, saved) + search, request.url),
    }
  }
  return { kind: 'pass', path: pathname }
}

/**
 * 언어 주소(/en·/ja·/zh)로 그린 응답에 그 언어를 쿠키로 남긴다. 쿠키 없이 /en 에 들어온 방문자가
 * 본문 링크(아직 한국어 주소)를 누르면 한국어로, 예전 쿠키가 다른 언어면 그 언어로 바뀌던 문제를 막는다.
 * 검색 로봇은 쿠키를 지니지 않아 한국어 주소가 그대로 색인된다.
 */
export function rememberLocale(
  request: NextRequest,
  response: NextResponse,
  language: Language
): NextResponse {
  if (request.cookies.get(LOCALE_COOKIE)?.value === language) return response
  response.cookies.set(LOCALE_COOKIE, language, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}

/** 첫 방문 자동 판단 리다이렉트에 표시 쿠키를 단다(AUTO_LOCALE_COOKIE) */
export function markFirstVisit(response: NextResponse): NextResponse {
  response.cookies.set(AUTO_LOCALE_COOKIE, '1', {
    path: '/',
    maxAge: 60,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}

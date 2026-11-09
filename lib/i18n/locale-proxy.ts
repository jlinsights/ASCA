import type { NextRequest } from 'next/server'
import {
  isLocalizedPath,
  localizePath,
  LOCALE_COOKIE,
  PREFIXED_LANGUAGES,
  splitLocale,
} from './locale-routing'
import type { Language } from './types'

/** proxy 가 언어 주소를 어떻게 처리할지 */
export type LocaleDecision =
  /** 다른 주소로 보낸다(307 — 번역 페이지 목록이 늘면 바뀔 수 있어 영구 리다이렉트를 쓰지 않는다) */
  | { kind: 'redirect'; location: URL }
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

  const saved = isRead ? savedLanguage(request) : null
  if (saved && isLocalizedPath(pathname)) {
    return {
      kind: 'redirect',
      location: new URL(localizePath(pathname, saved) + search, request.url),
    }
  }
  return { kind: 'pass', path: pathname }
}

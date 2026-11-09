import { REGULATIONS, regulationHref, REGULATIONS_BASE_PATH } from '@/lib/regulations/catalog'
import type { Language } from './types'

/**
 * 언어별 주소 — 한국어는 지금 주소 그대로(/history), 나머지는 접두사(/en/history·/ja/history·/zh/history).
 * 사용자 결정(2026-11-09): 한국어 주소를 바꾸지 않아 기존 검색 순위를 지킨다.
 *
 * 동작: proxy.ts 가 /en/history 를 /history 로 **내부 rewrite** 하고 요청 헤더(LOCALE_HEADER)에 언어를 싣는다.
 * 루트 레이아웃이 그 헤더로 <html lang> 과 첫 렌더 언어를 정한다. 그래서 모든 페이지가 요청 시점 렌더(ƒ)여야 한다 —
 * 2026-11-09 빌드 기준 99개 경로가 이미 전부 ƒ 다. 나중에 페이지를 정적(○)으로 만들려면 app/[lang]/ 폴더 구조로 옮겨야 한다.
 */

/** 접두사를 다는 언어. 한국어(ko)는 접두사가 없다 */
export const PREFIXED_LANGUAGES = ['en', 'ja', 'zh'] as const
export type PrefixedLanguage = (typeof PREFIXED_LANGUAGES)[number]

/** proxy → 서버 컴포넌트로 언어를 넘기는 요청 헤더. proxy 가 들어온 값을 늘 지우고 다시 단다(위조 방지) */
export const LOCALE_HEADER = 'x-asca-lang'

/** 방문자가 언어 선택기에서 고른 언어. proxy 가 읽으므로 localStorage 가 아니라 쿠키다 */
export const LOCALE_COOKIE = 'asca-lang'

/** <html lang> · hreflang 값. 중국어는 번체다(lib/i18n/simplified-only.ts) */
export const HTML_LANG: Record<Language, string> = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  zh: 'zh-Hant',
}

/**
 * 언어별 주소를 여는 페이지. 화면이 실제로 번역된 곳만 넣는다 — 2026-11-09 운영 사이트를 영어로 열어
 * 본문에 남은 한글을 센 결과(대부분 0, 많아도 3% 이하). 여기 없는 페이지(약관·블로그 글·작가 상세·
 * 임원·유관단체·사업계획 등)는 /en 주소로 오면 한국어 주소로 보낸다 — 번역 안 된 사본을 언어마다 만들지 않는다.
 */
const LOCALIZED_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/introductions',
  '/history',
  '/mission',
  '/greetings',
  '/brand',
  '/membership',
  '/fundraising',
  '/academy',
  '/contests',
  '/contests/23',
  '/awards',
  '/application',
  '/application-for-recommended-invited-calligrapher',
  '/commissioning-application',
  '/exhibitions',
  '/exhibitions/current',
  '/exhibitions/upcoming',
  '/exhibitions/past',
  '/exhibitions/online',
  '/contact',
  '/artists/homepages',
  '/notice',
  '/faq',
  '/community',
  REGULATIONS_BASE_PATH,
  ...REGULATIONS.map(entry => regulationHref(entry.slug)),
])

const isPrefixedLanguage = (value: string): value is PrefixedLanguage =>
  (PREFIXED_LANGUAGES as readonly string[]).includes(value)

/** 끝 슬래시를 떼어 비교한다('/' 는 그대로) */
const normalize = (path: string): string =>
  path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path

export function isLocalizedPath(path: string): boolean {
  return LOCALIZED_PATHS.has(normalize(path))
}

/** 언어별 주소를 여는 고정 페이지 목록(사이트맵·hreflang 용) */
export function localizedPaths(): string[] {
  return [...LOCALIZED_PATHS]
}

export interface LocaleSplit {
  language: Language
  /** 접두사를 뗀 경로. /en → '/', /en/history → '/history' */
  path: string
  prefixed: boolean
}

/** '/en/history' → { language: 'en', path: '/history', prefixed: true }. 접두사가 없으면 한국어 */
export function splitLocale(pathname: string): LocaleSplit {
  const match = /^\/([a-z]{2})(?=\/|$)(.*)$/.exec(pathname)
  if (match && isPrefixedLanguage(match[1]!)) {
    return { language: match[1], path: match[2] || '/', prefixed: true }
  }
  return { language: 'ko', path: pathname, prefixed: false }
}

/**
 * 그 언어의 주소. 한국어이거나 번역되지 않은 페이지면 한국어 주소 그대로.
 * 쿼리·해시는 붙은 채로 둔다. 외부 주소·mailto·tel·#해시는 건드리지 않는다.
 */
export function localizePath(href: string, language: Language): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href
  const cut = href.search(/[?#]/)
  const pathname = cut === -1 ? href : href.slice(0, cut)
  const rest = cut === -1 ? '' : href.slice(cut)
  const { path } = splitLocale(pathname)
  if (language === 'ko' || !isLocalizedPath(path)) return path + rest
  return `/${language}${path === '/' ? '' : normalize(path)}${rest}`
}

/** 헤더 값 검증 — 모르는 값이면 한국어 */
export function languageFromHeader(value: string | null | undefined): Language {
  return value && isPrefixedLanguage(value) ? value : 'ko'
}

/** 쿠키 값 검증 — 네 언어 중 하나가 아니면 null */
export function languageFromCookie(value: string | null | undefined): Language | null {
  return value === 'ko' || (value != null && isPrefixedLanguage(value)) ? (value as Language) : null
}

/**
 * 브라우저 주소에서 화면 언어를 정한다. 접두사가 있으면 그 언어, 번역된 한국어 주소면 한국어.
 * 번역 안 된 페이지(약관·블로그 글 등)는 주소가 늘 한국어라, 방문자가 고른 언어(쿠키)로 머리말·꼬리말만 바꾼다.
 */
export function clientLanguageFor(pathname: string, saved: Language | null): Language {
  const split = splitLocale(pathname)
  if (split.prefixed) return split.language
  if (isLocalizedPath(split.path)) return 'ko'
  return saved ?? 'ko'
}

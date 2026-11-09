import type { Language } from './types'

/**
 * 첫 방문(언어를 고른 적 없음)에 홈 `/` 을 어느 언어로 보여 줄지.
 * 순서(사용자 결정 2026-11-08): 브라우저 언어 > 접속 국가 > 영어. 고른 언어(쿠키)는 이보다 앞서고 proxy 가 따로 본다.
 * 검색 로봇·링크 미리보기는 늘 한국어 `/` 를 받는다 — 국가에 따라 다른 언어를 주면 미국에서 크롤하는
 * Google 이 홈을 영어로 색인한다. 언어별 홈은 /en·/ja·/zh 주소와 hreflang 으로 따로 알린다.
 */

/** 검색 로봇·링크 미리보기·자동화 도구. UA 가 없으면 사람이 아닌 것으로 본다 */
const NON_HUMAN_AGENT =
  /bot\b|bot\/|crawl|spider|slurp|yeti|daum|baidu|yandex|bingpreview|facebookexternalhit|facebot|kakaotalk-scrap|kakaostory-og|slack|twitter|whatsapp|telegram|discord|linkedin|pinterest|embedly|preview|lighthouse|pagespeed|headless|curl|wget|python-requests|httpclient/i

export function isNonHumanAgent(userAgent: string | null | undefined): boolean {
  return !userAgent || NON_HUMAN_AGENT.test(userAgent)
}

const SUPPORTED: Record<string, Language> = { ko: 'ko', en: 'en', ja: 'ja', zh: 'zh' }

/** Accept-Language 에서 지원하는 첫 언어(q 값 순). 중국어는 지역과 상관없이 번체 화면(zh) */
export function languageFromAcceptLanguage(header: string | null | undefined): Language | null {
  if (!header) return null
  const ranked = header
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';')
      const q = params.map(p => p.trim()).find(p => p.startsWith('q='))
      const weight = q ? Number(q.slice(2)) : 1
      return { primary: tag.trim().toLowerCase().split('-')[0] ?? '', weight, index }
    })
    .filter(item => item.primary && Number.isFinite(item.weight) && item.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index)
  for (const item of ranked) {
    const language = SUPPORTED[item.primary]
    if (language) return language
  }
  return null
}

const COUNTRY_LANGUAGE: Record<string, Language> = {
  KR: 'ko',
  JP: 'ja',
  CN: 'zh',
  TW: 'zh',
  HK: 'zh',
  MO: 'zh',
}

/** 접속 국가(Vercel 의 x-vercel-ip-country) — 한·일·중화권이 아니면 영어 */
export function languageFromCountry(country: string | null | undefined): Language | null {
  if (!country) return null
  return COUNTRY_LANGUAGE[country.toUpperCase()] ?? 'en'
}

export interface FirstVisitSignals {
  userAgent: string | null
  acceptLanguage: string | null
  country: string | null
}

/**
 * 첫 방문 언어. 판단할 신호가 없으면(로컬 개발 등 국가 헤더도 브라우저 언어도 없음) null — 한국어 그대로.
 * 브라우저 언어가 있지만 지원하지 않는 언어(프랑스어 등)면 국가로, 국가도 모르면 영어.
 */
export function firstVisitLanguage(signals: FirstVisitSignals): Language | null {
  if (isNonHumanAgent(signals.userAgent)) return null
  const fromBrowser = languageFromAcceptLanguage(signals.acceptLanguage)
  if (fromBrowser) return fromBrowser
  const fromCountry = languageFromCountry(signals.country)
  if (fromCountry) return fromCountry
  return signals.acceptLanguage ? 'en' : null
}

import type { Metadata } from 'next'
import { headers } from 'next/headers'
import {
  HTML_LANG,
  isLocalizedPath,
  languageFromHeader,
  LOCALE_HEADER,
  localizePath,
  PREFIXED_LANGUAGES,
} from '@/lib/i18n/locale-routing'
import type { Language } from '@/lib/i18n/types'
import { defaultSEO } from '@/lib/seo-constants'
import { LOCALIZED_PAGE_COPY, type PageCopy } from './localized-page-copy'

/**
 * 언어 주소(/en·/ja·/zh)의 메타데이터 — 제목·설명은 그 언어로, canonical 은 그 언어 주소 자신으로,
 * hreflang(alternates.languages)은 네 언어와 x-default(한국어)를 서로 가리킨다.
 * 예전엔 /en/history 가 영어 본문을 보내면서 canonical 을 /history 로 달아 "한국어의 사본"이라고 알렸다
 * (Codex 리뷰 #263 P2).
 */

/** 제목 뒤에 붙는 협회 이름 — 화면 번역표(artGalleryExhibition 등)와 같은 표기 */
export const SITE_NAME: Record<Language, string> = {
  ko: '동양서예협회',
  en: 'ASCA',
  ja: '東洋書道協会',
  zh: '東洋書藝協會',
}

/** og:locale */
export const OG_LOCALE: Record<Language, string> = {
  ko: 'ko_KR',
  en: 'en_US',
  ja: 'ja_JP',
  zh: 'zh_TW',
}

/** 네 언어 주소와 x-default(한국어). 번역 안 된 페이지는 한국어 주소 하나뿐이라 달지 않는다 */
export function languageAlternates(path: string): Record<string, string> | undefined {
  if (!isLocalizedPath(path)) return undefined
  const entries: Array<[string, string]> = [
    [HTML_LANG.ko, path],
    ...PREFIXED_LANGUAGES.map((lang): [string, string] => [
      HTML_LANG[lang],
      localizePath(path, lang),
    ]),
    ['x-default', path],
  ]
  return Object.fromEntries(entries)
}

/**
 * 한국어 metadata(각 page.tsx 의 원본)를 그 언어로 바꾼다. 한국어면 제목·설명은 그대로 두고
 * canonical·hreflang 만 단다. copy 가 없으면(번역표 누락) 한국어 제목을 쓰지 않도록 테스트가 막는다.
 */
export function localizeMetadata(
  base: Metadata,
  path: string,
  language: Language,
  copy: PageCopy | undefined = language === 'ko' ? undefined : LOCALIZED_PAGE_COPY[path]?.[language]
): Metadata {
  const canonical = localizePath(path, language)
  const alternates: Metadata['alternates'] = {
    ...base.alternates,
    canonical,
    ...(languageAlternates(path) ? { languages: languageAlternates(path) } : {}),
  }
  if (language === 'ko' || !copy) return { ...base, alternates }

  // 홈 제목은 이미 협회 이름이 앞에 있다 — 이름을 두 번 달지 않는다
  const title = path === '/' ? copy.title : `${copy.title} | ${SITE_NAME[language]}`
  const description = copy.description
  return {
    ...base,
    title,
    description,
    alternates,
    // 메타데이터 필드는 상위(루트 레이아웃)와 얕게 바뀐다 — 새 openGraph·twitter 객체가 루트의 공유 이미지·
    // 큰 카드를 통째로 지우지 않게 기본값을 먼저 깐다(Codex 리뷰 #264 P2). 페이지가 단 값이 그 위에 온다
    openGraph: {
      type: 'website',
      siteName: defaultSEO.siteName,
      images: [{ url: defaultSEO.image, width: 1200, height: 630, alt: title }],
      ...base.openGraph,
      title,
      description,
      url: canonical,
      locale: OG_LOCALE[language],
    },
    twitter: {
      card: 'summary_large_image',
      images: [defaultSEO.image],
      ...base.twitter,
      title,
      description,
    },
  }
}

/** 요청 언어(proxy 가 단 헤더) */
export async function requestLanguage(): Promise<Language> {
  return languageFromHeader((await headers()).get(LOCALE_HEADER))
}

/**
 * 번역된 고정 페이지의 generateMetadata. page.tsx 에서
 *   export const generateMetadata = localizedPageMetadata('/history', metadata)
 * 처럼 한국어 metadata 를 넘긴다.
 */
export function localizedPageMetadata(path: string, base: Metadata): () => Promise<Metadata> {
  return async () => localizeMetadata(base, path, await requestLanguage())
}

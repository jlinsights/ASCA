/**
 * 자주 묻는 질문의 언어별 화면 — 원문(site-faq.ts, 한국어)이 단일 출처이고, 번역은 id 로 붙는다.
 * 근거 링크 주소는 원문에서 그대로 쓰고 이름만 바꾼다. 원문을 고치면 번역 세 벌도 같이 고친다
 * (금액과 근거 개수는 테스트가 원문과 맞춰 본다).
 */

import type { Language } from '@/lib/i18n/types'
import { SITE_FAQ, type FaqItem } from './site-faq'
import { SITE_FAQ_EN } from './site-faq-en'
import { SITE_FAQ_JA } from './site-faq-ja'
import { SITE_FAQ_ZH } from './site-faq-zh'

export interface FaqTranslation {
  q: string
  a: string
  /** 원문 sources 와 같은 순서의 링크 이름 */
  sources?: readonly string[]
}

export type FaqTranslations = Readonly<Record<string, FaqTranslation>>

export const SITE_FAQ_TRANSLATIONS: Record<Exclude<Language, 'ko'>, FaqTranslations> = {
  en: SITE_FAQ_EN,
  ja: SITE_FAQ_JA,
  zh: SITE_FAQ_ZH,
}

/** 번역이 없으면 원문(한국어)을 돌려주고 translated=false 로 알린다 — 화면은 lang='ko' 를 단다 */
export function localizeFaqItem(item: FaqItem, lang: Language): FaqItem & { translated: boolean } {
  if (lang === 'ko') return { ...item, translated: true }
  const translation = item.id ? SITE_FAQ_TRANSLATIONS[lang][item.id] : undefined
  if (!translation) return { ...item, translated: false }
  return {
    ...item,
    q: translation.q,
    a: translation.a,
    ...(item.sources && {
      sources: item.sources.map((source, index) => ({
        ...source,
        label: translation.sources?.[index] ?? source.label,
      })),
    }),
    translated: true,
  }
}

export const localizedSiteFaq = (lang: Language) =>
  SITE_FAQ.map(item => localizeFaqItem(item, lang))

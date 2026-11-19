import type { PrefixedLanguage } from '@/lib/i18n/locale-routing'
import { regulationsTranslations } from '@/lib/i18n/translations/regulations'
import type { PageCopy } from './localized-page-copy'

/**
 * 규정 상세(/en/regulations/<slug> 등)의 제목·설명. 규정 이름은 화면 번역표(regsName*)를 그대로 쓴다.
 * 서버 전용 — 네 언어 표를 묶은 translations/regulations 를 읽는다.
 */
const DESCRIPTION: Record<PrefixedLanguage, (name: string) => string> = {
  en: name =>
    `The full text of the ${name} of the Asian Society of Calligraphic Arts, article by article.`,
  ja: name => `社団法人 東洋書道協会の${name}の全文を、条文単位でご案内します。`,
  zh: name => `社團法人東洋書藝協會${name}全文，逐條說明。`,
}

export function regulationPageCopy(
  nameKey: string,
  language: PrefixedLanguage
): PageCopy | undefined {
  const name = regulationsTranslations[language]?.[nameKey]
  if (!name) return undefined
  return { title: name, description: DESCRIPTION[language](name) }
}

// 언어별 번역표 로더. 기본 언어(ko)만 처음 번들에 싣고, 나머지는 고를 때 따로 받는다.
// 네 언어를 한꺼번에 불러오는 lib/i18n/translations.ts 는 서버·테스트용이다.
import type { Language } from '../types'
import ko from './ko'
import type { LocaleTable } from './resolve'

export type { LocaleTable } from './resolve'

export const defaultLocaleTable: LocaleTable = ko

const loaders: Record<Exclude<Language, 'ko'>, () => Promise<{ default: LocaleTable }>> = {
  en: () => import('./en'),
  ja: () => import('./ja'),
  zh: () => import('./zh'),
}

const loaded: Partial<Record<Language, LocaleTable>> = { ko }

/** 이미 받아 둔 표. 아직이면 undefined. */
export function getLoadedLocale(language: Language): LocaleTable | undefined {
  return loaded[language]
}

/** 표를 받아 두고 돌려준다. 같은 언어는 한 번만 받는다. */
export async function loadLocale(language: Language): Promise<LocaleTable> {
  const cached = loaded[language]
  if (cached) return cached
  const { default: table } = await loaders[language as Exclude<Language, 'ko'>]()
  loaded[language] = table
  return table
}

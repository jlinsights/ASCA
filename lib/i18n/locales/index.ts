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

/**
 * 서버가 넘긴 표를 받아 둔다. /en·/ja·/zh 주소는 서버가 그 언어로 그리므로, 브라우저도 첫 렌더 전에
 * 같은 표를 갖고 있어야 hydration 이 어긋나지 않는다(루트 레이아웃 → ClientProviders → LanguageProvider).
 */
export function registerLocale(language: Language, table: LocaleTable): void {
  if (!loaded[language]) loaded[language] = table
}

/** 표를 받아 두고 돌려준다. 같은 언어는 한 번만 받는다. */
export async function loadLocale(language: Language): Promise<LocaleTable> {
  const cached = loaded[language]
  if (cached) return cached
  const { default: table } = await loaders[language as Exclude<Language, 'ko'>]()
  loaded[language] = table
  return table
}

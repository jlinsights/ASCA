import type { Language } from './types'

/**
 * 테스트에서 화면 언어를 고른다. 언어는 주소가 정하므로(lib/i18n/locale-routing.ts) jsdom 주소를 그 언어
 * 주소로 바꾼다 — LanguageProvider 가 마운트 뒤 주소를 읽어 그 언어 표를 받고 바꾼다(예전 localStorage 와 같은 흐름).
 * jest.setup.js 가 테스트마다 주소를 '/' 로 되돌린다.
 */
export function setTestLanguage(language: Language | string): void {
  window.history.replaceState(null, '', language === 'ko' ? '/' : `/${language}`)
}

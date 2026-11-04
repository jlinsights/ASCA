// 네 언어 정적 번역표를 한데 모은다 — 서버·테스트용이다. 화면(클라이언트)은 이 파일 대신
// lib/i18n/locales 의 언어별 표를 쓰므로, 이 파일을 클라이언트 코드에서 불러오지 말 것.
import type { Language, TranslationData } from './types'
import ko from './locales/ko/static'
import en from './locales/en/static'
import ja from './locales/ja/static'
import zh from './locales/zh/static'

export const translations: TranslationData = { ko, en, ja, zh }

// 번역 함수
export const getTranslation = (language: Language, key: string): string => {
  const translation = translations[language]?.[key]
  if (translation) {
    return translation
  }

  // 폴백: 한국어로 시도
  const fallback = translations.ko[key]
  if (fallback) {
    return fallback
  }

  // 마지막 폴백: 키 자체 반환
  return key
}

// 번역 타입 (타입 안전성)
export type TranslationKey = keyof typeof translations.ko

// 클라이언트용 동기 번역 함수 (하위 호환성)
export const t = (key: TranslationKey | string, language: Language = 'ko'): string => {
  return getTranslation(language, key)
}

export default translations

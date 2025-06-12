import type { Language, TranslationData } from './types'
import { navigationTranslations } from './translations/navigation'
import { artworksTranslations } from './translations/artworks'

// 모든 번역 데이터 통합
export const translations: TranslationData = {
  ko: {
    ...navigationTranslations.ko,
    ...artworksTranslations.ko,
  },
  en: {
    ...navigationTranslations.en,
    ...artworksTranslations.en,
  },
  ja: {
    ...navigationTranslations.ja,
    ...artworksTranslations.ja,
  },
  zh: {
    ...navigationTranslations.zh,
    ...artworksTranslations.zh,
  },
}

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

// 지원되는 언어 목록
export const SUPPORTED_LANGUAGES: Language[] = ['ko', 'en', 'ja', 'zh']

// 기본 언어
export const DEFAULT_LANGUAGE: Language = 'ko'

// 브라우저 언어 감지
export const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }
  
  const browserLang = navigator.language.toLowerCase()
  
  // 정확한 매칭 시도
  if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
    return browserLang as Language
  }
  
  // 언어 코드만으로 매칭 시도 (예: ko-KR -> ko)
  const langCode = browserLang.split('-')[0] as Language
  if (SUPPORTED_LANGUAGES.includes(langCode)) {
    return langCode
  }
  
  return DEFAULT_LANGUAGE
}

// 로컬 스토리지 키
export const LANGUAGE_STORAGE_KEY = 'asca-language'

export * from './types' 
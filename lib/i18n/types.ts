// 지원되는 언어 타입
export type Language = 'ko' | 'en' | 'ja' | 'zh'

// 번역 키 네임스페이스
export interface TranslationNamespaces {
  navigation: Record<string, string>
  artworks: Record<string, string>
  common: Record<string, string>
  pages: Record<string, string>
  forms: Record<string, string>
  errors: Record<string, string>
}

// 번역 데이터 구조
export type TranslationData = Record<Language, Record<string, string>>

// 언어 설정 인터페이스
export interface LanguageConfig {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, namespace?: keyof TranslationNamespaces) => string
  isLoading: boolean
  isClient: boolean
}

// 언어별 메타데이터
export interface LanguageMetadata {
  code: Language
  label: string
  flag: string
  dir: 'ltr' | 'rtl'
  locale: string
  fallback?: Language
}

// 번역 캐시 인터페이스
export interface TranslationCache {
  [namespace: string]: {
    [language: string]: Record<string, string>
  }
}

// 동적 번역 로더 인터페이스
export interface TranslationLoader {
  load: (language: Language, namespace: keyof TranslationNamespaces) => Promise<Record<string, string>>
  cache: TranslationCache
  preload: (language: Language) => Promise<void>
}

// 기존 호환성을 위한 타입
export type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
} 
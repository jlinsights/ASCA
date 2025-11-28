import type { Language, LanguageMetadata, TranslationLoader, TranslationCache, TranslationNamespaces } from './types'
import { navigationTranslations } from './translations/navigation'
import { artworksTranslations } from './translations/artworks'

// 언어 메타데이터
export const LANGUAGE_METADATA: Record<Language, LanguageMetadata> = {
  ko: {
    code: 'ko',
    label: '한국어',
    flag: '🇰🇷',
    dir: 'ltr',
    locale: 'ko-KR',
  },
  en: {
    code: 'en',
    label: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    locale: 'en-US',
    fallback: 'ko'
  },
  ja: {
    code: 'ja',
    label: '日本語',
    flag: '🇯🇵',
    dir: 'ltr',
    locale: 'ja-JP',
    fallback: 'ko'
  },
  zh: {
    code: 'zh',
    label: '中文',
    flag: '🇨🇳',
    dir: 'ltr',
    locale: 'zh-CN',
    fallback: 'ko'
  }
}

// 지원되는 언어 목록
export const SUPPORTED_LANGUAGES: Language[] = ['ko', 'en', 'ja', 'zh']

// 기본 언어
export const DEFAULT_LANGUAGE: Language = 'ko'

// 로컬 스토리지 키
export const LANGUAGE_STORAGE_KEY = 'asca-language'

// 번역 캐시
const translationCache: TranslationCache = {
  navigation: {},
  artworks: {},
  common: {},
  pages: {},
  forms: {},
  errors: {}
}

// 동적 번역 로더
export const translationLoader: TranslationLoader = {
  cache: translationCache,
  
  async load(language: Language, namespace: keyof TranslationNamespaces): Promise<Record<string, string>> {
    // 캐시 확인
    if (this.cache[namespace] && this.cache[namespace][language]) {
      return this.cache[namespace][language]!
    }
    
    let translations: Record<string, string> = {}
    
    try {
      switch (namespace) {
        case 'navigation':
          translations = navigationTranslations[language] || {}
          break
        case 'artworks':
          translations = artworksTranslations[language] || {}
          break
        case 'common':
          // 공통 번역은 예전 방식으로 로드
          const { translations: commonTranslations } = await import('./translations')
          translations = commonTranslations[language] || {}
          break
        case 'pages':
        case 'forms':
        case 'errors':
          // 향후 확장을 위한 네임스페이스
          translations = {}
          break
        default:
          translations = {}
      }
      
      // 캐시에 저장
      if (!this.cache[namespace]) {
        this.cache[namespace] = {}
      }
      this.cache[namespace][language] = translations
      
      return translations
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:${namespace}`, error)
      
      // 폴백 언어 시도
      const fallback = LANGUAGE_METADATA[language].fallback
      if (fallback && fallback !== language) {
        return await this.load(fallback, namespace)
      }
      
      return {}
    }
  },
  
  async preload(language: Language): Promise<void> {
    const namespaces: Array<keyof TranslationNamespaces> = ['navigation', 'artworks', 'common']
    
    await Promise.all(
      namespaces.map(namespace => this.load(language, namespace))
    )
  }
}

// 번역 함수 (최적화됨)
export const getTranslation = async (
  language: Language, 
  key: string, 
  namespace: keyof TranslationNamespaces = 'common'
): Promise<string> => {
  const translations = await translationLoader.load(language, namespace)
  
  if (translations[key]) {
    return translations[key]!
  }
  
  // 다른 네임스페이스에서 검색
  for (const ns of ['navigation', 'artworks', 'common'] as const) {
    if (ns !== namespace) {
      const nsTranslations = await translationLoader.load(language, ns)
      if (nsTranslations[key]) {
        return nsTranslations[key]!
      }
    }
  }
  
  // 폴백 언어 시도
  const fallback = LANGUAGE_METADATA[language].fallback
  if (fallback && fallback !== language) {
    return await getTranslation(fallback, key, namespace)
  }
  
  // 마지막 폴백: 키 자체 반환
  return key
}

// 브라우저 언어 감지 (개선됨)
export const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }
  
  const browserLangs = navigator.languages || [navigator.language]
  
  for (const browserLang of browserLangs) {
    const normalizedLang = browserLang.toLowerCase()
    
    // 정확한 매칭 시도
    if (SUPPORTED_LANGUAGES.includes(normalizedLang as Language)) {
      return normalizedLang as Language
    }
    
    // 언어 코드만으로 매칭 시도
    const langCode = normalizedLang.split('-')[0] as Language
    if (SUPPORTED_LANGUAGES.includes(langCode)) {
      return langCode
    }
  }
  
  return DEFAULT_LANGUAGE
}

// 언어 설정 유효성 검사
export const isValidLanguage = (lang: string): lang is Language => {
  return SUPPORTED_LANGUAGES.includes(lang as Language)
}

// 언어 메타데이터 접근자
export const getLanguageMetadata = (language: Language): LanguageMetadata => {
  return LANGUAGE_METADATA[language]
}

// 동기 버전 번역 함수 (하위 호환성)
export const getTranslationSync = (language: Language, key: string): string => {
  // 캐시된 번역 데이터에서 검색
  for (const namespace of ['navigation', 'artworks', 'common'] as const) {
    const cached = translationCache[namespace] ? translationCache[namespace][language] : undefined
    if (cached && cached[key]) {
      return cached![key]!
    }
  }
  
  // 폴백
  return key
}

export * from './types'
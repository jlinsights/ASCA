// 다국어 번역을 동적 로딩으로 최적화
export type Language = 'ko' | 'en' | 'ja' | 'zh'

export interface TranslationModule {
  [key: string]: string
}

// 지연 로딩을 위한 번역 로더
export const loadTranslations = async (language: Language): Promise<TranslationModule> => {
  try {
    // @ts-ignore - Dynamic import path, locale files may not exist during build
    const translationModule = await import(`./locales/${language}.json`)
    return translationModule.default || translationModule
  } catch (error) {
    
    try {
      // @ts-ignore - ko.json may not exist during build
      const fallbackModule = await import('./locales/ko.json')
      return fallbackModule.default || fallbackModule
    } catch (fallbackError) {
      // 기본 번역 반환
      return { [language]: language }
    }
  }
}

// 현재 사용 중인 번역만 메모리에 캐시
const translationCache = new Map<Language, TranslationModule>()

export const getTranslation = async (language: Language, key: string): Promise<string> => {
  if (!translationCache.has(language)) {
    const translations = await loadTranslations(language)
    translationCache.set(language, translations)
  }
  
  const translations = translationCache.get(language)!
  return translations[key] || key
}

// 동기적 번역 함수 (클라이언트 컴포넌트용)
export const getTranslationSync = (language: Language, key: string): string => {
  const translations = translationCache.get(language)
  return translations?.[key] || key
}

// 번역 키의 타입 안전성을 위한 유틸리티
export type TranslationKey = 
  | 'exhibition'
  | 'artworks' 
  | 'artists'
  | 'events'
  | 'about'
  // ... 다른 키들

// 클라이언트용 동기 번역 함수
export const t = (key: TranslationKey | string, language: Language = 'ko'): string => {
  return getTranslationSync(language, key)
} 
'use client'
import { log } from '@/lib/utils/logger'

import type React from 'react'
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  LANGUAGE_METADATA,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  detectBrowserLanguage,
  isValidLanguage,
  getLanguageMetadata,
} from '@/lib/i18n'
import type { Language, LanguageConfig, TranslationNamespaces } from '@/lib/i18n/types'
// 기본 언어(ko) 표만 번들에 싣는다 — SSR·첫 렌더가 한국어라 키 이름이 새지 않는다.
// 다른 언어 표는 setLanguage 에서 받아 둔 뒤에 언어를 바꾼다(lib/i18n/locales).
import { defaultLocaleTable, getLoadedLocale, loadLocale } from '@/lib/i18n/locales'

// 기존 호환성을 위한 타입
type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  // 새로운 기능
  tAsync: (key: string, namespace?: keyof TranslationNamespaces) => Promise<string>
  isLoading: boolean
  isClient: boolean
  metadata: (typeof LANGUAGE_METADATA)[Language]
  supportedLanguages: typeof SUPPORTED_LANGUAGES
}

// 컨텍스트 기본값
const defaultValue: LanguageContextType = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key: string) => key,
  tAsync: async (key: string) => key,
  isLoading: false,
  isClient: false,
  metadata: LANGUAGE_METADATA[DEFAULT_LANGUAGE],
  supportedLanguages: SUPPORTED_LANGUAGES,
}

const LanguageContext = createContext<LanguageContextType>(defaultValue)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // 언어 메타데이터 메모화
  const metadata = useMemo(() => getLanguageMetadata(language), [language])

  // 언어 설정 함수 (최적화됨)
  const setLanguage = useCallback(
    async (newLanguage: Language) => {
      if (!isValidLanguage(newLanguage) || newLanguage === language) {
        return
      }

      setIsLoading(true)

      try {
        // 그 언어의 표를 먼저 받아 둔다 — 받기 전에 언어를 바꾸면 키 이름이 보인다
        await loadLocale(newLanguage)

        // 언어 상태 업데이트
        setLanguageState(newLanguage)

        // 로컬 스토리지에 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
          document.documentElement.lang = newLanguage
          document.documentElement.dir = metadata.dir
        }
      } catch (error) {
        log.error('Failed to change language:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [language, metadata.dir]
  )

  // 동기 번역 함수. 언어는 표를 받은 뒤에만 바뀌므로 현재 언어의 표는 늘 있다.
  const t = useCallback(
    (key: string): string => (getLoadedLocale(language) ?? defaultLocaleTable)[key] || key,
    [language]
  )

  // 비동기 번역 함수 (호환용). 표가 언어 단위로 하나라 namespace 는 쓰지 않는다.
  const tAsync = useCallback(
    async (key: string, _namespace?: keyof TranslationNamespaces): Promise<string> => {
      try {
        return (await loadLocale(language))[key] || key
      } catch (error) {
        log.warn('Async translation failed:', error)
        return t(key)
      }
    },
    [language, t]
  )

  // 초기화
  useEffect(() => {
    setIsClient(true)

    // 클라이언트에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
      const detectedLanguage = savedLanguage || detectBrowserLanguage()

      if (isValidLanguage(detectedLanguage) && detectedLanguage !== language) {
        setLanguage(detectedLanguage)
      }

      // HTML 속성 설정
      document.documentElement.lang = language
      document.documentElement.dir = metadata.dir
    }
  }, [language, metadata.dir, setLanguage])

  const contextValue = useMemo(
    (): LanguageContextType => ({
      language,
      setLanguage,
      t,
      tAsync,
      isLoading,
      isClient,
      metadata,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, tAsync, isLoading, isClient, metadata]
  )

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// 성능을 위한 추가 훅들
export function useTranslation() {
  const { t, tAsync, language, isLoading } = useLanguage()
  return { t, tAsync, language, isLoading }
}

export function useLanguageMetadata() {
  const { metadata, supportedLanguages } = useLanguage()
  return { metadata, supportedLanguages, allLanguages: LANGUAGE_METADATA }
}

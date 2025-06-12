"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { 
  getTranslation, 
  detectBrowserLanguage, 
  DEFAULT_LANGUAGE, 
  LANGUAGE_STORAGE_KEY,
  type Language,
  type LanguageContextType 
} from "@/lib/i18n"

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)
  const [isInitialized, setIsInitialized] = useState(false)

  // 초기화: 저장된 언어 또는 브라우저 언어 감지
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // 저장된 언어 우선 확인
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
        if (savedLanguage) {
          setLanguage(savedLanguage)
        } else {
          // 브라우저 언어 감지
          const browserLanguage = detectBrowserLanguage()
          setLanguage(browserLanguage)
        }
      } catch (error) {
        // 로컬 스토리지 접근 실패시 기본 언어 사용
        setLanguage(DEFAULT_LANGUAGE)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeLanguage()
  }, [])

  // 언어 변경시 로컬 스토리지에 저장
  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
    } catch (error) {
      // 로컬 스토리지 저장 실패는 무시 (쿠키 비활성화 등)
    }
  }

  // 번역 함수
  const t = (key: string): string => {
    return getTranslation(language, key)
  }

  const contextValue: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
  }

  // 초기화 완료까지 기본 언어로 렌더링
  if (!isInitialized) {
    const defaultContextValue: LanguageContextType = {
      language: DEFAULT_LANGUAGE,
      setLanguage: handleSetLanguage,
      t: (key: string) => getTranslation(DEFAULT_LANGUAGE, key),
    }
    
    return (
      <LanguageContext.Provider value={defaultContextValue}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
} 
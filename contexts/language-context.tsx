'use client'
import { log } from '@/lib/utils/logger'

import type React from 'react'
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import {
  LANGUAGE_METADATA,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isValidLanguage,
  getLanguageMetadata,
} from '@/lib/i18n'
import {
  clientLanguageFor,
  HTML_LANG,
  isLocalizedPath,
  languageFromCookie,
  localizePath,
  LOCALE_COOKIE,
  PREFIXED_LANGUAGES,
  splitLocale,
} from '@/lib/i18n/locale-routing'
import type { Language, LanguageConfig, TranslationNamespaces } from '@/lib/i18n/types'
// 기본 언어(ko) 표만 번들에 싣는다 — SSR·첫 렌더가 한국어라 키 이름이 새지 않는다.
// 다른 언어 표는 setLanguage 에서 받아 둔 뒤에 언어를 바꾼다(lib/i18n/locales).
import { defaultLocaleTable, getLoadedLocale, loadLocale, registerLocale } from '@/lib/i18n/locales'
import type { LocaleTable } from '@/lib/i18n/locales'
import { navigateTo } from '@/lib/i18n/navigate'

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

/** 방문자가 고른 언어(쿠키). proxy 도 이 값을 읽어 번역된 한국어 주소에서 그 언어 주소로 보낸다 */
function readSavedLanguage(): Language | null {
  const match = /(?:^|;\s*)asca-lang=([^;]*)/.exec(document.cookie)
  return languageFromCookie(match ? decodeURIComponent(match[1]!) : null)
}

function saveLanguage(language: Language) {
  const secure = window.location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${LOCALE_COOKIE}=${language}; path=/; max-age=31536000; samesite=lax${secure}`
}

interface LanguageProviderProps {
  children: React.ReactNode
  /** 서버가 주소(/en·/ja·/zh)로 정한 언어. 첫 렌더가 서버 HTML 과 같아야 한다 */
  initialLanguage?: Language
  /** 한국어가 아니면 그 언어 표 — 첫 렌더 전에 받아 둔다 */
  initialTable?: LocaleTable
}

/**
 * 언어는 주소가 정한다(lib/i18n/locale-routing.ts). 예전엔 마운트 뒤 localStorage·브라우저 언어로 바꿔
 * 서버 HTML 이 늘 한국어였다 — 검색엔진은 한국어만 봤다(2026-11-08 SEO 점검).
 */
export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
  initialTable,
}: LanguageProviderProps) {
  // 렌더 중에(이펙트 전에) 표를 등록해야 첫 렌더의 t() 가 서버와 같은 문구를 낸다
  const [language, setLanguageState] = useState<Language>(() => {
    if (initialTable) registerLocale(initialLanguage, initialTable)
    return initialLanguage
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  // 언어 메타데이터 메모화
  const metadata = useMemo(() => getLanguageMetadata(language), [language])

  /** 표를 받은 뒤 화면 언어를 바꾼다(주소는 그대로) — 받기 전에 바꾸면 키 이름이 보인다 */
  const applyLanguage = useCallback(async (next: Language) => {
    setIsLoading(true)
    try {
      await loadLocale(next)
      setLanguageState(next)
      document.documentElement.lang = HTML_LANG[next]
      document.documentElement.dir = getLanguageMetadata(next).dir
    } catch (error) {
      log.error('Failed to change language:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 언어 선택 — 쿠키에 저장하고 그 언어의 주소로 간다. 서버가 그 언어로 다시 그리도록 전체 이동한다
   * (루트 레이아웃의 <html lang> 과 첫 렌더 언어는 클라이언트 이동으로는 바뀌지 않는다).
   * 번역 안 된 페이지는 주소가 한국어뿐이라, 이동 없이 머리말·꼬리말만 바꾼다.
   */
  const setLanguage = useCallback(
    async (newLanguage: Language) => {
      if (!isValidLanguage(newLanguage) || newLanguage === language) return
      saveLanguage(newLanguage)
      const { pathname: current, search, hash } = window.location
      const target = localizePath(current + search + hash, newLanguage)
      if (target !== current + search + hash) {
        navigateTo(target)
        return
      }
      await applyLanguage(newLanguage)
    },
    [language, applyLanguage]
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

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 예전 저장값(localStorage) → 쿠키로 한 번 옮긴다. 영어를 골라 두었던 방문자가 한국어로 떨어지지 않게.
  // 옛 값은 첫 로드에 지워지므로, 옛 값이 남아 있는데 쿠키가 있다면 그 쿠키는 이번 요청에서 서버가 단 것이다
  // (첫 방문 자동 판단이나 언어 주소 진입). 방문자가 직접 고른 옛 값이 그보다 앞선다(Codex 리뷰 #265 P2)
  useEffect(() => {
    try {
      const legacy = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (!legacy) return
      localStorage.removeItem(LANGUAGE_STORAGE_KEY)
      if (!(PREFIXED_LANGUAGES as readonly string[]).includes(legacy)) return
      const saved = legacy as Language
      if (readSavedLanguage() !== saved) saveLanguage(saved)
      const { pathname: current, search, hash } = window.location
      const split = splitLocale(current)
      // 한국어 번역 주소, 또는 자동 판단이 보낸 다른 언어의 홈(/en 등)이면 옛 선택 언어로 옮긴다
      const autoHome = split.prefixed && split.path === '/' && split.language !== saved
      if ((!split.prefixed && isLocalizedPath(current)) || autoHome) {
        navigateTo(localizePath(split.path + search + hash, saved), { replace: true })
      }
    } catch {
      // 저장소를 못 쓰는 브라우저(사생활 보호 모드 등)는 넘어간다
    }
  }, [])

  // 클라이언트 이동으로 주소가 바뀌면 화면 언어를 주소에 맞춘다. usePathname 은 rewrite 때 내부 주소를
  // 줄 수 있어(Next 문서 use-pathname "rewrites"), 브라우저의 실제 주소(window.location)로 판단한다
  useEffect(() => {
    const next = clientLanguageFor(window.location.pathname, readSavedLanguage())
    if (next !== language) void applyLanguage(next)
    // language 가 바뀌어도 다시 돈다 — 그때는 주소·쿠키가 이미 같은 언어라 아무것도 하지 않는다
  }, [pathname, language, applyLanguage])

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

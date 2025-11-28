"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, Globe, Check, Loader2 } from "lucide-react"
import { useLanguage, useLanguageMetadata } from "@/contexts/language-context"
import type { Language } from "@/lib/i18n/types"

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'mobile'
  showLabel?: boolean
  className?: string
}

export function LanguageSelector({ 
  variant = 'default', 
  showLabel = true, 
  className = "" 
}: LanguageSelectorProps) {
  const { language, setLanguage, isLoading } = useLanguage()
  const { allLanguages, supportedLanguages } = useLanguageMetadata()
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 언어 데이터 메모화
  const languageOptions = useMemo(() => {
    return supportedLanguages.map(code => ({
      ...allLanguages[code]
    }))
  }, [supportedLanguages, allLanguages])

  const currentLanguage = useMemo(() => {
    return languageOptions.find((lang) => lang.code === language) || languageOptions[0]
  }, [language, languageOptions])

  // 언어 변경 핸들러 (최적화됨)
  const handleLanguageChange = useCallback(async (langCode: Language) => {
    if (langCode === language || isChanging) return

    setIsChanging(true)
    setIsOpen(false)
    
    try {
      await setLanguage(langCode)
    } catch (error) {
      console.error('Language change failed:', error)
    } finally {
      setIsChanging(false)
    }
  }, [language, setLanguage, isChanging])

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
    return undefined
  }, [isOpen])

  // 키보드 네비게이션
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        setIsOpen(false)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        setIsOpen(!isOpen)
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) setIsOpen(true)
        break
    }
  }, [isOpen])

  // 스타일 변형
  const getButtonStyles = () => {
    const base = "relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
    
    switch (variant) {
      case 'compact':
        return `${base} gap-1 text-xs py-1 px-2 rounded hover:bg-accent/20 text-muted-foreground hover:text-foreground`
      case 'mobile':
        return `${base} gap-2 text-sm py-3 px-4 w-full justify-between bg-background border border-border rounded-lg hover:bg-accent/10`
      default:
        return `${base} gap-2 text-sm py-2 px-3 rounded-md border border-border bg-background hover:bg-accent/10 shadow-sm`
    }
  }

  const getDropdownStyles = () => {
    const base = "absolute bg-background border border-border rounded-md shadow-lg z-50 overflow-hidden"
    
    switch (variant) {
      case 'compact':
        return `${base} right-0 mt-1 w-40`
      case 'mobile':
        return `${base} left-0 right-0 mt-1`
      default:
        return `${base} right-0 mt-2 w-48`
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={getButtonStyles()}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${currentLanguage?.label}. Click to change language`}
        disabled={isLoading || isChanging}
      >
        {/* 로딩 상태 */}
        {(isLoading || isChanging) ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {/* 언어 아이콘/플래그 */}
            {variant === 'mobile' ? (
              <Globe className="h-4 w-4" />
            ) : (
              <span className="text-base" role="img" aria-label={currentLanguage?.label}>
                {currentLanguage?.flag}
              </span>
            )}
            
            {/* 언어 레이블 */}
            {showLabel && (
              <span className={variant === 'compact' ? "hidden sm:inline" : ""}>
                {variant === 'mobile' ? currentLanguage?.label : currentLanguage?.code.toUpperCase()}
              </span>
            )}
            
            {/* 드롭다운 화살표 */}
            <ChevronDown 
              className={`h-3 w-3 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className={getDropdownStyles()}>
          <ul className="py-1 max-h-60 overflow-y-auto" role="listbox">
            {languageOptions.map((lang) => {
              const isSelected = language === lang.code
              const isDisabled = isChanging
              
              return (
                <li key={lang.code} role="option" aria-selected={isSelected}>
                  <button
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`
                      w-full text-left px-4 py-2 text-sm transition-colors duration-150
                      flex items-center justify-between gap-3
                      hover:bg-accent/10 focus:bg-accent/10 focus:outline-none
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        isSelected 
                          ? "bg-accent/20 text-accent-foreground font-medium" 
                          : "text-foreground"
                      }
                    `}
                    disabled={isDisabled}
                    aria-label={`Select ${lang.label} language`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base" role="img" aria-label={lang.label}>
                        {lang.flag}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">{lang.label}</span>
                        {variant !== 'compact' && (
                          <span className="text-xs text-muted-foreground">
                            {lang.locale}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

// 특별한 용도의 언어 선택기 변형들
export function CompactLanguageSelector({ className }: { className?: string }) {
  return (
    <LanguageSelector 
      variant="compact" 
      showLabel={false} 
      className={className}
    />
  )
}

export function MobileLanguageSelector({ className }: { className?: string }) {
  return (
    <LanguageSelector 
      variant="mobile" 
      showLabel={true} 
      className={className}
    />
  )
}
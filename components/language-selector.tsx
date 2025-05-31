"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0]

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as "ko" | "en" | "ja" | "zh")
    setIsOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs uppercase tracking-wider py-1 px-2 rounded hover:bg-accent/20 text-accent-foreground"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="mr-1">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-background border border-border rounded-md shadow-lg z-50">
          <ul className="py-1">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent/20 flex items-center gap-2 ${
                    language === lang.code ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

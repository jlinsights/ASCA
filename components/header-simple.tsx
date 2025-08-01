"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export function HeaderSimple() {
  const { 
    t = (key: string) => key, 
    language = "ko", 
    setLanguage = () => {} 
  } = useLanguage() || {}

  return (
    <header className="gallery-card gallery-card-bordered sticky top-0 z-50 bg-rice-paper/95 backdrop-blur-sm">
      <div className="gallery-container">
        <div className="flex items-center justify-between py-4">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-celadon-green rounded-full flex items-center justify-center">
              <span className="font-calligraphy text-rice-paper font-bold text-lg">書</span>
            </div>
            <div>
              <h1 className="font-calligraphy text-xl font-bold text-ink-black">ASCA</h1>
              <p className="text-xs text-stone-gray">동양서예협회</p>
            </div>
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/exhibitions" className="text-ink-black hover:text-celadon-green transition-colors">
              {t('exhibition')}
            </Link>
            <Link href="/artworks" className="text-ink-black hover:text-celadon-green transition-colors">
              {t('artworks')}
            </Link>
            <Link href="/artists" className="text-ink-black hover:text-celadon-green transition-colors">
              {t('artists')}
            </Link>
            <Link href="/about" className="text-ink-black hover:text-celadon-green transition-colors">
              {t('about')}
            </Link>
          </nav>

          {/* 언어 선택기 */}
          <div className="flex items-center space-x-2">
            {(['ko', 'en', 'ja', 'zh'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`gallery-btn gallery-btn-xs ${
                  language === lang ? 'gallery-btn-default' : 'gallery-btn-ghost'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
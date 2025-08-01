'use client'

import { useLanguage } from "@/contexts/language-context"
import { HeaderSimple } from "@/components/header-simple"
import { FooterSimple } from "@/components/footer-simple"

export default function Home() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <>
      <HeaderSimple />
      <main className="min-h-screen p-8 gallery-container">
      <div className="gallery-card gallery-card-elevated p-8 mb-8">
        <h1 className="text-4xl font-bold mb-6 font-calligraphy text-ink-black">
          ASCA - 동양서예협회
        </h1>
        <p className="text-lg text-stone-gray leading-relaxed">
          <span className="font-calligraphy text-temple-gold">正法</span>의 계승, 
          <span className="font-calligraphy text-celadon-green">創新</span>의 조화 - 
          동양 서예 문화의 발전과 보급을 선도하는 사단법인 동양서예협회입니다.
        </p>
      </div>
      
      <div className="gallery-card gallery-card-glass p-6">
        <h2 className="text-2xl font-semibold mb-4 font-korean text-ink-black">
          Enhanced 스타일 테스트 페이지
        </h2>
        <p className="text-ink-black/80 mb-4">
          레이아웃과 Enhanced CSS 스타일이 정상적으로 작동하는지 확인하는 페이지입니다.
        </p>
        
        {/* 언어 선택기 테스트 */}
        <div className="mb-6 p-4 bg-silk-cream rounded-lg">
          <h3 className="text-lg font-semibold mb-3">언어 선택 테스트</h3>
          <p className="mb-2">현재 언어: <span className="font-bold text-celadon-green">{language}</span></p>
          <p className="mb-3">{t('exhibition')}: {t('artworks')}: {t('about')}</p>
          <div className="flex gap-2">
            {(['ko', 'en', 'ja', 'zh'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`gallery-btn gallery-btn-sm ${
                  language === lang ? 'gallery-btn-default' : 'gallery-btn-outline'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <button className="gallery-btn gallery-btn-default gallery-btn-md">
            기본 버튼
          </button>
          <button className="gallery-btn gallery-btn-outline gallery-btn-md">
            아웃라인 버튼
          </button>
          <button className="gallery-btn gallery-btn-ghost gallery-btn-md">
            고스트 버튼
          </button>
        </div>
        </div>
      </main>
      <FooterSimple />
    </>
  )
}
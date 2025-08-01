'use client'

import { useEffect, useState } from 'react'
import { logger } from '@/lib/utils/logger'

export function StaticFallback({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)

    // 에러 감지
    const errorHandler = (error: ErrorEvent) => {
      if (error.message.includes('Cannot read properties of undefined')) {
        setHasError(true)
        logger.warn('Webpack hydration error detected, using static fallback')
      }
    }

    window.addEventListener('error', errorHandler)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('error', errorHandler)
    }
  }, [])

  if (hasError || !mounted) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          background: '#faf8f5',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        dangerouslySetInnerHTML={{
          __html: `
            <style>
              .rice-paper { background-color: #faf8f5; }
              .ink-black { color: #1a1a1a; }
              .celadon-green { color: #87a96b; background-color: #87a96b; }
              .temple-gold { color: #d4af37; }
              .stone-gray { color: #6b7280; }
              .silk-cream { background-color: #f8f5f0; }
              .vermillion { background-color: #e34234; }
              .gallery-card { 
                background: white; 
                border-radius: 0.5rem; 
                box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
                padding: 1rem;
              }
              .gallery-btn { 
                background: #87a96b; 
                color: white; 
                padding: 0.75rem 1.5rem; 
                border-radius: 0.375rem; 
                border: none; 
                cursor: pointer;
                display: inline-block;
                text-decoration: none;
              }
              .gallery-container { 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 0 1rem; 
              }
              .font-calligraphy { font-family: serif; font-weight: bold; }
            </style>
            <main class="rice-paper" style="min-height: 100vh;">
              <header class="gallery-card" style="position: sticky; top: 0; z-index: 50;">
                <div class="gallery-container">
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div class="celadon-green" style="width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span class="font-calligraphy" style="color: #faf8f5; font-size: 1.125rem;">書</span>
                      </div>
                      <div>
                        <h1 class="font-calligraphy ink-black" style="font-size: 1.25rem; margin: 0;">ASCA</h1>
                        <p class="stone-gray" style="font-size: 0.75rem; margin: 0;">동양서예협회</p>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
              
              <section style="background: linear-gradient(135deg, #faf8f5 0%, #f8f5f0 100%); padding: 4rem 0;">
                <div class="gallery-container">
                  <div style="text-align: center;">
                    <h2 class="font-calligraphy ink-black" style="font-size: 3rem; margin-bottom: 1rem;">
                      동양 서예의 새로운 여정
                    </h2>
                    <p class="stone-gray" style="font-size: 1.125rem; max-width: 600px; margin: 0 auto 2rem;">
                      <span class="temple-gold font-calligraphy" style="font-weight: bold;">正法</span>의 계승과 
                      <span class="celadon-green font-calligraphy" style="font-weight: bold;">創新</span>의 조화가 만나는 
                      특별한 공간에서 동양 서예 예술의 새로운 차원을 경험하세요.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                      <div class="gallery-btn">전시 관람 예약 →</div>
                      <div class="gallery-btn" style="background: transparent; color: #87a96b; border: 2px solid #87a96b;">가상 투어</div>
                    </div>
                  </div>
                </div>
              </section>
              
              <section style="padding: 4rem 0; background: #1a1a1a;">
                <div class="gallery-container">
                  <div style="text-align: center; margin-bottom: 3rem;">
                    <h3 class="font-calligraphy temple-gold" style="font-size: 2.25rem; margin-bottom: 1rem;">
                      Enhanced Gallery CSS 테스트
                    </h3>
                    <p style="color: rgba(250, 248, 245, 0.8);">
                      동양 서예 테마의 컴포넌트와 색상 시스템을 확인하세요
                    </p>
                  </div>
                  
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div class="gallery-card">
                      <h4 class="font-calligraphy ink-black" style="font-size: 1.25rem; margin-bottom: 0.5rem;">Gallery Card</h4>
                      <p class="stone-gray" style="font-size: 0.875rem; margin-bottom: 1rem;">Enhanced styling test</p>
                      <div class="gallery-btn" style="width: 100%;">Test Button</div>
                    </div>
                    
                    <div class="gallery-card silk-cream">
                      <h4 class="ink-black" style="font-size: 1.25rem; margin-bottom: 1rem;">Color Palette</h4>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <div style="height: 3rem; background: #1a1a1a; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center;">
                          <span style="color: #faf8f5; font-size: 0.75rem;">ink-black</span>
                        </div>
                        <div class="celadon-green" style="height: 3rem; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center;">
                          <span style="color: #faf8f5; font-size: 0.75rem;">celadon</span>
                        </div>
                        <div style="height: 3rem; background: #d4af37; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center;">
                          <span style="color: #faf8f5; font-size: 0.75rem;">temple-gold</span>
                        </div>
                        <div class="vermillion" style="height: 3rem; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center;">
                          <span style="color: #faf8f5; font-size: 0.75rem;">vermillion</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              <footer class="gallery-card" style="background: #1a1a1a; color: #faf8f5;">
                <div class="gallery-container" style="padding: 3rem 0;">
                  <div style="text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1rem;">
                      <div class="celadon-green" style="width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span class="font-calligraphy" style="color: #faf8f5;">書</span>
                      </div>
                      <h3 class="font-calligraphy" style="font-size: 1.125rem; margin: 0;">ASCA</h3>
                    </div>
                    <p style="color: rgba(250, 248, 245, 0.8); font-size: 0.875rem; margin: 0;">
                      사단법인 동양서예협회 | Enhanced Gallery CSS System Test
                    </p>
                  </div>
                </div>
              </footer>
            </main>
          `
        }}
      />
    )
  }

  return <>{children}</>
}
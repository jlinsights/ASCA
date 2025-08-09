"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

// @deprecated Use LayoutFooter with variant="simple" from @/components/layout/layout-footer instead
export function FooterSimple() {
  const { t = (key: string) => key } = useLanguage() || {}

  return (
    <footer className="gallery-card bg-ink-black text-rice-paper mt-16">
      <div className="gallery-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 로고 및 소개 */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-celadon-green rounded-full flex items-center justify-center">
                <span className="font-calligraphy text-rice-paper font-bold">書</span>
              </div>
              <h3 className="font-calligraphy text-lg font-bold">ASCA</h3>
            </div>
            <p className="text-rice-paper/80 text-sm leading-relaxed">
              <span className="font-calligraphy text-temple-gold">正法</span>의 계승, 
              <span className="font-calligraphy text-celadon-green">創新</span>의 조화 - 
              동양 서예 문화의 발전과 보급을 선도합니다.
            </p>
          </div>

          {/* 퀵 링크 */}
          <div>
            <h4 className="font-semibold mb-4 text-temple-gold">퀵 링크</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/exhibitions" className="text-rice-paper/80 hover:text-celadon-green transition-colors">{t('exhibition')}</Link></li>
              <li><Link href="/artworks" className="text-rice-paper/80 hover:text-celadon-green transition-colors">{t('artworks')}</Link></li>
              <li><Link href="/artists" className="text-rice-paper/80 hover:text-celadon-green transition-colors">{t('artists')}</Link></li>
              <li><Link href="/about" className="text-rice-paper/80 hover:text-celadon-green transition-colors">{t('about')}</Link></li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h4 className="font-semibold mb-4 text-temple-gold">연락처</h4>
            <div className="text-sm text-rice-paper/80 space-y-2">
              <p>사단법인 동양서예협회</p>
              <p>서울특별시 중구</p>
              <p>전화: 02-123-4567</p>
              <p>이메일: info@orientalcalligraphy.org</p>
            </div>
          </div>
        </div>

        <div className="border-t border-rice-paper/20 mt-8 pt-8 text-center">
          <p className="text-rice-paper/60 text-sm">
            © 2024 사단법인 동양서예협회 (ASCA). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
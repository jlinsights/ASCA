'use client'

import { useLanguage } from '@/contexts/language-context'
import { AboutHero, AboutPage } from '@/components/about/about-layout'
import { AboutMotion } from '@/components/about/about-motion'
import { AboutNav } from '@/components/about/about-nav'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { BRAND_SLOGAN } from './brand-data'
import { BrandToc } from './brand-toc'
import { BrandEssence, BrandLogo, BrandNames } from './brand-identity'
import { BrandColor } from './brand-color'
import { BrandType, BrandVoice } from './brand-type-voice'
import { BrandComponents, BrandElements, BrandImagery } from './brand-elements'

/** 브랜드·스타일 가이드 본체 — 소개 묶음 머리(AboutHero)·목차(AboutNav) + 가이드 목차 + 9개 구획 */
export function BrandGuide() {
  const { t, language } = useLanguage()

  return (
    <AboutPage>
      <AboutHero
        tc={PAGE_HERO_MARKS.brand.tc}
        eyebrow={`ASCA · ${t('siteNavAboutShort')}`}
        title={t('brandTitle')}
        lede={t('brandLede')}
      >
        <p className='brand-slogan' lang='zh-Hant'>
          {BRAND_SLOGAN}
        </p>
        {/* 번체 화면에서는 슬로건이 이미 모국어라 풀이를 숨긴다 */}
        {language !== 'zh' && <p className='brand-slogan__gloss'>{t('brandSloganGloss')}</p>}
      </AboutHero>
      <AboutNav />

      <div className='asca-brand'>
        <div className='brand-body'>
          <BrandToc />
          <div>
            <BrandEssence index={1} />
            <BrandNames index={2} />
            <BrandLogo index={3} />
            <BrandColor index={4} />
            <BrandType index={5} />
            <BrandVoice index={6} />
            <BrandElements index={7} />
            <BrandComponents index={8} />
            <BrandImagery index={9} />
            <p className='brand-source'>
              {t('brandSource')} ·{' '}
              <span className='brand-mono'>docs/02-design/DESIGN.md · app/globals.css</span>
            </p>
          </div>
        </div>
      </div>
      <AboutMotion />
    </AboutPage>
  )
}

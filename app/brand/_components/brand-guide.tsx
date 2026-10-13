'use client'

import { useLanguage } from '@/contexts/language-context'
import { BRAND_SLOGAN } from './brand-data'
import { BrandToc } from './brand-toc'
import { BrandEssence, BrandLogo, BrandNames } from './brand-identity'
import { BrandColor } from './brand-color'
import { BrandType, BrandVoice } from './brand-type-voice'
import { BrandComponents, BrandElements, BrandImagery } from './brand-elements'

/** 브랜드·스타일 가이드 본체 — 먹 바탕 히어로 + 목차 + 9개 구획 */
export function BrandGuide() {
  const { t, language } = useLanguage()

  return (
    <div className='asca-brand'>
      <header className='brand-hero'>
        <div className='brand-hero__inner'>
          <p className='brand-hero__eyebrow' lang='en'>
            {t('brandEyebrow')}
          </p>
          <h1 className='brand-hero__title'>{t('brandTitle')}</h1>
          <p className='brand-hero__slogan' lang='zh-Hant'>
            {BRAND_SLOGAN}
          </p>
          {/* 번체 화면에서는 슬로건이 이미 모국어라 풀이를 숨긴다 */}
          {language !== 'zh' && <p className='brand-hero__gloss'>{t('brandSloganGloss')}</p>}
          <div className='brand-hero__rule' aria-hidden='true' />
          <p className='brand-hero__lede'>{t('brandLede')}</p>
        </div>
        <span className='brand-hero__seal' lang='zh-Hant' aria-hidden='true'>
          印
        </span>
      </header>

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
  )
}

'use client'

import { AboutHero } from '@/components/about/about-layout'
import { useLanguage } from '@/contexts/language-context'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'

export function IntroductionsHero() {
  const { t } = useLanguage()

  return (
    <AboutHero
      tc={PAGE_HERO_MARKS.introductions.tc}
      eyebrow={`ASCA · ${t('siteNavAboutShort')}`}
      title={t('introTitle')}
      lede={t('introLede')}
    >
      <p>{t('introMotto')}</p>
      <p>Where Tradition Flows Contemporary</p>
    </AboutHero>
  )
}

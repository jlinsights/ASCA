'use client'

import { AboutHero } from '@/components/about/about-layout'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { useLanguage } from '@/contexts/language-context'

/** 인사말씀 머리 — 소개 묶음과 같은 AboutHero. 메타데이터는 page.tsx(서버)에서 한국어로 둔다 */
export function GreetingsHero() {
  const { t } = useLanguage()
  return (
    <AboutHero
      tc={PAGE_HERO_MARKS.greetings.tc}
      eyebrow={`ASCA · ${t('siteNavAboutShort')}`}
      title={t('greetTitle')}
      lede={t('greetLede')}
    />
  )
}

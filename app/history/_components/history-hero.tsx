'use client'

import { AboutHero } from '@/components/about/about-layout'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { getHomeStats } from '@/components/home/home-data'
import { useLanguage } from '@/contexts/language-context'
import { historyEvents } from '../_data/history-events'

/** 연혁 머리 — 소개 묶음과 같은 AboutHero(큰 漢字 沿革) */
export function HistoryHero() {
  const { t } = useLanguage()
  const { sinceYear } = getHomeStats(historyEvents)

  return (
    <AboutHero
      tc={PAGE_HERO_MARKS.history.tc}
      eyebrow={`ASCA · ${t('siteNavAboutShort')}`}
      title={t('historyTitle')}
      lede={t('historyLede')}
      facts={[
        { label: t('historyLedgerSince'), value: String(sinceYear) },
        { label: t('historyLedgerEvents'), value: String(historyEvents.length) },
      ]}
    />
  )
}

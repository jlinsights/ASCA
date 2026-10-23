'use client'

import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { getHomeStats } from '@/components/home/home-data'
import { useLanguage } from '@/contexts/language-context'
import { historyEvents } from '../_data/history-events'

export function HistoryHero() {
  const { t } = useLanguage()
  const { sinceYear } = getHomeStats(historyEvents)

  return (
    <PageHero
      {...PAGE_HERO_MARKS.history}
      title={t('historyTitle')}
      lede={t('historyLede')}
      ledger={[
        { label: t('historyLedgerSince'), value: sinceYear },
        { label: t('historyLedgerEvents'), value: historyEvents.length },
      ]}
    />
  )
}

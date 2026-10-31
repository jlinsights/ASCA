'use client'

import Link from 'next/link'
import { Landmark } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { PageHero, type PageHeroStat } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS, type PageHeroKey } from '@/components/layout/page-hero-marks'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useLanguage } from '@/contexts/language-context'
import { HistoryTimelineCard } from '@/app/history/_components/history-timeline-card'
import { getExhibitionRecords, type ExhibitionRecords } from '../_data/exhibition-records'
import { exhibitionEvents } from '../_data/planned-exhibitions'

type Variant = keyof ExhibitionRecords

// 하위 페이지마다 다른 것: 題簽 표식·제목·소개·빈 상태 문구
const VARIANTS: Record<
  Variant,
  {
    mark: PageHeroKey
    titleKey: string
    ledeKey: string
    emptyKey: string
  }
> = {
  all: {
    mark: 'exhibitions',
    titleKey: 'exhibition',
    ledeKey: 'exPageLede',
    emptyKey: 'exPageEmptyTitle',
  },
  current: {
    mark: 'exhibitionsCurrent',
    titleKey: 'exCurrentTitle',
    ledeKey: 'exCurrentLede',
    emptyKey: 'exCurrentEmpty',
  },
  upcoming: {
    mark: 'exhibitionsUpcoming',
    titleKey: 'exUpcomingTitle',
    ledeKey: 'exUpcomingLede',
    emptyKey: 'exUpcomingEmpty',
  },
  past: {
    mark: 'exhibitionsPast',
    titleKey: 'exPastTitle',
    ledeKey: 'exPastLede',
    emptyKey: 'exPastEmpty',
  },
  online: {
    mark: 'exhibitionsOnline',
    titleKey: 'exOnlineTitle',
    ledeKey: 'exOnlineLede',
    emptyKey: 'exOnlineEmpty',
  },
}

export function ExhibitionRecordsPage({ variant }: { variant: Variant }) {
  const { t } = useLanguage()
  const config = VARIANTS[variant]
  const records = getExhibitionRecords(exhibitionEvents())[variant]

  const years = records.map(record => record.year)
  const ledger: PageHeroStat[] = [{ label: t('exLedgerCount'), value: records.length }]
  if (years.length > 0) {
    const first = Math.min(...years)
    const last = Math.max(...years)
    ledger.push({
      label: t('exLedgerYears'),
      value: first === last ? first : `${first}–${last}`,
    })
  }

  return (
    <div className='min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS[config.mark]}
        title={t(config.titleKey)}
        lede={t(config.ledeKey)}
        ledger={ledger}
      />

      <section className='container py-10 md:py-16'>
        <div className='max-w-4xl mx-auto'>
          {records.length > 0 ? (
            <div className='relative pl-8 border-l-2 border-muted-foreground/20 space-y-4'>
              {records.map(event => (
                <HistoryTimelineCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Landmark className='w-6 h-6 text-muted-foreground' />}
              title={t(config.emptyKey)}
              description={t('exEmptyHint')}
            />
          )}
        </div>
      </section>

      <section className='bg-muted/50 py-16'>
        <div className='container text-center'>
          <h2 className='text-3xl font-normal mb-4'>{t('exMoreTitle')}</h2>
          <p className='text-muted-foreground mb-8'>{t('exMoreLede')}</p>
          <div className='flex flex-wrap justify-center gap-4'>
            {variant !== 'past' && (
              <Button asChild variant='outline'>
                <Link href='/exhibitions/past'>{t('exSeePast')}</Link>
              </Button>
            )}
            <Button asChild variant='outline'>
              <Link href='/history'>{t('exSeeHistory')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}

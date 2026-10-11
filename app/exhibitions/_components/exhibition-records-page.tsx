'use client'

import Link from 'next/link'
import { Landmark } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useLanguage } from '@/contexts/language-context'
import { historyEvents } from '@/app/history/_data/history-events'
import { HistoryTimelineCard } from '@/app/history/_components/history-timeline-card'
import { getExhibitionRecords, type ExhibitionRecords } from '../_data/exhibition-records'

type Variant = keyof ExhibitionRecords

// 하위 페이지마다 다른 것: 히어로 색·배지 라벨(헤더 메뉴와 같은 키)·제목·빈 상태 문구
const VARIANTS: Record<
  Variant,
  {
    hero: string
    badge: string
    badgeKey: string
    titleKey: string
    ledeKey: string
    emptyKey: string
  }
> = {
  current: {
    hero: 'bg-gradient-to-b from-muted/50 to-background',
    badge: '',
    badgeKey: 'siteExCurrent',
    titleKey: 'exCurrentTitle',
    ledeKey: 'exCurrentLede',
    emptyKey: 'exCurrentEmpty',
  },
  upcoming: {
    hero: 'bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20',
    badge: 'bg-blue-600 text-white',
    badgeKey: 'siteExUpcoming',
    titleKey: 'exUpcomingTitle',
    ledeKey: 'exUpcomingLede',
    emptyKey: 'exUpcomingEmpty',
  },
  past: {
    hero: 'bg-transparent',
    badge: 'bg-amber-600 text-white',
    badgeKey: 'siteExPast',
    titleKey: 'exPastTitle',
    ledeKey: 'exPastLede',
    emptyKey: 'exPastEmpty',
  },
  online: {
    hero: 'bg-transparent',
    badge: 'bg-purple-600 text-white',
    badgeKey: 'siteExOnline',
    titleKey: 'exOnlineTitle',
    ledeKey: 'exOnlineLede',
    emptyKey: 'exOnlineEmpty',
  },
}

export function ExhibitionRecordsPage({ variant }: { variant: Variant }) {
  const { t } = useLanguage()
  const config = VARIANTS[variant]
  const records = getExhibitionRecords(historyEvents)[variant]

  return (
    <main className='min-h-screen'>
      <section className={`${config.hero} py-16`}>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto text-center'>
            <Badge className={`mb-4 ${config.badge}`}>{t(config.badgeKey)}</Badge>
            <h1 className='text-4xl md:text-5xl font-normal mb-6'>{t(config.titleKey)}</h1>
            <p className='text-lg text-muted-foreground'>{t(config.ledeKey)}</p>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-16'>
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
        <div className='container mx-auto px-4 text-center'>
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
    </main>
  )
}

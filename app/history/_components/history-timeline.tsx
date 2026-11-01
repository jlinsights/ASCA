'use client'

import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AboutChapter } from '@/components/about/about-layout'
import { useLanguage } from '@/contexts/language-context'
import { historyEvents, groupByYear } from '../_data/history-events'
import { HistoryTimelineCard } from './history-timeline-card'

/**
 * 연도별(최신순) 연혁 — 소개 묶음의 장(AboutChapter) 안에 연도 배지와 카드를 늘어놓는다.
 */
export function HistoryTimeline() {
  const { t } = useLanguage()
  const yearGroups = groupByYear(historyEvents)

  return (
    <AboutChapter
      id='history-timeline'
      tc='年表'
      eyebrow='Chronicle'
      title={t('historyChapterTitle')}
    >
      {yearGroups.map(({ year, events }) => (
        <div key={year} className='mb-12'>
          <div className='mb-6'>
            <Badge
              variant='outline'
              className='text-lg font-bold px-4 py-1.5 bg-background border-scholar-red/30 text-scholar-red'
            >
              {year}
            </Badge>
          </div>

          <div className='relative pl-8 border-l-2 border-muted-foreground/20 space-y-4'>
            {events.map(event => (
              <HistoryTimelineCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}

      <div className='py-8'>
        <div className='inline-flex items-center gap-2 text-muted-foreground'>
          <Building2 className='w-5 h-5' aria-hidden='true' />
          <span className='text-sm'>{t('historyClosing')}</span>
        </div>
      </div>
    </AboutChapter>
  )
}

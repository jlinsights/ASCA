import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { historyEvents, groupByYear } from '../_data/history-events'
import { HistoryTimelineCard } from './history-timeline-card'

/**
 * History timeline grouping events by year (descending) with a sticky year badge per group.
 */
export function HistoryTimeline() {
  const yearGroups = groupByYear(historyEvents)

  return (
    <section className='container mx-auto px-4 py-8 md:py-12'>
      <div className='max-w-4xl mx-auto'>
        {yearGroups.map(({ year, events }) => (
          <div key={year} className='mb-12'>
            <div className='sticky top-4 z-10 mb-6'>
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

        <div className='text-center py-8'>
          <div className='inline-flex items-center gap-2 text-muted-foreground'>
            <Building2 className='w-5 h-5' />
            <span className='text-sm'>1997년부터 이어온 동양서예의 전통과 역사</span>
          </div>
        </div>
      </div>
    </section>
  )
}

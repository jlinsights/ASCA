import { Calendar, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { typeConfig, type HistoryEvent } from '../_data/history-events'

interface HistoryTimelineCardProps {
  event: HistoryEvent
}

export function HistoryTimelineCard({ event }: HistoryTimelineCardProps) {
  const config = typeConfig[event.type]
  const Icon = config.icon

  return (
    <div className='relative'>
      <div className='absolute -left-[calc(2rem+5px)] top-4 w-3 h-3 rounded-full bg-scholar-red border-2 border-background' />

      <Card className='transition-shadow hover:shadow-md'>
        <CardContent className='p-5'>
          <div className='flex flex-wrap items-center gap-2 mb-2'>
            <Badge variant='outline' className={`text-xs ${config.color}`}>
              <Icon className='w-3 h-3 mr-1' />
              {config.label}
            </Badge>
          </div>

          <h3 className='text-base font-semibold mb-1'>{event.title}</h3>
          {event.subtitle && <p className='text-sm text-muted-foreground mb-2'>{event.subtitle}</p>}

          <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
            {event.venue && (
              <span className='flex items-center gap-1'>
                <MapPin className='w-3 h-3' />
                {event.venue}
              </span>
            )}
            {event.date && (
              <span className='flex items-center gap-1'>
                <Calendar className='w-3 h-3' />
                {event.date}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

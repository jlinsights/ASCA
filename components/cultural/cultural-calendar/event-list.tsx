'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Star,
  Bookmark,
  Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CulturalEvent } from './types'
import { getEventTypeColor, formatEventTime } from './calendar-utils'

interface EventCardProps {
  event: CulturalEvent
  compact?: boolean
}

export function EventCard({ event, compact = false }: EventCardProps) {
  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all duration-300 border-celadon-green/20',
        compact ? 'p-2' : 'p-4',
        getEventTypeColor(event.type).hoverBorder
      )}
    >
      <CardContent className={cn('p-0', !compact && 'space-y-3')}>
        {/* Event Header */}
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h4
              className={cn(
                'font-calligraphy font-semibold text-ink-black group-hover:text-celadon-green transition-colors',
                compact ? 'text-sm line-clamp-1' : 'text-base mb-1'
              )}
            >
              {event.title.original}
            </h4>
            {!compact && (
              <p className='font-english text-sm text-ink-black/70 mb-1'>{event.title.english}</p>
            )}
          </div>

          <div className='flex items-center gap-1 ml-2'>
            <Badge
              variant='outline'
              className={cn(
                'text-xs',
                `${getEventTypeColor(event.type).border} ${getEventTypeColor(event.type).text}`
              )}
            >
              {event.type}
            </Badge>
            {event.featured && <Star className='w-3 h-3 text-temple-gold' />}
          </div>
        </div>

        {/* Event Details */}
        {!compact && (
          <>
            <div className='space-y-2 text-sm text-ink-black/70'>
              <div className='flex items-center gap-2'>
                <Clock className='w-3 h-3' />
                <span>{formatEventTime(event.date.start, event.date.end)}</span>
              </div>

              <div className='flex items-center gap-2'>
                <MapPin className='w-3 h-3' />
                <span>{event.location.venue}</span>
                {event.location.online && (
                  <Badge variant='secondary' className='text-xs'>
                    Online
                  </Badge>
                )}
              </div>

              {event.capacity && (
                <div className='flex items-center gap-2'>
                  <Users className='w-3 h-3' />
                  <span>
                    {event.registered || 0} / {event.capacity} registered
                  </span>
                </div>
              )}
            </div>

            <p className='text-sm text-ink-black/80 line-clamp-2'>{event.description}</p>

            {/* Cultural Significance */}
            {event.culturalSignificance && (
              <div className='bg-temple-gold/10 rounded-md p-2 border border-temple-gold/20'>
                <p className='text-xs text-ink-black/70 font-serif italic'>
                  {event.culturalSignificance}
                </p>
              </div>
            )}

            {/* Tags */}
            <div className='flex flex-wrap gap-1'>
              {event.tags.slice(0, 3).map(tag => (
                <Badge
                  key={tag}
                  variant='secondary'
                  className='text-xs bg-celadon-green/10 text-celadon-green border-celadon-green/20'
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 pt-2'>
              <Button
                size='sm'
                className={cn(
                  'flex-1 font-english',
                  `${getEventTypeColor(event.type).bg} text-ink-black ${getEventTypeColor(event.type).hoverBg}`
                )}
              >
                {event.registrationRequired ? 'Register' : 'Learn More'}
              </Button>
              <Button size='sm' variant='outline' className='border-ink-black/20'>
                <Bookmark className='w-3 h-3' />
              </Button>
              <Button size='sm' variant='outline' className='border-ink-black/20'>
                <Share2 className='w-3 h-3' />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

interface ListViewProps {
  filteredEvents: CulturalEvent[]
}

export function ListView({ filteredEvents }: ListViewProps) {
  return (
    <div className='space-y-4'>
      {filteredEvents.map(event => (
        <EventCard key={event.id} event={event} />
      ))}

      {filteredEvents.length === 0 && (
        <Card className='text-center py-12'>
          <CardContent>
            <CalendarIcon className='w-12 h-12 text-ink-black/20 mx-auto mb-4' />
            <h3 className='font-calligraphy text-lg font-semibold text-ink-black mb-2'>
              No events found
            </h3>
            <p className='text-ink-black/60'>
              Try adjusting your filters or check back later for new events.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

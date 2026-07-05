'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CulturalEvent } from './types'
import { getTraditionalDate, getSeasonalColor, getEventTypeColor } from './calendar-utils'

interface MonthViewProps {
  days: { date: Date; isCurrentMonth: boolean }[]
  currentDate: Date
  getEventsForDate: (date: Date) => CulturalEvent[]
  showLunarCalendar: boolean
  showTraditionalFestivals: boolean
  showSeasonalThemes: boolean
}

export function MonthView({
  days,
  currentDate,
  getEventsForDate,
  showLunarCalendar,
  showTraditionalFestivals,
  showSeasonalThemes,
}: MonthViewProps) {
  const traditionalDate = getTraditionalDate(currentDate)

  return (
    <div className='space-y-6'>
      {/* Traditional Calendar Info */}
      {showLunarCalendar && (
        <Card className='bg-gradient-to-r from-temple-gold/10 to-autumn-gold/10 border-temple-gold/20'>
          <CardContent className='p-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
              <div>
                <h4 className='font-calligraphy text-lg font-semibold text-ink-black mb-1'>
                  农历 {traditionalDate.lunarMonth}月
                </h4>
                <p className='font-english text-sm text-ink-black/70'>
                  Lunar Month {traditionalDate.lunarMonth}
                </p>
              </div>
              <div>
                <h4 className='font-serif text-lg font-semibold text-ink-black mb-1'>
                  {traditionalDate.animal} Year
                </h4>
                <p className='font-english text-sm text-ink-black/70'>
                  Element: {traditionalDate.element}
                </p>
              </div>
              <div>
                <h4 className='font-serif text-lg font-semibold text-ink-black mb-1 capitalize'>
                  {traditionalDate.season} Season
                </h4>
                {showSeasonalThemes && (
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full mx-auto',
                      getSeasonalColor(traditionalDate.season)
                    )}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Grid */}
      <Card>
        <CardContent className='p-6'>
          {/* Weekday Headers */}
          <div className='grid grid-cols-7 gap-2 mb-4'>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className='text-center font-medium text-ink-black/70 py-2'>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className='grid grid-cols-7 gap-2'>
            {days.map(({ date, isCurrentMonth }, index) => {
              const dayEvents = getEventsForDate(date)
              const traditionalDayData = getTraditionalDate(date)
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-24 p-2 rounded-lg border transition-colors cursor-pointer',
                    isCurrentMonth
                      ? 'bg-rice-paper border-celadon-green/20 hover:bg-silk-cream'
                      : 'bg-ink-black/5 border-ink-black/10 text-ink-black/40',
                    isToday && 'ring-2 ring-temple-gold ring-opacity-50 bg-temple-gold/10'
                  )}
                >
                  {/* Date Number */}
                  <div className='flex items-center justify-between mb-1'>
                    <span
                      className={cn('text-sm font-medium', isToday && 'text-temple-gold font-bold')}
                    >
                      {date.getDate()}
                    </span>

                    {/* Lunar Date */}
                    {showLunarCalendar && isCurrentMonth && (
                      <span className='text-xs text-ink-black/50'>
                        {traditionalDayData.lunarDay}
                      </span>
                    )}
                  </div>

                  {/* Traditional Festivals */}
                  {showTraditionalFestivals &&
                    traditionalDayData.festivals?.map((festival, i) => (
                      <div
                        key={i}
                        className='text-xs text-vermillion font-medium mb-1 line-clamp-1'
                      >
                        {festival}
                      </div>
                    ))}

                  {/* Events */}
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <div
                      key={event.id}
                      className={cn(
                        'text-xs p-1 rounded mb-1 line-clamp-1 cursor-pointer hover:opacity-80',
                        `${getEventTypeColor(event.type).bgSoft} ${getEventTypeColor(event.type).text}`
                      )}
                    >
                      {event.title.original}
                    </div>
                  ))}

                  {dayEvents.length > 2 && (
                    <div className='text-xs text-ink-black/50'>+{dayEvents.length - 2} more</div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CulturalCalendarProps } from './cultural-calendar/types'
import { useCulturalCalendar } from './cultural-calendar/use-cultural-calendar'
import { getSeasonalColor, getEventTypeColor } from './cultural-calendar/calendar-utils'
import { MonthView } from './cultural-calendar/month-view'
import { ListView } from './cultural-calendar/event-list'

// ===============================
// Main Component (shell)
// ===============================

function CulturalCalendar({
  events,
  showLunarCalendar = true,
  showTraditionalFestivals = true,
  showSeasonalThemes = true,
  className,
}: CulturalCalendarProps) {
  const {
    currentDate,
    viewMode,
    setViewMode,
    selectedFilters,
    setSelectedFilters,
    showFilters,
    setShowFilters,
    filteredEvents,
    filterOptions,
    getEventsForDate,
    getDaysInMonth,
    navigateMonth,
  } = useCulturalCalendar({ events })

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
        {/* Date Navigation */}
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigateMonth('prev')}
            className='border-celadon-green/30'
          >
            <ChevronLeft className='w-4 h-4' />
          </Button>

          <h2 className='font-calligraphy text-2xl font-bold text-ink-black min-w-48 text-center'>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>

          <Button
            variant='outline'
            size='sm'
            onClick={() => navigateMonth('next')}
            className='border-celadon-green/30'
          >
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>

        {/* View Controls */}
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowFilters(!showFilters)}
            className='border-celadon-green/30'
          >
            <Filter className='w-4 h-4 mr-2' />
            Filters
          </Button>

          <div className='flex gap-1 bg-silk-cream/50 rounded-lg p-1'>
            {(['month', 'list'] as const).map(mode => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode(mode)}
                className={cn('capitalize', viewMode === mode && 'bg-celadon-green text-ink-black')}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className='bg-silk-cream/30 border-celadon-green/20'>
          <CardContent className='p-4'>
            <div className='space-y-4'>
              <h3 className='font-serif font-semibold text-ink-black'>Filter Events</h3>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <h4 className='text-sm font-medium text-ink-black mb-2'>Event Type</h4>
                  <div className='flex flex-wrap gap-2'>
                    {filterOptions.types.map(type => (
                      <Badge
                        key={type}
                        variant={selectedFilters.includes(type) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-colors capitalize',
                          selectedFilters.includes(type)
                            ? `${getEventTypeColor(type).bg} text-ink-black`
                            : 'border-ink-black/20 hover:bg-ink-black/5'
                        )}
                        onClick={() => {
                          setSelectedFilters(prev =>
                            prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]
                          )
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className='text-sm font-medium text-ink-black mb-2'>Season</h4>
                  <div className='flex flex-wrap gap-2'>
                    {filterOptions.seasons.map(season => (
                      <Badge
                        key={season}
                        variant={selectedFilters.includes(season) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-colors capitalize',
                          selectedFilters.includes(season)
                            ? `${getSeasonalColor(season)} text-ink-black`
                            : 'border-ink-black/20 hover:bg-ink-black/5'
                        )}
                        onClick={() => {
                          setSelectedFilters(prev =>
                            prev.includes(season)
                              ? prev.filter(f => f !== season)
                              : [...prev, season]
                          )
                        }}
                      >
                        {season}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className='text-sm font-medium text-ink-black mb-2'>Tags</h4>
                  <div className='flex flex-wrap gap-2'>
                    {filterOptions.tags.slice(0, 6).map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedFilters.includes(tag) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-colors text-xs',
                          selectedFilters.includes(tag)
                            ? 'bg-celadon-green text-ink-black'
                            : 'border-ink-black/20 hover:bg-ink-black/5'
                        )}
                        onClick={() => {
                          setSelectedFilters(prev =>
                            prev.includes(tag) ? prev.filter(f => f !== tag) : [...prev, tag]
                          )
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedFilters([])}
                  className='border-ink-black/20'
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Content */}
      {viewMode === 'month' && (
        <MonthView
          days={getDaysInMonth()}
          currentDate={currentDate}
          getEventsForDate={getEventsForDate}
          showLunarCalendar={showLunarCalendar}
          showTraditionalFestivals={showTraditionalFestivals}
          showSeasonalThemes={showSeasonalThemes}
        />
      )}
      {viewMode === 'list' && <ListView filteredEvents={filteredEvents} />}
    </div>
  )
}

export default CulturalCalendar

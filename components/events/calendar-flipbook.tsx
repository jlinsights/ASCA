'use client'

import { FLIPHTML5_ORIGIN, FlipbookEmbed } from '@/components/flipbook/flipbook-embed'

export const CALENDAR_FLIPBOOK_URL = `${FLIPHTML5_ORIGIN}/orientalcalligraphy/gjjr/`

export function CalendarFlipbook() {
  return (
    <FlipbookEmbed
      id='calendar-flipbook'
      url={CALENDAR_FLIPBOOK_URL}
      keyPrefix='calendarFlipbook'
    />
  )
}

'use client'

import { FLIPHTML5_ORIGIN, FlipbookEmbed } from '@/components/flipbook/flipbook-embed'

export const TAIWAN_TRIP_FLIPBOOK_URL = `${FLIPHTML5_ORIGIN}/orientalcalligraphy/alvf/`

export function TaiwanTripFlipbook() {
  return (
    <FlipbookEmbed
      id='taiwan-trip-flipbook'
      url={TAIWAN_TRIP_FLIPBOOK_URL}
      keyPrefix='taiwanTripFlipbook'
    />
  )
}

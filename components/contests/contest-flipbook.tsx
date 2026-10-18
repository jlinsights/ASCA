'use client'

import { FLIPHTML5_ORIGIN, FlipbookEmbed } from '@/components/flipbook/flipbook-embed'

export const CONTEST_FLIPBOOK_URL = `${FLIPHTML5_ORIGIN}/orientalcalligraphy/ulsw/`

export function ContestFlipbook() {
  return (
    <FlipbookEmbed id='contest-flipbook' url={CONTEST_FLIPBOOK_URL} keyPrefix='contestFlipbook' />
  )
}

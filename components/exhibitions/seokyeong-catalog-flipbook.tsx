'use client'

import { FLIPHTML5_ORIGIN, FlipbookEmbed } from '@/components/flipbook/flipbook-embed'

export const SEOKYEONG_CATALOG_FLIPBOOK_URL = `${FLIPHTML5_ORIGIN}/orientalcalligraphy/kosm/`

// 2026 특별기획전 서경(書境) 도록 — /exhibitions/past 목록 아래에 싣는다
export function SeokyeongCatalogFlipbook() {
  return (
    <FlipbookEmbed
      id='seokyeong-catalog-flipbook'
      url={SEOKYEONG_CATALOG_FLIPBOOK_URL}
      keyPrefix='seokyeongCatalogFlipbook'
    />
  )
}

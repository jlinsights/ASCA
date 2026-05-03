'use client'

import { useCallback } from 'react'
import GalleryGrid from './GalleryGrid'
import galleryData from '@/lib/data/gallery-data.json'
import { GalleryData } from '@/lib/types/gallery/gallery-legacy'

// gallery-data를 Client Component에서 직접 import하여
// Server Component → Client 간 1.7MB JSON 직렬화 비용 제거
const data = galleryData as unknown as GalleryData

export default function GalleryClient() {
  const handleGalleryEvent = useCallback((event: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.type, {
        event_category: 'Gallery',
        event_label: event.payload.category || event.payload.itemId,
      })
    }
  }, [])

  return (
    <div style={{ backgroundColor: 'var(--framer-canvas)' }}>
      <GalleryGrid
        items={data.items}
        categories={data.categories}
        className='gallery-main'
        onEvent={handleGalleryEvent}
      />
    </div>
  )
}

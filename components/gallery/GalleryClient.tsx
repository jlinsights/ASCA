'use client'

import { useCallback } from 'react'
import GalleryGrid from './GalleryGrid'
import { GalleryData } from '@/lib/types/gallery/gallery-legacy'

interface GalleryClientProps {
  data: GalleryData
}

export default function GalleryClient({ data }: GalleryClientProps) {
  const handleGalleryEvent = useCallback((event: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.type, {
        event_category: 'Gallery',
        event_label: event.payload.category || event.payload.itemId,
      })
    }
  }, [])

  return (
    // Framer: canvas 배경, 패딩 없음 (GalleryGrid가 자체 패딩 관리)
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

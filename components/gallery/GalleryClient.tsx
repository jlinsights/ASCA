'use client'

import { useState, useCallback } from 'react'
import GalleryGrid from './GalleryGrid'
import { GalleryData } from '@/types/gallery'

interface GalleryClientProps {
  data: GalleryData
}

export default function GalleryClient({ data }: GalleryClientProps) {
  // 갤러리 이벤트 추적
  const handleGalleryEvent = useCallback((event: any) => {
    // 엔터프라이즈 아키텍처의 이벤트 시스템과 연동
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.type, {
        event_category: 'Gallery',
        event_label: event.payload.category || event.payload.itemId,
        custom_map: {
          gallery_event: event.type
        }
      })
    }
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <GalleryGrid
        items={data.items}
        categories={data.categories}
        className="gallery-main"
        onEvent={handleGalleryEvent}
      />
    </div>
  )
}
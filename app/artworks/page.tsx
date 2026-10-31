import type { Metadata } from 'next'
import { Suspense } from 'react'
import { defaultSEO } from '@/lib/seo-constants'
import { ArtworksClient } from './artworks-client'

const DESCRIPTION =
  '동양서예협회 회원 작가들의 서예 작품을 한곳에 모았습니다. 작품을 둘러보고 작가 소개로 이어서 볼 수 있습니다.'

export const metadata: Metadata = {
  title: '작품 컬렉션 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: {
    title: '작품 컬렉션 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

export default function ArtworksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArtworksClient />
    </Suspense>
  )
}

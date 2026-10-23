'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero, type HeroFact } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { Button } from '@/components/ui/button'
import type { Artwork } from './_components/artwork-types'
import { sampleArtworks } from './_components/artworks-sample-data'
import { ArtworkGallery } from './_components/artwork-gallery'
import { ArtworkInfo } from './_components/artwork-info'
import { ArtworkRelated } from './_components/artwork-related'

export default function ArtworkDetailPage() {
  const params = useParams()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadArtwork = async () => {
      try {
        setLoading(true)
        setError(null)

        // 실제로는 API 호출
        const foundArtwork = sampleArtworks.find(art => art.id === params.id)
        if (!foundArtwork) {
          notFound()
          return
        }
        setArtwork(foundArtwork)
      } catch {
        setError('작품 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadArtwork()
  }, [params.id])

  const heroTitle = artwork?.title ?? '작품 상세'
  const heroFacts: HeroFact[] = [
    { label: '제작 연도', value: !artwork ? '—' : artwork.year ? `${artwork.year}년` : null },
    { label: '재료', value: !artwork ? '—' : artwork.medium || null },
    { label: '규격', value: !artwork ? '—' : artwork.dimensions || null },
  ]
  const hero = (
    <PageHero
      {...PAGE_HERO_MARKS.artworks}
      tier='band'
      title={heroTitle}
      crumbs={[{ label: '작품 목록', href: '/artworks' }, { label: heroTitle }]}
    >
      <HeroFacts facts={heroFacts} />
    </PageHero>
  )

  if (loading) {
    return (
      <main className='min-h-screen'>
        {hero}
        <div className='container mx-auto px-4 py-16 text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto'></div>
          <p className='mt-4 text-sm text-muted-foreground'>작품 정보를 불러오는 중...</p>
        </div>
        <LayoutFooter />
      </main>
    )
  }

  if (error || !artwork) {
    return (
      <main className='min-h-screen'>
        {hero}
        <div className='container mx-auto px-4 py-16 text-center'>
          <p className='text-destructive'>{error || '작품을 찾을 수 없습니다.'}</p>
          <Link href='/artworks'>
            <Button className='mt-4'>작품 목록으로 돌아가기</Button>
          </Link>
        </div>
        <LayoutFooter />
      </main>
    )
  }

  const relatedArtworks = sampleArtworks
    .filter(
      art =>
        art.id !== artwork.id &&
        (art.artist === artwork.artist || art.category === artwork.category)
    )
    .slice(0, 3)

  return (
    <main className='min-h-screen'>
      {hero}

      <section className='container mx-auto px-4 py-10 md:py-16'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <ArtworkGallery
            artwork={artwork}
            currentImageIndex={currentImageIndex}
            onImageSelect={setCurrentImageIndex}
          />
          <ArtworkInfo
            artwork={artwork}
            isLiked={isLiked}
            onToggleLike={() => setIsLiked(!isLiked)}
          />
        </div>
      </section>

      <ArtworkRelated artworks={relatedArtworks} />

      <LayoutFooter />
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { PageHero } from '@/components/layout/page-hero'
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

  if (loading) {
    return (
      <main className='min-h-screen'>
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
        <div className='container mx-auto px-4 py-16 text-center'>
          <p className='text-red-500'>{error || '작품을 찾을 수 없습니다.'}</p>
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
      <PageHero title='작품 상세' subtitle={artwork.title} />

      <div className='container mx-auto px-4 pt-8'>
        <Link
          href='/artworks'
          className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          작품 목록으로 돌아가기
        </Link>
      </div>

      <section className='container mx-auto px-4 py-8'>
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

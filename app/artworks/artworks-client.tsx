'use client'

import { useState, useMemo, useEffect } from 'react'
import { ArtworkImage as Image } from '@/components/artwork/artwork-image'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { PageHero, HeroScrolls, type PageHeroStat } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { DiscoveryToolbar } from '@/components/gallery/discovery-toolbar'
import { discoveryCopy, formatDiscoveryCount } from '@/components/gallery/discovery-copy'
import { Toaster } from '@/components/ui/toaster'
import type { ArtworkWithArtist } from '@/lib/api/artworks'
import { useLanguage } from '@/contexts/language-context'

// 작품 데이터 타입을 실제 데이터베이스 타입으로 변경
type Artwork = ArtworkWithArtist

export function ArtworksClient() {
  const { language, t } = useLanguage()
  const copy = discoveryCopy[language]
  const [artworks, setArtworks] = useState<ArtworkWithArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStyle, setSelectedStyle] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('sortFeatured')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedStyle('all')
    setShowAvailableOnly(false)
  }

  // API에서 작품 데이터 로드
  useEffect(() => {
    const controller = new AbortController()
    const loadArtworks = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/artworks', { signal: controller.signal })
        if (!response.ok) {
          throw new Error('Failed to fetch artworks')
        }
        const { artworks: artworksList } = await response.json()
        setArtworks(artworksList)
      } catch {
        if (controller.signal.aborted) return
        setError('load-failed')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadArtworks()
    return () => controller.abort()
  }, [retryKey])

  // 필터링 및 정렬 로직
  const filteredArtworks = useMemo(() => {
    const filtered = artworks.filter(artwork => {
      let matchesSearch = true
      let matchesCategory = true
      let matchesStyle = true
      let matchesAvailability = true

      // 검색어 필터
      if (searchTerm.trim()) {
        const searchLower = searchTerm.trim().toLowerCase()
        matchesSearch =
          artwork.title.toLowerCase().includes(searchLower) ||
          (artwork.artist?.name ?? '').toLowerCase().includes(searchLower) ||
          (artwork.description ?? '').toLowerCase().includes(searchLower) ||
          (artwork.materials?.some((material: string) =>
            material.toLowerCase().includes(searchLower)
          ) ??
            false)
      }

      // 카테고리 필터
      if (selectedCategory !== 'all') {
        matchesCategory = artwork.category === selectedCategory
      }

      // 스타일 필터
      if (selectedStyle !== 'all') {
        matchesStyle = artwork.style === selectedStyle
      }

      // 구매 가능 여부 필터
      if (showAvailableOnly) {
        matchesAvailability = artwork.availability === 'available'
      }

      return matchesSearch && matchesCategory && matchesStyle && matchesAvailability
    })

    // 정렬 적용
    switch (sortBy) {
      case 'sortFeatured':
        return filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      case 'sortNewest':
        return filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'sortOldest':
        return filtered.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      case 'sortPriceHigh':
        return filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
      case 'sortPriceLow':
        return filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
      default:
        return filtered
    }
  }, [artworks, searchTerm, selectedCategory, selectedStyle, showAvailableOnly, sortBy])

  // 이미지 비율 계산
  const getImageAspectRatio = (artwork: Artwork) => {
    // 실제 이미지 비율에 따라 조정
    return artwork.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'
  }

  const collectionLabel = (artwork: Artwork) => {
    switch (artwork.collection_status) {
      case 'private':
        return copy.private
      case 'museum':
        return copy.museum
      case 'gallery':
        return copy.gallery
      default:
        return copy.public
    }
  }
  // 히어로 — 이미지가 실제로 있는 작품만 걸고(추천작 먼저), 숫자는 불러온 목록에서 센다
  const heroImages = useMemo(
    () =>
      [...artworks]
        .filter(artwork => Boolean(artwork.image_url))
        .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        .slice(0, 5)
        .map(artwork => ({
          src: artwork.image_url as string,
          alt: artwork.artist?.name ? `${artwork.title} — ${artwork.artist.name}` : artwork.title,
          href: `/artworks/${artwork.id}`,
        })),
    [artworks]
  )
  const heroLedger = useMemo(() => {
    // 불러오는 동안에도 같은 높이를 차지해 숫자가 들어올 때 화면이 밀리지 않게 한다
    if (loading) {
      return [t('phStatWorks'), t('phStatArtists'), t('phStatYears')].map(label => ({
        label,
        value: '—',
      }))
    }
    if (artworks.length === 0) return undefined
    const artistCount = new Set(artworks.map(a => a.artist?.id).filter(Boolean)).size
    const years = artworks.map(a => a.year).filter((y): y is number => typeof y === 'number')
    const stats: PageHeroStat[] = [
      { label: t('phStatWorks'), value: artworks.length },
      ...(artistCount > 0 ? [{ label: t('phStatArtists'), value: artistCount }] : []),
    ]
    if (years.length > 0) {
      const min = Math.min(...years)
      const max = Math.max(...years)
      stats.push({ label: t('phStatYears'), value: min === max ? min : `${min}–${max}` })
    }
    return stats
  }, [artworks, loading, t])

  const hasConditions =
    Boolean(searchTerm.trim()) ||
    selectedCategory !== 'all' ||
    selectedStyle !== 'all' ||
    showAvailableOnly

  return (
    <div className='min-h-screen bg-background'>
      <PageHero
        {...PAGE_HERO_MARKS.artworks}
        title={t('artCollection')}
        lede={t('artworksDescription')}
        ledger={heroLedger}
        media={
          loading || heroImages.length > 0 ? (
            <HeroScrolls images={heroImages} fit='contain' loading={loading} />
          ) : undefined
        }
      />

      <div className='gallery-container py-12 md:py-16'>
        <DiscoveryToolbar
          search={searchTerm}
          searchLabel={copy.artworkSearch}
          onSearchChange={setSearchTerm}
          resultText={
            error
              ? copy.errorTitle
              : formatDiscoveryCount(copy.artworkResults, filteredArtworks.length, language)
          }
          busy={loading}
          onReset={resetFilters}
          filters={[
            {
              id: 'category',
              label: copy.category,
              value: selectedCategory,
              onChange: setSelectedCategory,
              options: [
                { value: 'all', label: copy.all },
                { value: 'calligraphy', label: t('calligraphy') },
                { value: 'painting', label: t('painting') },
                { value: 'seal', label: t('sealEngraving') },
              ],
            },
            {
              id: 'style',
              label: copy.style,
              value: selectedStyle,
              onChange: setSelectedStyle,
              options: [
                { value: 'all', label: copy.all },
                { value: 'traditional', label: t('traditional') },
                { value: 'modern', label: t('modern') },
                { value: 'contemporary', label: t('contemporary') },
              ],
            },
          ]}
          sort={{
            id: 'sort',
            label: copy.sort,
            value: sortBy,
            onChange: setSortBy,
            options: [
              { value: 'sortFeatured', label: copy.featured },
              { value: 'sortNewest', label: copy.newest },
              { value: 'sortOldest', label: copy.oldest },
              { value: 'sortPriceHigh', label: copy.priceHigh },
              { value: 'sortPriceLow', label: copy.priceLow },
            ],
          }}
          extraConditions={
            showAvailableOnly
              ? [
                  {
                    id: 'availability',
                    label: copy.availableOnly,
                    onRemove: () => setShowAvailableOnly(false),
                  },
                ]
              : []
          }
        >
          <div className='space-y-2 lg:col-span-2'>
            <p className='text-sm font-medium text-foreground'>{copy.availability}</p>
            <label
              htmlFor='availableOnly'
              className='flex min-h-12 cursor-pointer items-center gap-4 rounded-md border border-input bg-background px-4 py-2 text-base'
            >
              <input
                type='checkbox'
                id='availableOnly'
                checked={showAvailableOnly}
                onChange={event => setShowAvailableOnly(event.target.checked)}
                className='h-4 w-4 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
              />
              {copy.availableOnly}
            </label>
          </div>
        </DiscoveryToolbar>

        <section className='mt-8' aria-busy={loading} aria-label={t('artCollection')}>
          {loading ? (
            <div
              aria-hidden='true'
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 motion-safe:animate-pulse'
            >
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className='h-64 rounded-lg bg-muted' />
              ))}
            </div>
          ) : error ? (
            <div role='alert' className='rounded-lg border border-border bg-card p-8 text-center'>
              <h2 className='font-serif text-2xl mb-4'>{copy.errorTitle}</h2>
              <p className='text-base leading-relaxed text-muted-foreground mb-4'>
                {copy.loadError}
              </p>
              <Button onClick={() => setRetryKey(key => key + 1)} className='h-12'>
                {copy.retry}
              </Button>
            </div>
          ) : (
            <>
              {/* 작품 그리드 */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {filteredArtworks.map(artwork => {
                  return (
                    <Link
                      key={artwork.id}
                      href={`/artworks/${artwork.id}`}
                      aria-label={`${copy.details}: ${artwork.title}`}
                      className='gallery-card interactive group block bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:!transform-none motion-reduce:transition-none'
                    >
                      <div className={`relative ${getImageAspectRatio(artwork)} overflow-hidden`}>
                        <Image
                          src={artwork.image_url || '/images/artworks/calligraphy-scene-1.jpg'}
                          alt={artwork.title}
                          fill
                          sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                          className='object-contain bg-muted'
                        />
                        <Badge variant='secondary' className='absolute top-4 right-4'>
                          {collectionLabel(artwork)}
                        </Badge>
                      </div>
                      <div className='space-y-4 p-4'>
                        <div>
                          <h2 className='font-serif text-xl leading-snug text-foreground line-clamp-2'>
                            {artwork.title}
                          </h2>
                          <p className='mt-2 text-base leading-relaxed text-muted-foreground'>
                            {artwork.artist?.name}
                          </p>
                        </div>
                        <p className='text-sm leading-relaxed text-muted-foreground'>
                          {[artwork.year, artwork.materials?.join(', ')]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        <span className='inline-flex min-h-12 items-center text-sm font-medium text-foreground underline-offset-4 group-hover:underline group-focus-visible:underline'>
                          {copy.details} →
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {filteredArtworks.length === 0 && (
                <div className='text-center py-12'>
                  <Search
                    aria-hidden='true'
                    className='w-12 h-12 mx-auto mb-4 text-muted-foreground'
                  />
                  <h2 className='font-serif text-2xl mb-4'>
                    {hasConditions ? copy.emptyTitle : copy.emptyArtworks}
                  </h2>
                  {hasConditions && (
                    <>
                      <p className='text-base leading-relaxed text-muted-foreground mb-4'>
                        {copy.emptyHelp}
                      </p>
                      <Button variant='outline' onClick={resetFilters} className='h-12'>
                        {copy.reset}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <LayoutFooter />
      <Toaster />
    </div>
  )
}

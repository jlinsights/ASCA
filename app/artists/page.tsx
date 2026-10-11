'use client'

import { useEffect, useState, lazy, Suspense } from 'react'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { TranslatedContent } from '@/components/translated-content'
import type { PublicArtist as Artist } from '@/lib/api/artist-mapper'
import { ArtistFilters } from './_components/artist-filters'
import { ArtistCard } from './_components/artist-card'
import { formatPrice } from './_components/artists-meta'
import { useLanguage } from '@/contexts/language-context'
import { discoveryCopy, formatDiscoveryCount } from '@/components/gallery/discovery-copy'

const ArtistDetailModal = lazy(() => import('@/components/artists/ArtistDetailModal'))

const PAGE_SIZE = 24

interface ArtistQuery {
  q: string
  membershipType: string
  artistType: string
  specialty: string
  title: string
}

function buildArtistsUrl(query: ArtistQuery, page: number): string {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
  for (const [key, value] of Object.entries(query)) {
    if (value && value !== 'all') params.set(key, value)
  }
  return `/api/artists?${params.toString()}`
}

export default function ArtistsPage() {
  const { language } = useLanguage()
  const copy = discoveryCopy[language]
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [total, setTotal] = useState(0)
  // 페이지 번호는 조회 조건(key)에 묶는다 — 조건이 바뀌면 별도 리셋 없이 1페이지가 된다
  const [pager, setPager] = useState({ key: '', page: 1 })
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('all')
  const [artistTypeFilter, setArtistTypeFilter] = useState('all')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [titleFilter, setTitleFilter] = useState('all')
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set())

  // 3,800명 넘는 작가를 한 번에 받지 않는다 — 필터·검색은 서버에서, 목록은 페이지 단위로
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const query: ArtistQuery = {
    q: debouncedSearch,
    membershipType: membershipFilter,
    artistType: artistTypeFilter,
    specialty: specialtyFilter,
    title: titleFilter,
  }
  const queryKey = JSON.stringify(query)
  // 이전 조건의 페이지를 재사용하지 않도록 조건 변경 시 렌더 상태를 함께 갱신한다.
  if (pager.key !== queryKey) setPager({ key: queryKey, page: 1 })
  const page = pager.key === queryKey ? pager.page : 1

  useEffect(() => {
    const controller = new AbortController()
    const isFirstPage = page === 1
    setError(false)
    if (isFirstPage) setLoading(true)
    else setLoadingMore(true)

    fetch(buildArtistsUrl(JSON.parse(queryKey) as ArtistQuery, page), {
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch artists')
        return response.json() as Promise<{ artists: Artist[]; total: number }>
      })
      .then(data => {
        if (controller.signal.aborted) return
        setFilteredArtists(prev => (isFirstPage ? data.artists : [...prev, ...data.artists]))
        setTotal(data.total)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        if (controller.signal.aborted) return
        setError(true)
        if (isFirstPage) {
          setFilteredArtists([])
          setTotal(0)
        }
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setLoading(false)
        setLoadingMore(false)
      })

    return () => controller.abort()
  }, [queryKey, page, retryKey])

  const hasMore = filteredArtists.length < total
  const loadMore = () => setPager({ key: queryKey, page: page + 1 })

  const toggleFollow = (artistId: string) => {
    setFollowedArtists(prev => {
      const newSet = new Set(prev)
      if (newSet.has(artistId)) {
        newSet.delete(artistId)
      } else {
        newSet.add(artistId)
      }
      return newSet
    })
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setMembershipFilter('all')
    setArtistTypeFilter('all')
    setSpecialtyFilter('all')
    setTitleFilter('all')
  }

  const hasConditions =
    Boolean(searchQuery.trim()) ||
    [membershipFilter, artistTypeFilter, specialtyFilter, titleFilter].some(
      value => value !== 'all'
    )
  const resultText = error
    ? copy.errorTitle
    : formatDiscoveryCount(copy.artistResults, total, language)
  const isUpdating = loading || searchQuery.trim() !== debouncedSearch

  return (
    <div
      className='min-h-screen bg-background'
      style={{ paddingTop: 'calc(var(--spacing-lg) * 2)' }}
    >
      <section className='py-12 md:py-20'>
        <div className='gallery-container'>
          <h1 className='font-serif text-3xl md:text-4xl mb-4 tracking-tight text-foreground'>
            <TranslatedContent textKey='artists' />
          </h1>
          <p className='text-base leading-relaxed text-muted-foreground max-w-2xl'>
            {copy.artistIntro}
          </p>
        </div>
      </section>

      <div className='gallery-container'>
        <ArtistFilters
          searchQuery={searchQuery}
          membershipFilter={membershipFilter}
          artistTypeFilter={artistTypeFilter}
          specialtyFilter={specialtyFilter}
          titleFilter={titleFilter}
          resultText={resultText}
          busy={isUpdating}
          onSearchChange={setSearchQuery}
          onMembershipChange={setMembershipFilter}
          onArtistTypeChange={setArtistTypeFilter}
          onSpecialtyChange={setSpecialtyFilter}
          onTitleChange={setTitleFilter}
          onReset={handleResetFilters}
        />
      </div>

      <section className='gallery-container py-8' aria-busy={isUpdating}>
        {loading ? (
          <div
            aria-hidden='true'
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 motion-safe:animate-pulse'
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className='h-64 rounded-lg bg-muted' />
            ))}
          </div>
        ) : error && filteredArtists.length === 0 ? (
          <div role='alert' className='rounded-lg border border-border bg-card p-8 text-center'>
            <h2 className='font-serif text-2xl mb-4'>{copy.errorTitle}</h2>
            <p className='text-base leading-relaxed text-muted-foreground mb-4'>{copy.loadError}</p>
            <Button onClick={() => setRetryKey(key => key + 1)} className='h-12'>
              {copy.retry}
            </Button>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className='text-center py-16'>
            <User aria-hidden='true' className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
            <h2 className='font-serif text-2xl mb-4 text-foreground'>
              {hasConditions ? copy.emptyTitle : copy.emptyArtists}
            </h2>
            {hasConditions && (
              <>
                <p className='text-base leading-relaxed text-muted-foreground mb-4'>
                  {copy.emptyHelp}
                </p>
                <Button variant='outline' onClick={handleResetFilters} className='h-12'>
                  {copy.reset}
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className='hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-8'>
              {filteredArtists.map(artist => (
                <ArtistCard key={artist.id} artist={artist} variant='pc' />
              ))}
            </div>

            <div className='lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6'>
              {filteredArtists.map(artist => (
                <ArtistCard key={artist.id} artist={artist} variant='mobile' />
              ))}
            </div>

            {hasMore && (
              <div className='mt-10 flex flex-col items-center gap-2'>
                {error && (
                  <p role='alert' className='text-sm text-destructive'>
                    {copy.loadError}
                  </p>
                )}
                <Button
                  variant='outline'
                  className='h-12'
                  onClick={error ? () => setRetryKey(key => key + 1) : loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? copy.updating : error ? copy.retry : copy.loadMore}
                </Button>
                <p className='text-xs text-muted-foreground'>
                  {filteredArtists.length.toLocaleString(language)} /{' '}
                  {total.toLocaleString(language)}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {selectedArtist && (
        <Suspense
          fallback={
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
              <div className='bg-background p-6 rounded-lg shadow-lg'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-scholar-red mx-auto mb-4'></div>
                <p className='text-sm text-muted-foreground'>작가 정보를 불러오는 중...</p>
              </div>
            </div>
          }
        >
          <ArtistDetailModal
            artist={selectedArtist as any}
            isOpen={!!selectedArtist}
            onClose={() => setSelectedArtist(null)}
            followedArtists={followedArtists}
            onToggleFollow={toggleFollow}
            formatPrice={formatPrice}
          />
        </Suspense>
      )}

      <LayoutFooter />
    </div>
  )
}

'use client'

import { useEffect, useState, lazy, Suspense } from 'react'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { PageHero, HeroScrolls, type PageHeroStat } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
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
  specialty: string
  title: string
  nationality: string
}

// 주소(?membershipType=초대작가 등)로 들어온 조건. 헤더·푸터 메뉴가 이 이름으로 링크한다
export type ArtistInitialFilters = Partial<Record<keyof ArtistQuery, string>>

function buildArtistsUrl(query: ArtistQuery, page: number): string {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
  for (const [key, value] of Object.entries(query)) {
    if (value && value !== 'all') params.set(key, value)
  }
  return `/api/artists?${params.toString()}`
}

interface ArtistsPageProps {
  initialFilters?: ArtistInitialFilters
}

// 홈페이지 작가·書境 안내 칸은 2026-11-01 에 /artists/homepages 로 옮겼다(작가·작품 메뉴의 "작가의 홈페이지")
export function ArtistsPage({ initialFilters = {} }: ArtistsPageProps) {
  const { language, t } = useLanguage()
  const copy = discoveryCopy[language]
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [total, setTotal] = useState(0)
  // 페이지 번호는 조회 조건(key)에 묶는다 — 조건이 바뀌면 별도 리셋 없이 1페이지가 된다
  const [pager, setPager] = useState({ key: '', page: 1 })
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.q ?? '')
  const [searchQuery, setSearchQuery] = useState(initialFilters.q ?? '')
  const [membershipFilter, setMembershipFilter] = useState(initialFilters.membershipType ?? 'all')
  const [specialtyFilter, setSpecialtyFilter] = useState(initialFilters.specialty ?? 'all')
  const [titleFilter, setTitleFilter] = useState(initialFilters.title ?? 'all')
  const [nationalityFilter, setNationalityFilter] = useState(initialFilters.nationality ?? 'all')
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
    specialty: specialtyFilter,
    title: titleFilter,
    nationality: nationalityFilter,
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
    setSpecialtyFilter('all')
    setTitleFilter('all')
    setNationalityFilter('all')
  }

  const hasConditions =
    Boolean(searchQuery.trim()) ||
    [membershipFilter, specialtyFilter, titleFilter, nationalityFilter].some(
      value => value !== 'all'
    )
  const resultText = error
    ? copy.errorTitle
    : formatDiscoveryCount(copy.artistResults, total, language)
  const isUpdating = loading || searchQuery.trim() !== debouncedSearch

  // 히어로 — 불러온 작가 중 프로필 사진이 있는 사람만 건다. 숫자는 현재 조건에 맞는 작가 수
  const heroImages = filteredArtists
    .filter(artist => Boolean(artist.profileImage))
    .slice(0, 5)
    .map(artist => ({ src: artist.profileImage as string, alt: artist.name }))
  // 불러오는 중엔 '—' 로 자리를 잡고, 실패하면 숫자 칸을 아예 내리지 않는다(목록 쪽이 오류를 알린다)
  const heroLedger: PageHeroStat[] = error
    ? []
    : [
        {
          label: t('phStatArtists'),
          value: loading ? '—' : total.toLocaleString(language),
        },
      ]

  return (
    <div className='min-h-screen bg-background'>
      <PageHero
        {...PAGE_HERO_MARKS.artists}
        title={t('artists')}
        lede={copy.artistIntro}
        ledger={heroLedger}
        media={
          loading || heroImages.length > 0 ? (
            <HeroScrolls images={heroImages} fit='cover' loading={loading} />
          ) : undefined
        }
      />

      <div className='gallery-container pt-10 md:pt-16'>
        <ArtistFilters
          searchQuery={searchQuery}
          membershipFilter={membershipFilter}
          specialtyFilter={specialtyFilter}
          titleFilter={titleFilter}
          nationalityFilter={nationalityFilter}
          resultText={resultText}
          busy={isUpdating}
          onSearchChange={setSearchQuery}
          onMembershipChange={setMembershipFilter}
          onSpecialtyChange={setSpecialtyFilter}
          onTitleChange={setTitleFilter}
          onNationalityChange={setNationalityFilter}
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

            <div className='lg:hidden grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-6'>
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

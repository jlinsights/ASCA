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
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [total, setTotal] = useState(0)
  // 페이지 번호는 조회 조건(key)에 묶는다 — 조건이 바뀌면 별도 리셋 없이 1페이지가 된다
  const [pager, setPager] = useState({ key: '', page: 1 })
  const [hasLoaded, setHasLoaded] = useState(false)
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
  const page = pager.key === queryKey ? pager.page : 1

  useEffect(() => {
    const controller = new AbortController()
    const isFirstPage = page === 1
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
        setFilteredArtists(prev => (isFirstPage ? data.artists : [...prev, ...data.artists]))
        setTotal(data.total)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        if (isFirstPage) {
          setFilteredArtists([])
          setTotal(0)
        }
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setLoading(false)
        setLoadingMore(false)
        setHasLoaded(true)
      })

    return () => controller.abort()
  }, [queryKey, page])

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
    setMembershipFilter('all')
    setArtistTypeFilter('all')
    setSpecialtyFilter('all')
    setTitleFilter('all')
  }

  // 전체 화면 로딩은 첫 진입에만 — 이후 검색·필터 중에는 입력창이 그대로 있어야 한다
  if (!hasLoaded) {
    return (
      <main className='min-h-screen'>
        <div className='container mx-auto px-4 py-16 text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-scholar-red mx-auto mb-4'></div>
          <p className='text-muted-foreground'>작가 정보를 불러오는 중...</p>
        </div>
        <LayoutFooter />
      </main>
    )
  }

  return (
    <main className='min-h-screen'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background dark:from-muted/20 dark:to-background'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-3xl md:text-5xl font-bold mb-4 tracking-tight text-foreground'>
            <TranslatedContent textKey='artists' />
          </h1>
          <p className='text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto'>
            동양서예협회의 다양한 작가들을 만나보세요
          </p>
          <p className='text-sm text-muted-foreground' aria-live='polite'>
            총 {total.toLocaleString('ko-KR')}명의 작가가 있습니다
          </p>
        </div>
      </section>

      <ArtistFilters
        searchQuery={searchQuery}
        membershipFilter={membershipFilter}
        artistTypeFilter={artistTypeFilter}
        specialtyFilter={specialtyFilter}
        titleFilter={titleFilter}
        onSearchChange={setSearchQuery}
        onMembershipChange={setMembershipFilter}
        onArtistTypeChange={setArtistTypeFilter}
        onSpecialtyChange={setSpecialtyFilter}
        onTitleChange={setTitleFilter}
        onReset={handleResetFilters}
      />

      <section
        className={`container mx-auto px-4 py-8 transition-opacity ${loading ? 'opacity-60' : ''}`}
        aria-busy={loading}
      >
        {filteredArtists.length === 0 ? (
          <div className='text-center py-16'>
            <User className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
            <p className='text-lg font-medium mb-2 text-foreground'>작가가 없습니다</p>
            <p className='text-sm text-muted-foreground'>
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 작가가 없습니다.'}
            </p>
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
                <Button variant='outline' onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? '불러오는 중…' : '더 보기'}
                </Button>
                <p className='text-xs text-muted-foreground'>
                  {filteredArtists.length.toLocaleString('ko-KR')} / {total.toLocaleString('ko-KR')}
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
    </main>
  )
}

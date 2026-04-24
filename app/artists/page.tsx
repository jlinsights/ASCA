'use client'

import { useEffect, useState, lazy, Suspense } from 'react'
import { User } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { TranslatedContent } from '@/components/translated-content'
import type { ArtistRow as Artist } from '@/lib/supabase'
import { ArtistFilters } from './_components/artist-filters'
import { ArtistCard } from './_components/artist-card'
import { formatPrice } from './_components/artists-meta'

const ArtistDetailModal = lazy(() => import('@/components/artists/ArtistDetailModal'))

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('all')
  const [artistTypeFilter, setArtistTypeFilter] = useState('all')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [titleFilter, setTitleFilter] = useState('all')
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/artists')
        if (!response.ok) {
          throw new Error('Failed to fetch artists')
        }
        const artistsData = await response.json()
        setArtists(artistsData.artists)
        setFilteredArtists(artistsData.artists)
      } catch {
        setArtists([])
        setFilteredArtists([])
      } finally {
        setLoading(false)
      }
    }

    loadArtists()
  }, [])

  useEffect(() => {
    let filtered = artists

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        artist =>
          artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (artist.specialties &&
            artist.specialties.some(specialty =>
              specialty.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      )
    }

    if (membershipFilter !== 'all') {
      filtered = filtered.filter(artist => (artist as any).membership_type === membershipFilter)
    }

    if (artistTypeFilter !== 'all') {
      filtered = filtered.filter(
        artist =>
          (artist as any).artist_type && (artist as any).artist_type.includes(artistTypeFilter)
      )
    }

    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(
        artist => artist.specialties && artist.specialties.includes(specialtyFilter)
      )
    }

    if (titleFilter !== 'all') {
      filtered = filtered.filter(artist => (artist as any).title === titleFilter)
    }

    setFilteredArtists(filtered)
  }, [searchQuery, membershipFilter, artistTypeFilter, specialtyFilter, titleFilter, artists])

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

  if (loading) {
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
          <p className='text-sm text-muted-foreground'>
            총 {filteredArtists.length}명의 작가가 있습니다
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

      <section className='container mx-auto px-4 py-8'>
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

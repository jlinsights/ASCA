'use client'

import { useState, useEffect } from 'react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero, type HeroFact } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, MapPin, User, ExternalLink, Award, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { toPublicArtist, type ArtistDbRow, type PublicArtist } from '@/lib/api/artist-mapper'
import { artistDisplayName } from '@/lib/api/artist-life'

// /api/artists/[id] 는 DB 행을 snake_case 그대로 준다. 예전에는 camelCase 타입(ArtistRow)을 붙여 읽어서
// profileImage·birthYear·nameEn 이 늘 비었다 — 사진이 있는 작가도 빈 아이콘이었다 (2026-10-25)
interface Artist extends PublicArtist {
  bioEn: string | null
  bioJa: string | null
  bioZh: string | null
  exhibitions: string[]
}

function toArtist(row: ArtistDbRow): Artist {
  return {
    ...toPublicArtist(row),
    bioEn: row.bio_en ?? null,
    bioJa: row.bio_ja ?? null,
    bioZh: row.bio_zh ?? null,
    exhibitions: row.exhibitions ?? [],
  }
}

/** /api/artworks?artist_id= 한 줄 — image_url 은 API 가 Storage 경로를 풀어 준 주소(없으면 null) */
interface ArtistArtwork {
  id: string
  title: string
  title_en: string | null
  medium: string | null
  year_created: number | null
  image_url: string | null
}

export default function ArtistPage() {
  const params = useParams()
  const id = params.id as string
  const [artist, setArtist] = useState<Artist | null>(null)
  const [artworks, setArtworks] = useState<ArtistArtwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language } = useLanguage()

  useEffect(() => {
    const loadArtistData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 작가 정보 로드 — 주소 조각은 uuid 또는 slug(옛 주소 포함)
        const response = await fetch(`/api/artists/${encodeURIComponent(id)}`)
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
            return
          }
          throw new Error('Failed to fetch artist')
        }
        const row = (await response.json()) as ArtistDbRow
        setArtist(toArtist(row))

        // 작품은 작가 정보와 따로 실패할 수 있다 — 작품을 못 불러와도 작가 소개는 보여 준다.
        // 주소가 slug 일 수 있으니 응답의 id 로 찾는다
        const artworksResponse = await fetch(
          `/api/artworks?artist_id=${encodeURIComponent(row.id)}`
        )
        if (artworksResponse.ok) {
          const { artworks: rows } = (await artworksResponse.json()) as {
            artworks?: ArtistArtwork[]
          }
          setArtworks(rows ?? [])
        }
      } catch (err) {
        setError(
          `작가 정보를 불러오는데 실패했습니다. 오류: ${err instanceof Error ? err.message : String(err)}`
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadArtistData()
    }
  }, [id])

  const deathYearOf = (artist: Artist): number | null => artist.deathYear

  // 작가 이름 다국어 지원
  const localizedName = (artist: Artist) => {
    switch (language) {
      case 'en':
        return artist.nameEn || artist.name
      case 'ja':
        return artist.nameJa || artist.name
      case 'zh':
        return artist.nameZh || artist.name
      default:
        return artist.name
    }
  }
  const getArtistName = (artist: Artist) =>
    artistDisplayName(localizedName(artist), deathYearOf(artist))

  // 작가 소개 다국어 지원
  const getArtistBio = (artist: Artist) => {
    switch (language) {
      case 'en':
        return artist.bioEn || artist.bio
      case 'ja':
        return artist.bioJa || artist.bio
      case 'zh':
        return artist.bioZh || artist.bio
      default:
        return artist.bio
    }
  }

  // 작품 제목 다국어 지원
  const getArtworkTitle = (artwork: ArtistArtwork) =>
    language === 'en' ? artwork.title_en || artwork.title : artwork.title

  const heroName = artist ? getArtistName(artist) : '작가 프로필'
  const heroFacts: HeroFact[] = [
    // 불러오는 중엔 '—' 로 자리를 잡고, 불러온 뒤 비어 있는 항목은 내리지 않는다(null → 숨김)
    { label: '출생', value: !artist ? '—' : artist.birthYear ? `${artist.birthYear}년` : null },
    { label: '국적', value: !artist ? '—' : artist.nationality || null },
  ]
  const hero = (
    <PageHero
      {...PAGE_HERO_MARKS.artists}
      tier='band'
      title={heroName}
      crumbs={[{ label: '작가 목록', href: '/artists' }, { label: heroName }]}
    >
      <HeroFacts facts={heroFacts} />
    </PageHero>
  )

  if (loading) {
    return (
      <main className='min-h-screen bg-transparent'>
        {hero}
        <div className='container mx-auto px-4 py-16 text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto'></div>
          <p className='mt-4 text-sm text-muted-foreground'>작가 정보를 불러오는 중...</p>
        </div>
        <LayoutFooter />
      </main>
    )
  }

  if (error || !artist) {
    return (
      <main className='min-h-screen bg-transparent'>
        {hero}
        <div className='container mx-auto px-4 py-16 text-center'>
          <p className='text-destructive'>{error || '작가를 찾을 수 없습니다.'}</p>
          <Link href='/artists'>
            <Button className='mt-4'>작가 목록으로 돌아가기</Button>
          </Link>
        </div>
        <LayoutFooter />
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-transparent'>
      {hero}

      {/* Artist Profile */}
      <section className='container mx-auto px-4 py-10 md:py-16'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Profile Image */}
          <div className='lg:col-span-1'>
            <div className='relative aspect-square rounded-lg overflow-hidden'>
              {artist.profileImage ? (
                <Image
                  src={artist.profileImage}
                  alt={getArtistName(artist)}
                  fill
                  className='object-cover'
                />
              ) : (
                <div className='w-full h-full bg-muted flex items-center justify-center'>
                  <User className='w-24 h-24 text-muted-foreground' />
                </div>
              )}
            </div>
          </div>

          {/* Artist Info */}
          <div className='lg:col-span-2 space-y-6'>
            <div>
              {/* Basic Info */}
              <div className='flex flex-wrap gap-4 mb-6'>
                {artist.birthYear && (
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <Calendar className='w-4 h-4 mr-2' />
                    {artist.birthYear}년 출생
                  </div>
                )}
                {deathYearOf(artist) && (
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <Calendar className='w-4 h-4 mr-2' />
                    {deathYearOf(artist)}년 별세
                  </div>
                )}
                {artist.nationality && (
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <MapPin className='w-4 h-4 mr-2' />
                    {artist.nationality}
                  </div>
                )}
              </div>

              {/* Membership, Artist Type, and Title */}
              <div className='flex flex-wrap gap-3 mb-6'>
                <Badge variant='default' className='bg-info/10 text-foreground hover:bg-info/20'>
                  {/* artist.membershipType placeholder */}
                  Member
                </Badge>
                <Badge variant='outline' className='border-success/30 text-foreground'>
                  {/* artist.artistType placeholder */}
                  Artist
                </Badge>
                {/* artist.title && (
                  <Badge variant="secondary" className="bg-highlight/10 text-foreground border-highlight/30 hover:bg-highlight/20">
                    {artist.title}
                  </Badge>
                ) */}
              </div>

              {/* Specialties */}
              {artist.specialties && artist.specialties.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-6'>
                  {artist.specialties.map((specialty, index) => (
                    <Badge key={index} variant='secondary'>
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div>
              <h2 className='text-xl font-medium mb-4'>작가 소개</h2>
              <p className='text-sm leading-relaxed whitespace-pre-line'>{getArtistBio(artist)}</p>
            </div>

            {/* Awards */}
            {artist.awards && artist.awards.length > 0 && (
              <div>
                <h2 className='text-xl font-medium mb-4 flex items-center'>
                  <Award className='w-5 h-5 mr-2' />
                  주요 수상 경력
                </h2>
                <ul className='space-y-2'>
                  {artist.awards.map((award, index) => (
                    <li key={index} className='text-sm text-muted-foreground'>
                      • {award}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exhibitions */}
            {artist.exhibitions && artist.exhibitions.length > 0 && (
              <div>
                <h2 className='text-xl font-medium mb-4 flex items-center'>
                  <Eye className='w-5 h-5 mr-2' />
                  주요 전시
                </h2>
                <ul className='space-y-2'>
                  {artist.exhibitions.map((exhibition, index) => (
                    <li key={index} className='text-sm text-muted-foreground'>
                      • {exhibition}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Artist's Artworks */}
      <section className='container mx-auto px-4 py-8 border-t'>
        <h2 className='text-3xl font-normal uppercase mb-8'>작품</h2>

        {artworks.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-lg font-medium mb-2'>작품이 없습니다</p>
            <p className='text-sm text-muted-foreground'>
              이 작가의 작품이 아직 등록되지 않았습니다.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {artworks.map(artwork => (
              <Link key={artwork.id} href={`/artworks/${artwork.id}`} className='group'>
                <div className='relative aspect-[3/4] mb-4 overflow-hidden rounded-lg bg-muted'>
                  {/* 이미지가 없으면 비워 둔다 — 예전에는 다른 작가 사진(kangdaehee.avif)으로 채웠다 */}
                  {artwork.image_url && (
                    <Image
                      src={artwork.image_url}
                      alt={getArtworkTitle(artwork)}
                      fill
                      sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                      className='object-contain p-3 transition-transform group-hover:scale-105'
                    />
                  )}
                </div>
                <div className='space-y-1'>
                  <h3 className='font-medium line-clamp-2'>{getArtworkTitle(artwork)}</h3>
                  <p className='text-sm text-muted-foreground'>
                    {[artwork.medium, artwork.year_created ? `${artwork.year_created}년` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <LayoutFooter />
    </main>
  )
}

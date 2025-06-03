"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, MapPin, User, ArrowLeft, ExternalLink, Award, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { getArtist } from '@/lib/api/artists'
import { getArtworks, type ArtworkWithArtist } from '@/lib/api/artworks'
import { useLanguage } from '@/contexts/language-context'
import type { Database } from '@/lib/supabase'

// 타입 정의
type Artist = Database['public']['Tables']['artists']['Row']

export default function ArtistPage() {
  const params = useParams()
  const id = params.id as string
  const [artist, setArtist] = useState<Artist | null>(null)
  const [artworks, setArtworks] = useState<ArtworkWithArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language } = useLanguage()

  useEffect(() => {
    const loadArtistData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('작가 ID:', id)

        // 작가 정보 로드
        console.log('작가 정보 로딩 시작...')
        const artistData = await getArtist(id)
        console.log('작가 정보 로딩 결과:', artistData)
        
        if (!artistData) {
          console.log('작가를 찾을 수 없음')
          notFound()
          return
        }
        setArtist(artistData)

        // 작가의 작품 목록 로드 (임시 비활성화)
        /*
        console.log('작품 정보 로딩 시작...')
        const { artworks: artistArtworks } = await getArtworks({
          artistId: id
        })
        console.log('작품 정보 로딩 결과:', artistArtworks)
        setArtworks(artistArtworks)
        */
        setArtworks([]) // 임시로 빈 배열 설정
        
      } catch (err) {
        console.error('Failed to load artist data:', err)
        console.error('Error details:', JSON.stringify(err, null, 2))
        setError(`작가 정보를 불러오는데 실패했습니다. 오류: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadArtistData()
    }
  }, [id])

  // 작가 이름 다국어 지원
  const getArtistName = (artist: Artist) => {
    switch (language) {
      case 'en':
        return artist.name_en || artist.name
      case 'ja':
        return artist.name_ja || artist.name
      case 'zh':
        return artist.name_zh || artist.name
      default:
        return artist.name
    }
  }

  // 작가 소개 다국어 지원
  const getArtistBio = (artist: Artist) => {
    switch (language) {
      case 'en':
        return artist.bio_en || artist.bio
      case 'ja':
        return artist.bio_ja || artist.bio
      case 'zh':
        return artist.bio_zh || artist.bio
      default:
        return artist.bio
    }
  }

  // 작품 제목 다국어 지원
  const getArtworkTitle = (artwork: ArtworkWithArtist) => {
    switch (language) {
      case 'en':
        return artwork.title_en || artwork.title
      case 'ja':
        return artwork.title_ja || artwork.title
      case 'zh':
        return artwork.title_zh || artwork.title
      default:
        return artwork.title
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">작가 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !artist) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-red-500">{error || '작가를 찾을 수 없습니다.'}</p>
          <Link href="/artists">
            <Button className="mt-4">
              작가 목록으로 돌아가기
            </Button>
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link 
          href="/artists"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          작가 목록으로 돌아가기
        </Link>
      </div>

      {/* Artist Profile */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image */}
          <div className="lg:col-span-1">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              {artist.profile_image ? (
                <Image
                  src={artist.profile_image}
                  alt={getArtistName(artist)}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Artist Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-normal uppercase mb-4">
                {getArtistName(artist)}
              </h1>
              
              {/* Basic Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                {artist.birth_year && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {artist.birth_year}년 출생
                  </div>
                )}
                {artist.nationality && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {artist.nationality}
                  </div>
                )}
              </div>

              {/* Membership, Artist Type, and Title */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {artist.membership_type}
                </Badge>
                <Badge variant="outline" className="border-green-200 text-green-800">
                  {artist.artist_type}
                </Badge>
                {artist.title && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">
                    {artist.title}
                  </Badge>
                )}
              </div>

              {/* Specialties */}
              {artist.specialties && artist.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {artist.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div>
              <h2 className="text-xl font-medium mb-4">작가 소개</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {getArtistBio(artist)}
              </p>
            </div>

            {/* Awards */}
            {artist.awards && artist.awards.length > 0 && (
              <div>
                <h2 className="text-xl font-medium mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  주요 수상 경력
                </h2>
                <ul className="space-y-2">
                  {artist.awards.map((award, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {award}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exhibitions */}
            {artist.exhibitions && artist.exhibitions.length > 0 && (
              <div>
                <h2 className="text-xl font-medium mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  주요 전시
                </h2>
                <ul className="space-y-2">
                  {artist.exhibitions.map((exhibition, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
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
      <section className="container mx-auto px-4 py-8 border-t">
        <h2 className="text-3xl font-normal uppercase mb-8">작품</h2>
        
        {artworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium mb-2">작품이 없습니다</p>
            <p className="text-sm text-muted-foreground">
              이 작가의 작품이 아직 등록되지 않았습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <Link key={artwork.id} href={`/artworks/${artwork.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={artwork.thumbnail}
                      alt={getArtworkTitle(artwork)}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {artwork.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-600 text-white">추천</Badge>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium line-clamp-2">
                      {getArtworkTitle(artwork)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {artwork.year}년
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {artwork.category}
                      </Badge>
                      <span className={`text-xs px-2 py-1 rounded ${
                        artwork.availability === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : artwork.availability === 'sold'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {artwork.availability === 'available' 
                          ? '판매 가능' 
                          : artwork.availability === 'sold'
                          ? '판매 완료'
                          : '예약됨'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
} 
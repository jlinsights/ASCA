'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter, 
  MapPin, 
  Eye,
  Heart,
  Mail,
  ExternalLink
} from 'lucide-react'
import { fetchPublicPortfolio } from '@/lib/api/profiles'
import { ArtworkCard } from '@/components/artwork/artwork-card'
import type { PublicPortfolio } from '@/types/profile'

interface PortfolioClientProps {
  artistId: string
}

export function PortfolioClient({ artistId }: PortfolioClientProps) {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<PublicPortfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPortfolio = async () => {
      setLoading(true)
      const { data, error } = await fetchPublicPortfolio(artistId)
      
      if (error) {
        setError('포트폴리오를 불러오는데 실패했습니다.')
      } else if (data) {
        setPortfolio(data)
      }
      
      setLoading(false)
    }

    loadPortfolio()
  }, [artistId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-celadon-green mb-4" />
            <p className="text-muted-foreground">포트폴리오를 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">포트폴리오를 찾을 수 없습니다</h2>
            <p className="text-muted-foreground mb-6">{error || '존재하지 않는 작가입니다.'}</p>
            <Button onClick={() => router.push('/artists')}>
              작가 목록으로 돌아가기
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const { profile, featuredArtworks, stats } = portfolio
  const config = profile.portfolioConfig

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-rice-paper via-silk-cream to-celadon-green/10 dark:from-ink-black dark:via-stone-gray/20 dark:to-celadon-green/10 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Profile Image */}
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-celadon-green shadow-xl flex-shrink-0">
                  {profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt={profile.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-celadon-green/20 flex items-center justify-center">
                      <span className="text-6xl font-serif text-celadon-green">
                        {profile.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                    {profile.name}
                  </h1>
                  {profile.nameEn && (
                    <p className="text-xl text-muted-foreground mb-4">{profile.nameEn}</p>
                  )}
                  
                  {/* Specialization */}
                  {profile.specialization && profile.specialization.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      {profile.specialization.map((spec) => (
                        <Badge key={spec} variant="secondary" className="bg-celadon-green/20 text-celadon-green">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Location */}
                  {profile.location && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4 justify-center md:justify-start">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  {/* Bio */}
                  {config?.showContact !== false && (
                    <p className="text-foreground leading-relaxed mb-6 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}

                  {/* Social Links */}
                  {profile.socialLinks && Object.values(profile.socialLinks).some(v => v) && (
                    <div className="flex gap-3 justify-center md:justify-start">
                      {profile.socialLinks.website && (
                        <a
                          href={profile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-celadon-green/10 hover:bg-celadon-green/20 transition-colors"
                        >
                          <Globe className="w-5 h-5 text-celadon-green" />
                        </a>
                      )}
                      {profile.socialLinks.instagram && (
                        <a
                          href={profile.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-celadon-green/10 hover:bg-celadon-green/20 transition-colors"
                        >
                          <Instagram className="w-5 h-5 text-celadon-green" />
                        </a>
                      )}
                      {profile.socialLinks.facebook && (
                        <a
                          href={profile.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-celadon-green/10 hover:bg-celadon-green/20 transition-colors"
                        >
                          <Facebook className="w-5 h-5 text-celadon-green" />
                        </a>
                      )}
                      {profile.socialLinks.twitter && (
                        <a
                          href={profile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-celadon-green/10 hover:bg-celadon-green/20 transition-colors"
                        >
                          <Twitter className="w-5 h-5 text-celadon-green" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <div className="bg-card border border-celadon-green/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-celadon-green">{stats.totalArtworks}</div>
                  <div className="text-sm text-muted-foreground mt-1">작품</div>
                </div>
                <div className="bg-card border border-celadon-green/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-celadon-green">{stats.totalExhibitions}</div>
                  <div className="text-sm text-muted-foreground mt-1">전시</div>
                </div>
                <div className="bg-card border border-celadon-green/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-celadon-green">{stats.profileViews}</div>
                  <div className="text-sm text-muted-foreground mt-1">조회수</div>
                </div>
                <div className="bg-card border border-celadon-green/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-celadon-green">{stats.portfolioViews}</div>
                  <div className="text-sm text-muted-foreground mt-1">포트폴리오 조회</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Artworks */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                  대표 작품
                </h2>
                <p className="text-muted-foreground">
                  작가의 선별된 작품들을 감상해보세요
                </p>
              </div>

              {featuredArtworks.length === 0 ? (
                <div className="text-center py-12 bg-card border border-dashed border-celadon-green/30 rounded-lg">
                  <p className="text-muted-foreground">아직 공개된 작품이 없습니다.</p>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  config?.layout === 'list' 
                    ? 'grid-cols-1' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {featuredArtworks.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id}
                      artwork={artwork}
                      showActions={false}
                    />
                  ))}
                </div>
              )}

              {featuredArtworks.length > 0 && (
                <div className="text-center mt-12">
                  <Button asChild variant="outline" size="lg">
                    <Link href={`/artists/${artistId}/artworks`}>
                      모든 작품 보기
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        {config?.showContact && (profile.email || profile.phone) && (
          <section className="py-16 bg-rice-paper/50 dark:bg-stone-gray/10">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                  문의하기
                </h2>
                <p className="text-muted-foreground mb-8">
                  작품 구매나 협업에 관심이 있으시다면 연락해주세요
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {profile.email && (
                    <Button asChild size="lg" className="bg-celadon-green hover:bg-celadon-green/90">
                      <a href={`mailto:${profile.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        이메일 보내기
                      </a>
                    </Button>
                  )}
                  {profile.phone && (
                    <Button asChild variant="outline" size="lg">
                      <a href={`tel:${profile.phone}`}>
                        전화 문의
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Award, MapPin, Mail, Globe, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { 
  type ExtendedArtist, 
  getArtistContactInfo, 
  getArtistStats,
  hasArtworks,
  hasStats
} from "@/lib/types/artist-extended"

// 확장된 Artist 타입 사용
type Artist = ExtendedArtist

interface ArtistDetailModalProps {
  artist: Artist | null
  isOpen: boolean
  onClose: () => void
  followedArtists: Set<string>
  onToggleFollow: (artistId: string) => void
  formatPrice: (price: number) => string
}

export default function ArtistDetailModal({
  artist,
  isOpen,
  onClose,
  followedArtists,
  onToggleFollow,
  formatPrice
}: ArtistDetailModalProps) {
  const { language } = useLanguage()

  if (!artist) return null

  // Type-safe helper functions
  const contactInfo = getArtistContactInfo(artist)
  const stats = getArtistStats(artist)

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {artist.name} {language === 'ko' ? '작가 프로필' : 'Artist Profile'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 헤더 섹션 */}
          <div className="relative">
            <div className="h-32 bg-muted rounded-lg overflow-hidden">
              <Image
                src={artist.profile_image || "/placeholder-cover.jpg"}
                alt={`${artist.name} cover`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            
            <div className="flex items-end gap-4 px-6 -mt-8 relative">
              <div className="w-20 h-20 bg-white rounded-full border-4 border-white overflow-hidden">
                <Image
                  src={artist.profile_image || "/placeholder-profile.jpg"}
                  alt={artist.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {artist.name}
                </h2>
                <p className="text-muted-foreground">
                  {artist.name_en || artist.birth_year ? `${artist.name_en || ''} ${artist.birth_year ? `(${artist.birth_year})` : ''}`.trim() : ''}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {contactInfo.location || '위치 정보 없음'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {contactInfo.email || '이메일 정보 없음'}
                  </span>
                  {contactInfo.website && (
                    <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-celadon">
                      <Globe className="h-3 w-3" />
                      {language === 'ko' ? '웹사이트' : 'Website'}
                    </a>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => onToggleFollow(artist.id)}
                className="mb-2"
              >
                <Users className={`h-4 w-4 mr-2 ${followedArtists.has(artist.id) ? 'fill-current' : ''}`} />
                {followedArtists.has(artist.id) 
                  ? (language === 'ko' ? '팔로잉' : 'Following')
                  : (language === 'ko' ? '팔로우' : 'Follow')
                }
              </Button>
            </div>
          </div>

          {/* 탭 콘텐츠 */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">{language === 'ko' ? '소개' : 'About'}</TabsTrigger>
              <TabsTrigger value="artworks">{language === 'ko' ? '작품' : 'Artworks'}</TabsTrigger>
              <TabsTrigger value="exhibitions">{language === 'ko' ? '전시' : 'Exhibitions'}</TabsTrigger>
              <TabsTrigger value="awards">{language === 'ko' ? '수상' : 'Awards'}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-4">
              {/* 전문 분야 */}
              <div>
                <h3 className="font-semibold mb-2">{language === 'ko' ? '전문 분야' : 'Specialties'}</h3>
                <div className="flex flex-wrap gap-2">
                  {artist.specialties?.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  )) || <p className="text-muted-foreground">전문 분야 정보가 없습니다.</p>}
                </div>
              </div>
              
              {/* 소개 */}
              <div>
                <h3 className="font-semibold mb-2">{language === 'ko' ? '작가 소개' : 'Biography'}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'ko' ? artist.bio : (artist.bio_en || artist.bio)}
                </p>
              </div>
              
              {/* 학력 */}
              <div>
                <h3 className="font-semibold mb-2">{language === 'ko' ? '학력' : 'Education'}</h3>
                <ul className="space-y-1 text-muted-foreground">
                  {(artist.education || ['학력 정보 없음']).map((edu: string, index: number) => (
                    <li key={index}>• {edu}</li>
                  ))}
                </ul>
              </div>
              
              {/* 통계 */}
              <div>
                <h3 className="font-semibold mb-2">{language === 'ko' ? '활동 통계' : 'Statistics'}</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-celadon">{stats.artworksCount}</div>
                    <div className="text-sm text-muted-foreground">{language === 'ko' ? '작품' : 'Artworks'}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-celadon">{stats.exhibitionsCount}</div>
                    <div className="text-sm text-muted-foreground">{language === 'ko' ? '전시' : 'Exhibitions'}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-celadon">{stats.viewCount}</div>
                    <div className="text-sm text-muted-foreground">{language === 'ko' ? '조회수' : 'Views'}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-celadon">{stats.followers}</div>
                    <div className="text-sm text-muted-foreground">{language === 'ko' ? '팔로워' : 'Followers'}</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="artworks">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hasArtworks(artist) ? (
                  artist.artworks.map((artwork) => (
                    <Card key={artwork.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative aspect-[3/4] bg-muted">
                          <Image
                            src={artwork.imageUrl || "/placeholder-artwork.jpg"}
                            alt={artwork.title || "작품"}
                            fill
                            className="object-cover"
                          />
                          {artwork.isForSale && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary">
                                {language === 'ko' ? '판매중' : 'For Sale'}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium mb-1">{artwork.title || "제목 없음"}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{artwork.year || "연도 미상"}</p>
                          {artwork.isForSale && artwork.price && (
                            <p className="text-sm font-medium text-celadon">
                              {formatPrice(artwork.price)}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-center">등록된 작품이 없습니다.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="exhibitions">
              <div className="space-y-4">
                {artist.exhibitions && artist.exhibitions.length > 0 ? (
                  artist.exhibitions.map((exhibition, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium mb-1">{typeof exhibition === 'string' ? exhibition : (exhibition as any).title || "전시명"}</h4>
                            <p className="text-sm text-muted-foreground mb-1">{typeof exhibition === 'string' ? "장소 미상" : (exhibition as any).venue || "장소 미상"}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {typeof exhibition === 'string' ? "전시" : (exhibition as any).type || "전시"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {typeof exhibition === 'string' ? "연도 미상" : (exhibition as any).year || "연도 미상"}
                              </span>
                            </div>
                          </div>
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">전시 이력이 없습니다.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="awards">
              <div className="space-y-4">
                {artist.awards && artist.awards.length > 0 ? (
                  artist.awards.map((award, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-yellow-500" />
                          <span className="font-medium">{award}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">수상 이력이 없습니다.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
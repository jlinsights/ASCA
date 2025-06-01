'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AdminNavigation } from '@/components/AdminNavigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  Globe,
  Calendar,
  Award,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

// 임시 작가 데이터
const mockArtists = [
  {
    id: '1',
    name: '김서예',
    nameEn: 'Kim Seoye',
    email: 'kim.seoye@example.com',
    birthYear: 1975,
    nationality: '대한민국',
    specialties: ['행서', '초서', '현대서예'],
    bio: '전통 서예의 현대적 해석을 통해 새로운 예술 언어를 창조하는 작가입니다.',
    profileImage: '/images/artists/kim-seoye.jpg',
    website: 'https://kimseoye.art',
    isActive: true,
    artworksCount: 24,
    exhibitionsCount: 8,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: '이묵향',
    nameEn: 'Lee Mukhyang',
    email: 'lee.mukhyang@example.com',
    birthYear: 1968,
    nationality: '대한민국',
    specialties: ['해서', '예서', '전서'],
    bio: '한중일 서예 교류의 가교 역할을 하며 동아시아 서예 문화 발전에 기여하고 있습니다.',
    profileImage: '/images/artists/lee-mukhyang.jpg',
    website: null,
    isActive: true,
    artworksCount: 18,
    exhibitionsCount: 12,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-14'
  },
  {
    id: '3',
    name: '박문인',
    nameEn: 'Park Munin',
    email: 'park.munin@example.com',
    birthYear: 1982,
    nationality: '대한민국',
    specialties: ['현대서예', '캘리그래피'],
    bio: '젊은 감각으로 서예의 새로운 가능성을 탐구하는 신진 작가입니다.',
    profileImage: '/images/artists/park-munin.jpg',
    website: 'https://parkmunin.com',
    isActive: false,
    artworksCount: 12,
    exhibitionsCount: 3,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-12'
  }
]

export default function ArtistsManagement() {
  const { language } = useLanguage()
  const [artists, setArtists] = useState(mockArtists)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteArtist = (id: string) => {
    if (confirm(language === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setArtists(artists.filter(artist => artist.id !== id))
    }
  }

  const toggleArtistStatus = (id: string) => {
    setArtists(artists.map(artist =>
      artist.id === id ? { ...artist, isActive: !artist.isActive } : artist
    ))
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <AdminNavigation currentPage="artists" />
        
        <main className="container mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {language === 'ko' ? '작가 관리' : 'Artists Management'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ko' 
                  ? '작가 프로필을 관리하고 작품을 연결하세요.'
                  : 'Manage artist profiles and connect artworks.'
                }
              </p>
            </div>
            <Button className="bg-celadon hover:bg-celadon/90">
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ko' ? '새 작가 추가' : 'Add New Artist'}
            </Button>
          </div>

          {/* 검색 및 필터 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === 'ko' ? '작가명, 이메일로 검색...' : 'Search by name, email...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    {language === 'ko' ? '전체' : 'All'} ({artists.length})
                  </Button>
                  <Button variant="outline" size="sm">
                    {language === 'ko' ? '활성' : 'Active'} ({artists.filter(a => a.isActive).length})
                  </Button>
                  <Button variant="outline" size="sm">
                    {language === 'ko' ? '비활성' : 'Inactive'} ({artists.filter(a => !a.isActive).length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 작가 목록 */}
          <div className="grid gap-6">
            {filteredArtists.map((artist) => (
              <Card key={artist.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* 프로필 이미지 */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                        {artist.profileImage ? (
                          <img 
                            src={artist.profileImage} 
                            alt={artist.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Users className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* 작가 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-foreground">
                              {artist.name}
                            </h3>
                            <Badge variant={artist.isActive ? "default" : "secondary"}>
                              {artist.isActive 
                                ? (language === 'ko' ? '활성' : 'Active')
                                : (language === 'ko' ? '비활성' : 'Inactive')
                              }
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {artist.nameEn} • {artist.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {artist.birthYear}년생 • {artist.nationality}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            {language === 'ko' ? '보기' : 'View'}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            {language === 'ko' ? '편집' : 'Edit'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleArtistStatus(artist.id)}
                          >
                            {artist.isActive 
                              ? (language === 'ko' ? '비활성화' : 'Deactivate')
                              : (language === 'ko' ? '활성화' : 'Activate')
                            }
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteArtist(artist.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 전문 분야 */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {artist.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* 소개 */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {artist.bio}
                      </p>

                      {/* 통계 및 링크 */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {language === 'ko' ? '작품' : 'Artworks'}: {artist.artworksCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            <span>
                              {language === 'ko' ? '전시' : 'Exhibitions'}: {artist.exhibitionsCount}
                            </span>
                          </div>
                        </div>
                        
                        {artist.website && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={artist.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              {language === 'ko' ? '웹사이트' : 'Website'}
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* 메타 정보 */}
                      <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                        {language === 'ko' ? '생성' : 'Created'}: {artist.createdAt} • 
                        {language === 'ko' ? '수정' : 'Updated'}: {artist.updatedAt}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArtists.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {language === 'ko' ? '작가가 없습니다' : 'No artists found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'ko' 
                    ? '검색 조건을 변경하거나 새 작가를 추가해보세요.'
                    : 'Try changing your search criteria or add a new artist.'
                  }
                </p>
                <Button className="bg-celadon hover:bg-celadon/90">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'ko' ? '첫 작가 추가' : 'Add First Artist'}
                </Button>
              </CardContent>
            </Card>
          )}
        </main>

        <Footer />
      </div>
    </AdminProtectedRoute>
  )
} 
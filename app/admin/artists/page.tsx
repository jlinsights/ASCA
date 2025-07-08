'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AdminNavigation } from '@/components/admin-navigation'
import AdminProtectedRoute from '@/components/admin-protected-route'
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
import { getArtists } from '@/lib/api/artists'
import type { Database } from '@/lib/supabase'
import Image from 'next/image'

// Supabase 작가 타입
type Artist = Database['public']['Tables']['artists']['Row']

export default function ArtistsManagement() {
  const { language } = useLanguage()
  const [artists, setArtists] = useState<Artist[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [membershipFilter, setMembershipFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Supabase에서 작가 데이터 로드
  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true)
        setError(null)
        const { artists: artistsData } = await getArtists()
        setArtists(artistsData)
      } catch (err) {
        
        setError('작가 데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadArtists()
  }, [])

  // 검색어와 회원구분 필터 모두 적용
  const filteredArtists = artists.filter(artist => {
    // 검색어 필터링
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.name_en && artist.name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (artist.nationality && artist.nationality.toLowerCase().includes(searchTerm.toLowerCase()))

    // 회원구분 필터링
    const matchesMembership = membershipFilter === 'all' || 
      artist.membership_type === membershipFilter

    return matchesSearch && matchesMembership
  })

  const handleDeleteArtist = (id: string) => {
    if (confirm(language === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      // TODO: 실제 삭제 API 호출
      setArtists(artists.filter(artist => artist.id !== id))
    }
  }

  // 회원구분별 통계
  const getMembershipCount = (type: string) => {
    return artists.filter(a => a.membership_type === type).length
  }

  // 필터 버튼 스타일 결정
  const getFilterButtonVariant = (filterType: string) => {
    return membershipFilter === filterType ? "default" : "outline"
  }

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <AdminNavigation currentPage="artists" />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
              <p>작가 데이터를 불러오는 중...</p>
            </div>
          </main>
        </div>
      </AdminProtectedRoute>
    )
  }

  if (error) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <AdminNavigation currentPage="artists" />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            </div>
          </main>
        </div>
      </AdminProtectedRoute>
    )
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
                  ? `작가 프로필을 관리하고 작품을 연결하세요. (총 ${artists.length}명 중 ${filteredArtists.length}명 표시)`
                  : `Manage artist profiles and connect artworks. (Showing ${filteredArtists.length} of ${artists.length})`
                }
              </p>
            </div>
            <Link href="/admin/artists/new">
              <Button className="bg-celadon hover:bg-celadon/90">
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ko' ? '새 작가 추가' : 'Add New Artist'}
              </Button>
            </Link>
          </div>

          {/* 검색 및 필터 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === 'ko' ? '작가명, 이메일로 검색...' : 'Search by name, email...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* 필터 버튼들 */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={getFilterButtonVariant('all')} 
                    size="sm"
                    onClick={() => setMembershipFilter('all')}
                  >
                    {language === 'ko' ? '전체' : 'All'} ({artists.length})
                  </Button>
                  <Button 
                    variant={getFilterButtonVariant('초대작가')} 
                    size="sm"
                    onClick={() => setMembershipFilter('초대작가')}
                  >
                    {language === 'ko' ? '초대작가' : 'Invited'} ({getMembershipCount('초대작가')})
                  </Button>
                  <Button 
                    variant={getFilterButtonVariant('정회원')} 
                    size="sm"
                    onClick={() => setMembershipFilter('정회원')}
                  >
                    {language === 'ko' ? '정회원' : 'Full Member'} ({getMembershipCount('정회원')})
                  </Button>
                  <Button 
                    variant={getFilterButtonVariant('준회원')} 
                    size="sm"
                    onClick={() => setMembershipFilter('준회원')}
                  >
                    {language === 'ko' ? '준회원' : 'Associate'} ({getMembershipCount('준회원')})
                  </Button>
                  <Button 
                    variant={getFilterButtonVariant('특별회원')} 
                    size="sm"
                    onClick={() => setMembershipFilter('특별회원')}
                  >
                    {language === 'ko' ? '특별회원' : 'Special'} ({getMembershipCount('특별회원')})
                  </Button>
                  <Button 
                    variant={getFilterButtonVariant('명예회원')} 
                    size="sm"
                    onClick={() => setMembershipFilter('명예회원')}
                  >
                    {language === 'ko' ? '명예회원' : 'Honorary'} ({getMembershipCount('명예회원')})
                  </Button>
                </div>

                {/* 현재 필터 상태 표시 */}
                {membershipFilter !== 'all' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>현재 필터:</span>
                    <Badge variant="secondary">{membershipFilter}</Badge>
                    <span>({filteredArtists.length}명)</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setMembershipFilter('all')}
                      className="text-xs"
                    >
                      필터 해제
                    </Button>
                  </div>
                )}
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
                        {artist.profile_image ? (
                          <Image 
                            src={artist.profile_image} 
                            alt={artist.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-lg"
                            unoptimized
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
                            <Badge variant="default">
                              {artist.membership_type || '회원'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {artist.name_en || '영문명 없음'} • {artist.artist_type || '일반작가'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {artist.birth_year ? `${artist.birth_year}년생` : '출생년도 미상'} • {artist.nationality || '국적 미상'}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/artists/${artist.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              {language === 'ko' ? '보기' : 'View'}
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            {language === 'ko' ? '편집' : 'Edit'}
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
                          {artist.specialties && artist.specialties.length > 0 ? (
                            artist.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              전문분야 미설정
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* 소개 */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {artist.bio || '소개 정보가 없습니다.'}
                      </p>

                      {/* 통계 및 링크 */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            <span>
                              {language === 'ko' ? '수상' : 'Awards'}: {artist.awards?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {language === 'ko' ? '전시' : 'Exhibitions'}: {artist.exhibitions?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 메타 정보 */}
                      <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                        {language === 'ko' ? '생성' : 'Created'}: {new Date(artist.created_at).toLocaleDateString()} • 
                        {language === 'ko' ? '수정' : 'Updated'}: {new Date(artist.updated_at).toLocaleDateString()}
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
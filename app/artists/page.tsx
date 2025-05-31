"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TranslatedContent } from "@/components/translated-content"
import { Input } from "@/components/ui/input"
import { Search, User, Filter, Award, Calendar, Star, MapPin, Mail, Globe, Users } from "lucide-react"
import { AdaptiveImage } from "@/components/adaptive-image"
import { getArtists } from "@/lib/api/artists"
import type { Database } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"

// 데이터베이스 타입 사용
type Artist = Database['public']['Tables']['artists']['Row']

const specialtyFilters = [
  { value: 'all', label: { ko: '전체', en: 'All' } },
  { value: '해서', label: { ko: '해서', en: 'Regular Script' } },
  { value: '행서', label: { ko: '행서', en: 'Semi-cursive Script' } },
  { value: '초서', label: { ko: '초서', en: 'Cursive Script' } },
  { value: '예서', label: { ko: '예서', en: 'Clerical Script' } },
  { value: '전서', label: { ko: '전서', en: 'Seal Script' } },
  { value: '현대서예', label: { ko: '현대서예', en: 'Modern Calligraphy' } },
  { value: '캘리그래피', label: { ko: '캘리그래피', en: 'Calligraphy' } },
  { value: '디지털서예', label: { ko: '디지털서예', en: 'Digital Calligraphy' } }
]

export default function ArtistsPage() {
  const { language } = useLanguage()
  const [artists, setArtists] = useState<Artist[]>([])
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [membershipFilter, setMembershipFilter] = useState<string>('all')
  const [artistTypeFilter, setArtistTypeFilter] = useState<string>('all')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all')
  const [titleFilter, setTitleFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedArtist, setSelectedArtist] = useState<typeof artists[0] | null>(null)
  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set())

  // 작가 데이터 로드
  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true)
        const artistsData = await getArtists()
        setArtists(artistsData)
        setFilteredArtists(artistsData)
      } catch (error) {
        console.error('Failed to load artists:', error)
        setArtists([])
        setFilteredArtists([])
      } finally {
        setLoading(false)
      }
    }

    loadArtists()
  }, [])

  // 필터링 로직
  useEffect(() => {
    let filtered = artists

    // 검색 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(artist => 
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (artist.specialties && artist.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    }

    // 회원 타입 필터
    if (membershipFilter !== 'all') {
      filtered = filtered.filter(artist => artist.membership_type === membershipFilter)
    }

    // 작가 타입 필터
    if (artistTypeFilter !== 'all') {
      filtered = filtered.filter(artist => artist.artist_type === artistTypeFilter)
    }

    // 전문분야 필터
    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(artist => 
        artist.specialties && artist.specialties.includes(specialtyFilter)
      )
    }

    // 직위 필터
    if (titleFilter !== 'all') {
      filtered = filtered.filter(artist => artist.title === titleFilter)
    }

    setFilteredArtists(filtered)
  }, [searchQuery, membershipFilter, artistTypeFilter, specialtyFilter, titleFilter, artists])

  // 작가 타입 색상 반환
  const getArtistTypeBadgeColor = (type: string) => {
    const colors = {
      '공모작가': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      '청년작가': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      '일반작가': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600',
      '추천작가': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
      '초대작가': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
  }

  // 전문분야별 색상 및 스타일 반환
  const getSpecialtyBadgeStyle = (specialty: string) => {
    const styles = {
      '전통서예': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
      '현대서예': 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
      '캘리그라피': 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
      '한문서예': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
      '한글서예': 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
      '문인화': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
      '수묵화': 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600',
      '민화': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
      '동양화': 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
      '전각': 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600',
      '서각': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
    }
    return styles[specialty as keyof typeof styles] || 'bg-muted/60 text-muted-foreground border-muted'
  }

  // 전문분야 우선순위 정렬
  const sortSpecialties = (specialties: string[] | null) => {
    if (!specialties) return []
    
    const priority = {
      '전통서예': 1, '현대서예': 2, '캘리그라피': 3,
      '한문서예': 4, '한글서예': 5,
      '문인화': 6, '수묵화': 7, '민화': 8, '동양화': 9,
      '전각': 10, '서각': 11
    }
    
    return specialties.sort((a, b) => {
      const priorityA = priority[a as keyof typeof priority] || 99
      const priorityB = priority[b as keyof typeof priority] || 99
      return priorityA - priorityB
    })
  }

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

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scholar-red mx-auto mb-4"></div>
          <p className="text-muted-foreground">작가 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />

      {/* Artists Header */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background dark:from-muted/20 dark:to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">
            <TranslatedContent textKey="artists" />
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            동양서예협회의 다양한 작가들을 만나보세요
          </p>
          <p className="text-sm text-muted-foreground">
            총 {filteredArtists.length}명의 작가가 있습니다
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-card dark:bg-card">
        <div className="container mx-auto px-4 py-6">
          {/* PC Layout */}
          <div className="hidden lg:flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="작가명 또는 전문분야로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="회원 구분" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="준회원">준회원</SelectItem>
                  <SelectItem value="정회원">정회원</SelectItem>
                  <SelectItem value="특별회원">특별회원</SelectItem>
                  <SelectItem value="명예회원">명예회원</SelectItem>
                </SelectContent>
              </Select>

              <Select value={artistTypeFilter} onValueChange={setArtistTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="작가 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="초대작가">초대작가</SelectItem>
                  <SelectItem value="추천작가">추천작가</SelectItem>
                  <SelectItem value="일반작가">일반작가</SelectItem>
                  <SelectItem value="청년작가">청년작가</SelectItem>
                  <SelectItem value="공모작가">공모작가</SelectItem>
                </SelectContent>
              </Select>

              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="전문분야" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="전통서예">전통서예</SelectItem>
                  <SelectItem value="현대서예">현대서예</SelectItem>
                  <SelectItem value="캘리그라피">캘리그라피</SelectItem>
                  <SelectItem value="한문서예">한문서예</SelectItem>
                  <SelectItem value="한글서예">한글서예</SelectItem>
                  <SelectItem value="문인화">문인화</SelectItem>
                  <SelectItem value="수묵화">수묵화</SelectItem>
                  <SelectItem value="민화">민화</SelectItem>
                  <SelectItem value="동양화">동양화</SelectItem>
                  <SelectItem value="전각">전각</SelectItem>
                  <SelectItem value="서각">서각</SelectItem>
                </SelectContent>
              </Select>

              <Select value={titleFilter} onValueChange={setTitleFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="직위" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="회장">회장</SelectItem>
                  <SelectItem value="부회장">부회장</SelectItem>
                  <SelectItem value="명예이사장">명예이사장</SelectItem>
                  <SelectItem value="이사장">이사장</SelectItem>
                  <SelectItem value="심사위원장">심사위원장</SelectItem>
                  <SelectItem value="운영위원장">운영위원장</SelectItem>
                  <SelectItem value="상임고문">상임고문</SelectItem>
                  <SelectItem value="고문">고문</SelectItem>
                  <SelectItem value="상임이사">상임이사</SelectItem>
                  <SelectItem value="이사">이사</SelectItem>
                  <SelectItem value="감사">감사</SelectItem>
                  <SelectItem value="자문위원">자문위원</SelectItem>
                  <SelectItem value="심사위원">심사위원</SelectItem>
                  <SelectItem value="운영위원">운영위원</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setMembershipFilter('all')
                  setArtistTypeFilter('all')
                  setSpecialtyFilter('all')
                  setTitleFilter('all')
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                초기화
              </Button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="작가명 또는 전문분야로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Mobile Filters */}
            <div className="grid grid-cols-2 gap-3">
              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="회원 구분" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="준회원">준회원</SelectItem>
                  <SelectItem value="정회원">정회원</SelectItem>
                  <SelectItem value="특별회원">특별회원</SelectItem>
                  <SelectItem value="명예회원">명예회원</SelectItem>
                </SelectContent>
              </Select>

              <Select value={artistTypeFilter} onValueChange={setArtistTypeFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="작가 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="초대작가">초대작가</SelectItem>
                  <SelectItem value="추천작가">추천작가</SelectItem>
                  <SelectItem value="일반작가">일반작가</SelectItem>
                  <SelectItem value="청년작가">청년작가</SelectItem>
                  <SelectItem value="공모작가">공모작가</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Specialty Filter */}
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="전문분야" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 분야</SelectItem>
                <SelectItem value="전통서예">전통서예</SelectItem>
                <SelectItem value="현대서예">현대서예</SelectItem>
                <SelectItem value="캘리그라피">캘리그라피</SelectItem>
                <SelectItem value="한문서예">한문서예</SelectItem>
                <SelectItem value="한글서예">한글서예</SelectItem>
                <SelectItem value="문인화">문인화</SelectItem>
                <SelectItem value="수묵화">수묵화</SelectItem>
                <SelectItem value="민화">민화</SelectItem>
                <SelectItem value="동양화">동양화</SelectItem>
                <SelectItem value="전각">전각</SelectItem>
                <SelectItem value="서각">서각</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Title Filter */}
            <Select value={titleFilter} onValueChange={setTitleFilter}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="직위" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 직위</SelectItem>
                <SelectItem value="회장">회장</SelectItem>
                <SelectItem value="부회장">부회장</SelectItem>
                <SelectItem value="명예이사장">명예이사장</SelectItem>
                <SelectItem value="이사장">이사장</SelectItem>
                <SelectItem value="심사위원장">심사위원장</SelectItem>
                <SelectItem value="운영위원장">운영위원장</SelectItem>
                <SelectItem value="상임고문">상임고문</SelectItem>
                <SelectItem value="고문">고문</SelectItem>
                <SelectItem value="상임이사">상임이사</SelectItem>
                <SelectItem value="이사">이사</SelectItem>
                <SelectItem value="감사">감사</SelectItem>
                <SelectItem value="자문위원">자문위원</SelectItem>
                <SelectItem value="심사위원">심사위원</SelectItem>
                <SelectItem value="운영위원">운영위원</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Reset Button */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setMembershipFilter('all')
                setArtistTypeFilter('all')
                setSpecialtyFilter('all')
                setTitleFilter('all')
              }}
              className="w-full h-12 flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              필터 초기화
            </Button>
          </div>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="container mx-auto px-4 py-8">
        {filteredArtists.length === 0 ? (
          <div className="text-center py-16">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2 text-foreground">작가가 없습니다</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 작가가 없습니다.'}
            </p>
          </div>
        ) : (
          <>
            {/* PC Layout */}
            <div className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredArtists.map((artist) => (
                <Card key={artist.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40">
                  <div className="relative aspect-square overflow-hidden">
                    <div className="relative group">
                      <Image
                        src={artist.profile_image || "/placeholder-profile.jpg"}
                        alt={artist.name}
                        width={400}
                        height={400}
                        className="w-full h-64 object-cover rounded-lg transition-all duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* 작가 정보 */}
                    <div className="space-y-4">
                      {artist.profile_image && (
                        <div className="flex items-center justify-center">
                          <Image
                            src={artist.profile_image}
                            alt={artist.name}
                            width={100}
                            height={100}
                            className="w-20 h-20 rounded-full object-cover border-2 border-celadon"
                          />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-celadon mb-1">{artist.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {artist.name_en || artist.birth_year ? `${artist.name_en || ''} ${artist.birth_year ? `(${artist.birth_year})` : ''}`.trim() : ''}
                        </p>
                      </div>
                      
                      {artist.nationality && (
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{artist.nationality}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PC 세련된 캡션 디자인 */}
                  <CardContent className="p-6 space-y-4 bg-gradient-to-b from-background to-muted/10 dark:from-background dark:to-muted/5">
                    {/* 메인 정보 */}
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-bold text-xl text-foreground group-hover:text-scholar-red dark:group-hover:text-scholar-red transition-colors duration-200 flex-1 min-w-0">
                          {artist.name}
                        </h3>
                        {artist.birth_year && (
                        <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
                          <Calendar className="h-4 w-4" />
                            <span className="font-mono text-sm">b. {artist.birth_year}</span>
                        </div>
                        )}
                      </div>
                    </div>

                    {/* 분류 정보 */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-border/30 dark:border-border/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">회원 구분</span>
                        <span className="font-medium text-foreground">
                          {artist.membership_type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">작가 유형</span>
                        <span className="font-medium text-foreground">
                          {artist.artist_type}
                        </span>
                      </div>
                      {artist.title && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">직위</span>
                          <span className="font-medium text-foreground">
                            {artist.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 전문분야 */}
                    {artist.specialties && artist.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sortSpecialties(artist.specialties).map((specialty, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className={`text-xs px-3 py-1 font-medium border transition-all duration-200 ${getSpecialtyBadgeStyle(specialty)}`}
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    )}

                    {/* 요약 정보 */}
                    <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t border-border/50 dark:border-border/30">
                      {artist.awards && artist.awards.length > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            <span className="text-xs">수상 경력</span>
                          </div>
                          <span className="text-xs font-medium text-foreground">{artist.awards.length}개</span>
                        </div>
                      )}
                    </div>

                    {/* 소개 */}
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {artist.bio}
                    </p>

                    {/* 액션 버튼 */}
                    <div className="pt-4 border-t border-border dark:border-border/30">
                      <Link href={`/artists/${artist.id}`} className="w-full">
                        <Button 
                          variant="outline" 
                          className="w-full hover:bg-scholar-red hover:text-white hover:border-scholar-red dark:hover:bg-scholar-red dark:hover:text-white dark:hover:border-scholar-red transition-all duration-200"
                        >
                          작가 상세보기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArtists.map((artist) => (
                <Card key={artist.id} className="group overflow-hidden border-0 shadow-md dark:shadow-gray-900/20">
                  <div className="relative aspect-square overflow-hidden">
                    <div className="relative group">
                      <Image
                        src={artist.profile_image || "/placeholder-profile.jpg"}
                        alt={artist.name}
                        width={400}
                        height={400}
                        className="w-full h-64 object-cover rounded-lg transition-all duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* 작가 정보 */}
                    <div className="space-y-4">
                      {artist.profile_image && (
                        <div className="flex items-center justify-center">
                          <Image
                            src={artist.profile_image}
                            alt={artist.name}
                            width={100}
                            height={100}
                            className="w-20 h-20 rounded-full object-cover border-2 border-celadon"
                          />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-celadon mb-1">{artist.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {artist.name_en || artist.birth_year ? `${artist.name_en || ''} ${artist.birth_year ? `(${artist.birth_year})` : ''}`.trim() : ''}
                        </p>
                      </div>
                      
                      {artist.nationality && (
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{artist.nationality}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile 세련된 캡션 디자인 */}
                  <CardContent className="p-4 space-y-3 bg-gradient-to-b from-background to-muted/5 dark:from-background dark:to-muted/3">
                    {/* 메인 정보 */}
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-scholar-red dark:group-hover:text-scholar-red transition-colors duration-200 flex-1 min-w-0">
                          {artist.name}
                        </h3>
                        {artist.birth_year && (
                        <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
                          <Calendar className="h-3 w-3" />
                            <span className="font-mono text-xs">b. {artist.birth_year}</span>
                        </div>
                        )}
                      </div>
                    </div>

                    {/* 분류 정보 - 모바일용 컴팩트 */}
                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/30 dark:border-border/20">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-medium">{artist.membership_type}</span>
                        <span>•</span>
                        <span className="text-foreground font-medium">{artist.artist_type}</span>
                      </div>
                      {artist.title && (
                        <div className="text-center">
                          <span className="text-foreground font-medium">{artist.title}</span>
                        </div>
                      )}
                    </div>

                    {/* 전문분야 - 모바일용 */}
                    {artist.specialties && artist.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sortSpecialties(artist.specialties).map((specialty, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className={`text-xs px-3 py-1 font-medium border transition-all duration-200 ${getSpecialtyBadgeStyle(specialty)}`}
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    )}

                    {/* 요약 정보 - 모바일용 */}
                    {artist.awards && artist.awards.length > 0 && (
                      <div className="flex items-center justify-center text-xs text-muted-foreground pt-2 border-t border-border/30 dark:border-border/20">
                            <div className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              <span>수상 <span className="font-medium text-foreground">{artist.awards.length}</span>개</span>
                            </div>
                      </div>
                    )}

                    {/* 소개 - 모바일용 */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {artist.bio}
                    </p>

                    {/* 액션 버튼 - 모바일용 */}
                    <div className="pt-3 border-t border-border/50 dark:border-border/30">
                      <Link href={`/artists/${artist.id}`} className="w-full">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full text-xs h-8 hover:bg-scholar-red hover:text-white hover:border-scholar-red dark:hover:bg-scholar-red dark:hover:text-white dark:hover:border-scholar-red transition-all duration-200"
                        >
                          상세보기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* 작가 상세 모달 */}
      <Dialog open={!!selectedArtist} onOpenChange={() => setSelectedArtist(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedArtist && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">
                  {selectedArtist.name} {language === 'ko' ? '작가 프로필' : 'Artist Profile'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 헤더 섹션 */}
                <div className="relative">
                  <div className="h-32 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={selectedArtist.profile_image || "/placeholder-cover.jpg"}
                      alt={`${selectedArtist.name} cover`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  
                  <div className="flex items-end gap-4 px-6 -mt-8 relative">
                    <div className="w-20 h-20 bg-white rounded-full border-4 border-white overflow-hidden">
                      <Image
                        src={selectedArtist.profile_image || "/placeholder-profile.jpg"}
                        alt={selectedArtist.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 pb-2">
                      <h2 className="text-2xl font-bold text-foreground mb-1">
                        {selectedArtist.name}
                      </h2>
                      <p className="text-muted-foreground">
                        {selectedArtist.name_en || selectedArtist.birth_year ? `${selectedArtist.name_en || ''} ${selectedArtist.birth_year ? `(${selectedArtist.birth_year})` : ''}`.trim() : ''}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {(selectedArtist as any).location || '위치 정보 없음'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {(selectedArtist as any).email || '이메일 정보 없음'}
                        </span>
                        {(selectedArtist as any).website && (
                          <a href={(selectedArtist as any).website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-celadon">
                            <Globe className="h-3 w-3" />
                            {language === 'ko' ? '웹사이트' : 'Website'}
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => toggleFollow(selectedArtist.id)}
                      className="mb-2"
                    >
                      <Users className={`h-4 w-4 mr-2 ${followedArtists.has(selectedArtist.id) ? 'fill-current' : ''}`} />
                      {followedArtists.has(selectedArtist.id) 
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
                        {selectedArtist.specialties?.map((specialty, index) => (
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
                        {language === 'ko' ? selectedArtist.bio : (selectedArtist.bio_en || selectedArtist.bio)}
                      </p>
                    </div>
                    
                    {/* 학력 */}
                    <div>
                      <h3 className="font-semibold mb-2">{language === 'ko' ? '학력' : 'Education'}</h3>
                      <ul className="space-y-1 text-muted-foreground">
                        {((selectedArtist as any).education || ['학력 정보 없음']).map((edu: string, index: number) => (
                          <li key={index}>• {edu}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* 통계 */}
                    <div>
                      <h3 className="font-semibold mb-2">{language === 'ko' ? '활동 통계' : 'Statistics'}</h3>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-celadon">{(selectedArtist as any).stats?.artworksCount || 0}</div>
                          <div className="text-sm text-muted-foreground">{language === 'ko' ? '작품' : 'Artworks'}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-celadon">{(selectedArtist as any).stats?.exhibitionsCount || 0}</div>
                          <div className="text-sm text-muted-foreground">{language === 'ko' ? '전시' : 'Exhibitions'}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-celadon">{(selectedArtist as any).stats?.viewCount || 0}</div>
                          <div className="text-sm text-muted-foreground">{language === 'ko' ? '조회수' : 'Views'}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-celadon">{(selectedArtist as any).stats?.followers || 0}</div>
                          <div className="text-sm text-muted-foreground">{language === 'ko' ? '팔로워' : 'Followers'}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="artworks">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {((selectedArtist as any).artworks || []).length > 0 ? (
                        (selectedArtist as any).artworks.map((artwork: any) => (
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
                      {selectedArtist.exhibitions && selectedArtist.exhibitions.length > 0 ? (
                        selectedArtist.exhibitions.map((exhibition, index) => (
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
                      {selectedArtist.awards && selectedArtist.awards.length > 0 ? (
                        selectedArtist.awards.map((award, index) => (
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
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}

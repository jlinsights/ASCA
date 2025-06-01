"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Clock, Users, Eye, Heart, Search, Filter, ChevronLeft, ChevronRight, Star, Ticket, User, ExternalLink } from "lucide-react"
import Image from "next/image"
import { getExhibitions } from "@/lib/supabase/cms"
import type { Exhibition, SearchFilters, PaginationParams } from "@/types/cms"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Info } from 'lucide-react'
import Link from 'next/link'

const statusColors = {
  "upcoming": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
  "current": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
  "past": "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-300 dark:border-slate-800"
}

const statusLabels = {
  "upcoming": "예정",
  "current": "진행중",
  "past": "종료"
}

export default function ExhibitionsPage() {
  const { t } = useLanguage()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null)
  const [likedExhibitions, setLikedExhibitions] = useState<Set<string>>(new Set())

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const fetchExhibitions = async () => {
    try {
      setLoading(true)
      const filters: SearchFilters = {}
      
      if (searchQuery) filters.query = searchQuery
      if (selectedStatus !== "all") filters.status = selectedStatus

      const pagination: PaginationParams = {
        page: currentPage,
        limit: 12,
        sortBy: 'start_date',
        sortOrder: 'desc'
      }

      const response = await getExhibitions(filters, pagination)
      setExhibitions(response.data)
      setTotalPages(response.totalPages)
    } catch (err) {
      setError('전시회 정보를 불러오는데 실패했습니다.')
      console.error('Error fetching exhibitions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExhibitions()
  }, [currentPage, selectedStatus])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchExhibitions()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleLike = (exhibitionId: string) => {
    setLikedExhibitions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(exhibitionId)) {
        newSet.delete(exhibitionId)
      } else {
        newSet.add(exhibitionId)
      }
      return newSet
    })
  }

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`
    }
    return `$${price.toLocaleString()}`
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground font-medium">전시회 정보를 불러오는 중...</p>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto text-center">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              <Button onClick={fetchExhibitions} className="mt-4" variant="outline">다시 시도</Button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  const featuredExhibitions = exhibitions.filter(exhibition => exhibition.is_featured)
  const regularExhibitions = exhibitions.filter(exhibition => !exhibition.is_featured)

  const ExhibitionCard = ({ exhibition, featured = false }: { exhibition: Exhibition, featured?: boolean }) => (
    <Card className={`group overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
      featured 
        ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20' 
        : 'border-border/50 hover:border-border'
    }`}>
      <div className="relative">
        <Link href={`/exhibitions/${exhibition.id}`}>
          <div className="aspect-[4/3] relative overflow-hidden cursor-pointer">
            <Image
              src={exhibition.featured_image_url || '/api/placeholder/400/300'}
              alt={exhibition.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* 상태 배지 */}
            <div className="absolute top-3 right-3">
              <Badge className={statusColors[exhibition.status as keyof typeof statusColors]}>
                {statusLabels[exhibition.status as keyof typeof statusLabels]}
              </Badge>
            </div>
            
            {/* 주요 전시회 표시 */}
            {exhibition.is_featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-amber-500 text-white border-0 shadow-md">
                  <Star className="h-3 w-3 mr-1" />
                  주요
                </Badge>
              </div>
            )}
            
            {/* 조회수 */}
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <div className="flex items-center gap-1 text-white text-sm">
                <Eye className="h-3 w-3" />
                <span className="font-medium">{exhibition.views}</span>
              </div>
            </div>
          </div>
        </Link>
        
        <CardContent className="p-6">
          <div className="mb-3">
            <Link href={`/exhibitions/${exhibition.id}`}>
              <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary cursor-pointer transition-colors line-clamp-2">
                {exhibition.title}
              </h3>
            </Link>
            
            {exhibition.subtitle && (
              <p className="text-sm text-muted-foreground font-medium mb-2">{exhibition.subtitle}</p>
            )}
          </div>
          
          <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3 text-sm">
            {exhibition.description}
          </p>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {formatDate(exhibition.start_date)} - {formatDate(exhibition.end_date)}
              </span>
            </div>
            
            {exhibition.venue && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="line-clamp-1">{exhibition.venue}</span>
              </div>
            )}
            
            {exhibition.curator && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                <span>큐레이터: {exhibition.curator}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-4">
                {exhibition.max_capacity && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">{exhibition.max_capacity}명</span>
                  </div>
                )}
                <Link href={`/exhibitions/${exhibition.id}`}>
                  <Button variant="outline" size="sm" className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    상세보기
                  </Button>
                </Link>
              </div>
              
              {exhibition.ticket_price && (
                <div className="flex items-center gap-1 text-primary font-bold">
                  <Ticket className="h-4 w-4" />
                  <span>{exhibition.ticket_price.toLocaleString()}원</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground tracking-tight">
              {t("exhibition")}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              동양서예협회의 다양한 전시회를 만나보세요
            </p>
          </div>

          {/* 검색 및 필터 */}
          <Card className="mb-8 border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="전시회 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 border-border/50 focus:border-primary"
                  />
                </div>
                <Button onClick={handleSearch} className="md:w-auto font-medium">
                  검색
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:w-auto border-border/50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
              </div>

              {showFilters && (
                <div className="border-t border-border/30 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-foreground">상태</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="border-border/50">
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체</SelectItem>
                          <SelectItem value="current">진행중</SelectItem>
                          <SelectItem value="upcoming">예정</SelectItem>
                          <SelectItem value="past">종료</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 주요 전시회 */}
          {featuredExhibitions.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 text-amber-500" />
                <h2 className="text-2xl font-bold text-foreground">주요 전시회</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} featured={true} />
                ))}
              </div>
            </div>
          )}

          {/* 일반 전시회 */}
          {regularExhibitions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-foreground">전시회 목록</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            </div>
          )}

          {/* 전시회가 없는 경우 */}
          {exhibitions.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-lg p-8 max-w-md mx-auto">
                <Star className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">전시회가 없습니다</h3>
                <p className="text-muted-foreground">
                  검색 조건을 변경하거나 나중에 다시 확인해주세요.
                </p>
              </div>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-border/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (page > totalPages) return null
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={currentPage === page ? "" : "border-border/50"}
                    >
                      {page}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-border/50"
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 전시회 상세 모달 */}
      <Dialog open={!!selectedExhibition} onOpenChange={() => setSelectedExhibition(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedExhibition && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">
                  {selectedExhibition.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 헤더 이미지 */}
                <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={selectedExhibition.featured_image_url || '/api/placeholder/400/300'}
                    alt={selectedExhibition.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {selectedExhibition.title}
                        </h2>
                        <p className="text-white/90">
                          {selectedExhibition.subtitle}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge className={statusColors[selectedExhibition.status as keyof typeof statusColors]}>
                          {statusLabels[selectedExhibition.status as keyof typeof statusLabels]}
                        </Badge>
                        {selectedExhibition.is_featured && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            주요
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 탭 콘텐츠 */}
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="info">{t("info")}</TabsTrigger>
                    <TabsTrigger value="artists">{t("artists")}</TabsTrigger>
                    <TabsTrigger value="artworks">{t("artworks")}</TabsTrigger>
                    <TabsTrigger value="gallery">{t("gallery")}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4">
                    {/* 기본 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">{t("exhibitionInfo")}</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="font-medium">{t("duration")}</div>
                              <div className="text-muted-foreground">
                                {formatDate(selectedExhibition.start_date)} - {formatDate(selectedExhibition.end_date)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="font-medium">{t("venue")}</div>
                              <div className="text-muted-foreground">
                                {selectedExhibition.venue}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedExhibition.address}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="font-medium">{t("hours")}</div>
                              <div className="text-muted-foreground">
                                {selectedExhibition.opening_hours}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <Ticket className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="font-medium">{t("admission")}</div>
                              <div className="text-muted-foreground">
                                {selectedExhibition.is_free 
                                  ? t("free")
                                  : selectedExhibition.ticket_price 
                                    ? formatPrice(selectedExhibition.ticket_price, selectedExhibition.currency || 'KRW')
                                    : t("contactForPrice")
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">{t("contact")}</h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <div className="font-medium">{t("curator")}</div>
                            <div className="text-muted-foreground">
                              {selectedExhibition.curator}
                            </div>
                          </div>
                          
                          <div>
                            <div className="font-medium">{t("phone")}</div>
                            <div className="text-muted-foreground">{selectedExhibition.contact}</div>
                          </div>
                          
                          <div>
                            <div className="font-medium">{t("website")}</div>
                            <a 
                              href={selectedExhibition.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-celadon hover:underline"
                            >
                              {selectedExhibition.website}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 설명 */}
                    <div>
                      <h3 className="font-semibold mb-3">{t("about")}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedExhibition.description}
                      </p>
                    </div>
                    
                    {/* 통계 */}
                    <div>
                      <h3 className="font-semibold mb-3">{t("statistics")}</h3>
                      {selectedExhibition.stats ? (
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-celadon">{selectedExhibition.stats.total_artworks}</div>
                            <div className="text-sm text-muted-foreground">{t("artworks")}</div>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-celadon">{selectedExhibition.stats.total_artists}</div>
                            <div className="text-sm text-muted-foreground">{t("artists")}</div>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-celadon">{selectedExhibition.stats.view_count}</div>
                            <div className="text-sm text-muted-foreground">{t("views")}</div>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-celadon">{selectedExhibition.stats.likes}</div>
                            <div className="text-sm text-muted-foreground">{t("likes")}</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t("statisticsNotAvailable")}</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="artists">
                    {selectedExhibition.participating_artists && selectedExhibition.participating_artists.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedExhibition.participating_artists.map((artist) => (
                          <Card key={artist.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{artist.name}</h4>
                                  <p className="text-sm text-muted-foreground">{artist.specialty || ''}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {t("artist")}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">{t("noArtistsAvailable")}</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="artworks">
                    {selectedExhibition.featured_artworks && selectedExhibition.featured_artworks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedExhibition.featured_artworks.map((artwork) => (
                          <Card key={artwork.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="relative aspect-[3/4] bg-muted">
                                <Image
                                  src={artwork.image_url}
                                  alt={artwork.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="p-3">
                                <h4 className="font-medium mb-1">{artwork.title}</h4>
                                <p className="text-sm text-muted-foreground">{artwork.artist_name}</p>
                                {artwork.year && (
                                  <p className="text-xs text-muted-foreground">{artwork.year}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">{t("noArtworksAvailable")}</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="gallery">
                    {selectedExhibition.gallery_images && selectedExhibition.gallery_images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedExhibition.gallery_images.map((image, index) => (
                          <div key={index} className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">{t("noGalleryImagesAvailable")}</p>
                    )}
                  </TabsContent>
                </Tabs>
                
                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    className="flex-1"
                    onClick={() => toggleLike(selectedExhibition.id)}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${likedExhibitions.has(selectedExhibition.id) ? 'fill-current' : ''}`} />
                    {t("like")}
                  </Button>
                  <Button variant="outline">
                    <Info className="h-4 w-4 mr-2" />
                    {t("details")}
                  </Button>
                  {selectedExhibition.status === 'current' && (
                    <Button className="bg-celadon hover:bg-celadon/90">
                      <Ticket className="h-4 w-4 mr-2" />
                      {t("bookTickets")}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Eye,
  Star,
  Heart,
  Share2,
  ExternalLink,
  UserPlus,
  Timer,
  CheckCircle,
  AlertCircle,
  Zap,
  Award,
  Gift,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getEvents } from '@/lib/supabase/cms'
import { Event } from '@/types/cms'
import { useLanguage } from '@/contexts/language-context'

const ITEMS_PER_PAGE = 9

const statusColors = {
  "upcoming": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
  "ongoing": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
  "completed": "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-300 dark:border-slate-800",
  "cancelled": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
}

const categoryColors = {
  "workshop": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800",
  "lecture": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
  "competition": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800",
  "exhibition": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
  "ceremony": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800",
  "meeting": "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-300 dark:border-slate-800",
  "other": "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800"
}

export default function EventsPage() {
  const { language, t } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { value: 'all', label: language === 'ko' ? '전체' : 'All' },
    { value: 'workshop', label: language === 'ko' ? '워크숍' : 'Workshop' },
    { value: 'lecture', label: language === 'ko' ? '강연' : 'Lecture' },
    { value: 'competition', label: language === 'ko' ? '공모전' : 'Competition' },
    { value: 'exhibition', label: language === 'ko' ? '전시' : 'Exhibition' },
    { value: 'ceremony', label: language === 'ko' ? '시상식' : 'Ceremony' },
    { value: 'meeting', label: language === 'ko' ? '총회' : 'Meeting' },
    { value: 'other', label: language === 'ko' ? '기타' : 'Other' }
  ]

  const statusOptions = [
    { value: 'all', label: language === 'ko' ? '전체' : 'All' },
    { value: 'upcoming', label: language === 'ko' ? '예정' : 'Upcoming' },
    { value: 'ongoing', label: language === 'ko' ? '진행중' : 'Ongoing' },
    { value: 'completed', label: language === 'ko' ? '완료' : 'Completed' },
    { value: 'cancelled', label: language === 'ko' ? '취소' : 'Cancelled' }
  ]

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {
        query: searchQuery,
        type: selectedCategory === 'all' ? undefined : selectedCategory,
        status: selectedStatus === 'all' ? undefined : selectedStatus
      }

      const result = await getEvents(filters, {
        page: currentPage,
        limit: ITEMS_PER_PAGE
      })

      setEvents(result.data || [])
      setTotalPages(Math.ceil((result.total || 0) / ITEMS_PER_PAGE))
    } catch (err) {
      setError(language === 'ko' ? '행사를 불러오는 중 오류가 발생했습니다.' : 'Error loading events.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentPage, selectedCategory, selectedStatus])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchEvents()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-3 w-3" />
      case 'ongoing': return <Zap className="h-3 w-3" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'cancelled': return <AlertCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return language === 'ko' 
      ? date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const EventCard = ({ event }: { event: Event }) => {
    const handleLike = () => {
      // 좋아요 기능 구현 (로깅 제거)
    };

    const handleShare = () => {
      // 공유 기능 구현
      if (navigator.share) {
        navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.origin + `/events/${event.id}`
        });
      } else {
        // Fallback: 클립보드에 복사
        navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
        alert(language === 'ko' ? '링크가 복사되었습니다.' : 'Link copied to clipboard.');
      }
    };

    return (
      <Card className={`group overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        event.is_featured 
          ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20' 
          : 'border-border/50 hover:border-border'
      }`}>
        <div className="relative">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={event.featured_image_url || '/api/placeholder/400/240'}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* 상태 배지 */}
            <div className="absolute top-3 left-3">
              <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(event.status)}
                  <span className="text-xs font-medium">
                    {statusOptions.find(s => s.value === event.status)?.label || event.status}
                  </span>
                </div>
              </Badge>
            </div>

            {/* 중요 행사 표시 */}
            {event.is_featured && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-amber-500 text-white border-0 shadow-md">
                  <Star className="h-3 w-3 mr-1" />
                  {language === 'ko' ? '주요' : 'Featured'}
                </Badge>
              </div>
            )}

            {/* 조회수 */}
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <div className="flex items-center gap-1 text-white text-sm">
                <Eye className="h-3 w-3" />
                <span className="font-medium">{event.views}</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* 카테고리 */}
            <div className="mb-3">
              <Badge className={categoryColors[event.event_type as keyof typeof categoryColors]}>
                {categories.find(c => c.value === event.event_type)?.label || event.event_type}
              </Badge>
            </div>

            {/* 제목 */}
            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>

            {/* 설명 */}
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
              {event.description}
            </p>

            {/* 메타 정보 */}
            <div className="space-y-2 mb-4">
              {/* 일시 */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatDate(event.event_date)}</span>
              </div>

              {/* 장소 */}
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{event.location}</span>
                </div>
              )}

              {/* 주최자 */}
              {event.organizer && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">{event.organizer}</span>
                </div>
              )}
            </div>

            {/* 추가 정보 */}
            <div className="flex items-center justify-between pt-3 border-t border-border/30">
              <div className="flex items-center gap-4">
                {/* 정원 */}
                {event.max_participants && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">{event.max_participants}명</span>
                  </div>
                )}
              </div>

              {/* 참가비 */}
              {event.registration_fee && (
                <div className="flex items-center gap-1 text-primary font-bold">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm">{event.registration_fee.toLocaleString()}원</span>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center justify-between mt-4">
              <Link href={`/events/${event.id}`}>
                <Button variant="outline" size="sm" className="border-border/50 hover:bg-primary/5">
                  {language === 'ko' ? '자세히 보기' : 'View Details'}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleLike}
                  title={language === 'ko' ? '좋아요' : 'Like'}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleShare}
                  title={language === 'ko' ? '공유하기' : 'Share'}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            {language === 'ko' ? '행사 안내' : 'Events'}
            </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            {language === 'ko' 
              ? '동양서예협회에서 주최하는 다양한 행사와 프로그램을 확인하세요.'
              : 'Discover various events and programs hosted by the Oriental Calligraphy Association.'
            }
          </p>
        </div>

        {/* 검색 및 필터 섹션 */}
        <Card className="mb-8 border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* 검색 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                  placeholder={language === 'ko' ? '행사 검색...' : 'Search events...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 border-border/50 focus:border-primary"
            />
          </div>
              <Button onClick={handleSearch} className="md:w-auto font-medium">
                {language === 'ko' ? '검색' : 'Search'}
              </Button>
                  <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto border-border/50"
              >
                <Filter className="h-4 w-4 mr-2" />
                {language === 'ko' ? '필터' : 'Filter'}
                  </Button>
            </div>

            {showFilters && (
              <div className="border-t border-border/30 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 카테고리 필터 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">
                      {language === 'ko' ? '카테고리' : 'Category'}
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="border-border/50">
                        <SelectValue placeholder={language === 'ko' ? '카테고리 선택' : 'Select category'} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
            </div>

            {/* 상태 필터 */}
            <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">
                      {language === 'ko' ? '상태' : 'Status'}
                    </label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="border-border/50">
                        <SelectValue placeholder={language === 'ko' ? '상태 선택' : 'Select status'} />
                      </SelectTrigger>
                      <SelectContent>
                {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground font-medium">
              {language === 'ko' ? '행사를 불러오는 중...' : 'Loading events...'}
            </p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              <Button
                onClick={fetchEvents} 
                variant="outline" 
                className="mt-4"
              >
                {language === 'ko' ? '다시 시도' : 'Try Again'}
              </Button>
            </div>
          </div>
        )}

        {/* 행사 목록 */}
        {!loading && !error && (
          <>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-lg p-8 max-w-md mx-auto">
                  <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {language === 'ko' ? '행사가 없습니다' : 'No events found'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ko' 
                      ? '검색 조건을 변경하거나 나중에 다시 확인해주세요.'
                      : 'Try changing your search criteria or check back later.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* 주요 행사 섹션 */}
                {events.some(event => event.is_featured) && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <Star className="h-6 w-6 text-amber-500" />
                      {language === 'ko' ? '주요 행사' : 'Featured Events'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events
                        .filter(event => event.is_featured)
                        .map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                  </div>
                )}

                {/* 일반 행사 섹션 */}
                {events.some(event => !event.is_featured) && (
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                      {language === 'ko' ? '모든 행사' : 'All Events'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events
                        .filter(event => !event.is_featured)
                        .map((event) => (
                          <EventCard key={event.id} event={event} />
            ))}
          </div>
                  </div>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-border/50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {language === 'ko' ? '이전' : 'Previous'}
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                          if (page > totalPages) return null
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={currentPage === page ? "w-10" : "w-10 border-border/50"}
                            >
                              {page}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-border/50"
                      >
                        {language === 'ko' ? '다음' : 'Next'}
                        <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Calendar,
  Eye,
  MapPin,
  User,
  Star,
  AlertCircle,
  Loader2,
  Users,
  DollarSign,
  Clock,
  Facebook,
  Twitter,
  Link as LinkIcon,
  UserPlus,
  CheckCircle
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { 
  getEventById, 
  incrementEventViews,
  getRelatedEvents
} from '@/lib/supabase/cms'
import type { Event } from '@/types/cms'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const statusLabels = {
  upcoming: '예정',
  ongoing: '진행중',
  completed: '완료',
  cancelled: '취소'
}

const eventTypeLabels = {
  workshop: '워크숍',
  lecture: '강연',
  competition: '공모전',
  exhibition: '전시',
  ceremony: '시상식',
  meeting: '총회',
  other: '기타'
}

export default function EventDetailPage() {
  const { language } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 행사 데이터 로드
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true)
        setError(null)

        // 행사 상세 정보 가져오기
        const eventData = await getEventById(eventId)
        if (!eventData) {
          throw new Error('행사를 찾을 수 없습니다.')
        }

        setEvent(eventData)

        // 조회수 증가
        await incrementEventViews(eventId)

        // 관련 행사 가져오기
        const relatedData = await getRelatedEvents(eventId, eventData.event_type)
        setRelatedEvents(relatedData)

      } catch (err) {
        setError('행사를 불러오는데 실패했습니다.')
        
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  // 공유 기능
  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = event?.title || '동양서예협회 행사'
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          alert('링크가 복사되었습니다.')
        } catch (err) {
          alert('링크 복사에 실패했습니다.')
        }
        break
    }
  }

  // 참가 신청 기능
  const handleRegistration = () => {
    if (!event) return
    
    if (event.status === 'completed' || event.status === 'cancelled') {
      alert('이미 종료되었거나 취소된 행사입니다.')
      return
    }

    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline)
      const now = new Date()
      if (now > deadline) {
        alert('등록 마감일이 지났습니다.')
        return
      }
    }

    if (event.max_participants && event.current_participants >= event.max_participants) {
      alert('정원이 마감되었습니다.')
      return
    }

    // 실제 구현에서는 참가 신청 폼이나 외부 링크로 연결
    alert('참가 신청 기능은 준비 중입니다. 전화나 이메일로 문의해주세요.')
  }

  // 행사 일시 포맷팅
  const getEventDateTime = () => {
    if (!event) return ''
    
    const eventDate = new Date(event.event_date)
    return eventDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    })
  }

  // 등록 마감일까지 남은 시간
  const getRegistrationTimeLeft = () => {
    if (!event?.registration_deadline) return null
    
    const deadline = new Date(event.registration_deadline)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '마감'
    if (diffDays === 0) return '오늘 마감'
    return `${diffDays}일 남음`
  }

  // 참가 가능 여부 확인
  const canRegister = () => {
    if (!event) return false
    if (event.status !== 'upcoming') return false
    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline)
      const now = new Date()
      if (now > deadline) return false
    }
    if (event.max_participants && event.current_participants >= event.max_participants) return false
    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">행사를 불러오는 중...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">오류가 발생했습니다</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/events">
              <Button variant="outline">목록으로 돌아가기</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 네비게이션 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">홈</Link>
            <span>/</span>
            <Link href="/events" className="hover:text-foreground">행사</Link>
            <span>/</span>
            <span className="text-foreground">{event.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            {/* 행사 헤더 */}
            <Card className="border-border/50 mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                      {statusLabels[event.status as keyof typeof statusLabels]}
                    </Badge>
                    <Badge variant="outline">
                      {eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]}
                    </Badge>
                    {event.is_featured && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        주요 행사
                      </Badge>
                    )}
                    {getRegistrationTimeLeft() && event.registration_required && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getRegistrationTimeLeft()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('facebook')}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('twitter')}
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('copy')}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold text-foreground mb-4">
                  {event.title}
                </CardTitle>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{getEventDateTime()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{event.views.toLocaleString()}회</span>
                  </div>
                  {event.current_participants !== undefined && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.current_participants}명 참가</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              {event.featured_image_url && (
                <div className="px-6 pb-4">
                  <img
                    src={event.featured_image_url}
                    alt={event.title}
                    className="w-full h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              
              <Separator />
              
              <CardContent className="pt-6">
                {/* 행사 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">일시</p>
                        <p className="font-medium text-foreground">{getEventDateTime()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{event.location}</p>
                        {event.venue && (
                          <p className="text-sm text-muted-foreground">{event.venue}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">주최자</p>
                        <p className="font-medium text-foreground">{event.organizer}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {event.registration_fee && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">참가비</p>
                          <p className="font-medium text-foreground">
                            {typeof event.registration_fee === 'number' 
                              ? `${event.registration_fee.toLocaleString()}원`
                              : event.registration_fee
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {event.max_participants && (
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">정원</p>
                          <p className="font-medium text-foreground">
                            {event.current_participants || 0} / {event.max_participants}명
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {event.registration_deadline && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">등록 마감</p>
                          <p className="font-medium text-foreground">
                            {new Date(event.registration_deadline).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-8" />

                {/* 행사 설명 */}
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <h3 className="text-xl font-semibold text-foreground mb-4">행사 소개</h3>
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {event.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 참가 신청 */}
            {event.registration_required && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">참가 신청</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {canRegister() ? (
                    <>
                      <div className="space-y-2">
                        {event.registration_fee && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">참가비:</span>{' '}
                            <span className="font-medium">
                              {typeof event.registration_fee === 'number' 
                                ? `${event.registration_fee.toLocaleString()}원`
                                : event.registration_fee
                              }
                            </span>
                          </p>
                        )}
                        {event.max_participants && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">남은 자리:</span>{' '}
                            <span className="font-medium">
                              {event.max_participants - (event.current_participants || 0)}명
                            </span>
                          </p>
                        )}
                        {event.registration_deadline && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">마감:</span>{' '}
                            <span className="font-medium">{getRegistrationTimeLeft()}</span>
                          </p>
                        )}
                      </div>
                      <Button 
                        onClick={handleRegistration}
                        className="w-full"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        참가 신청
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {event.status === 'completed' && '완료된 행사입니다'}
                        {event.status === 'cancelled' && '취소된 행사입니다'}
                        {event.status === 'ongoing' && '진행 중인 행사입니다'}
                        {event.registration_deadline && new Date() > new Date(event.registration_deadline) && '등록 마감되었습니다'}
                        {event.max_participants && event.current_participants >= event.max_participants && '정원이 마감되었습니다'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 행사 정보 요약 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">행사 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">상태</p>
                    <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                      {statusLabels[event.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">유형</p>
                    <p className="font-medium text-foreground">
                      {eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">일시</p>
                    <p className="font-medium text-foreground">{getEventDateTime()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">장소</p>
                    <p className="font-medium text-foreground">{event.location}</p>
                    {event.venue && (
                      <p className="text-sm text-muted-foreground">{event.venue}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">주최자</p>
                    <p className="font-medium text-foreground">{event.organizer}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">조회수</p>
                    <p className="font-medium text-foreground">{event.views.toLocaleString()}회</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 관련 행사 */}
            {relatedEvents.length > 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">관련 행사</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedEvents.map((relatedEvent) => (
                    <Link
                      key={relatedEvent.id}
                      href={`/events/${relatedEvent.id}`}
                      className="block p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-2">
                                               <Badge 
                         className={`text-xs ${statusColors[relatedEvent.status as keyof typeof statusColors]}`}
                       >
                          {statusLabels[relatedEvent.status as keyof typeof statusLabels]}
                        </Badge>
                        {relatedEvent.is_featured && (
                          <Star className="h-3 w-3 text-muted-foreground mt-0.5" />
                        )}
                      </div>
                      <h4 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                        {relatedEvent.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(relatedEvent.event_date).toLocaleDateString('ko-KR')}</span>
                        <span>조회 {relatedEvent.views}</span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 빠른 네비게이션 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">빠른 이동</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/events">
                  <Button variant="outline" className="w-full justify-start">
                    행사 목록
                  </Button>
                </Link>
                <Link href="/notice">
                  <Button variant="outline" className="w-full justify-start">
                    공지사항
                  </Button>
                </Link>
                <Link href="/exhibitions">
                  <Button variant="outline" className="w-full justify-start">
                    전시회
                  </Button>
                </Link>
                <Link href="/artists">
                  <Button variant="outline" className="w-full justify-start">
                    작가
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 
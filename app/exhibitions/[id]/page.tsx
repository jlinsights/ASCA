'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
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
  Ticket,
  Clock,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Share2
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { 
  getExhibitionById, 
  incrementExhibitionViews,
  getRelatedExhibitions
} from '@/lib/supabase/cms'
import type { Exhibition } from '@/types/cms'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  current: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  past: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

const statusLabels = {
  upcoming: '예정',
  current: '진행중',
  past: '종료'
}

export default function ExhibitionDetailPage() {
  const { language } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const exhibitionId = params.id as string

  const [exhibition, setExhibition] = useState<Exhibition | null>(null)
  const [relatedExhibitions, setRelatedExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 전시회 데이터 로드
  useEffect(() => {
    const loadExhibition = async () => {
      try {
        setLoading(true)
        setError(null)

        // 전시회 상세 정보 가져오기
        const exhibitionData = await getExhibitionById(exhibitionId)
        if (!exhibitionData) {
          throw new Error('전시회를 찾을 수 없습니다.')
        }

        setExhibition(exhibitionData)

        // 조회수 증가
        await incrementExhibitionViews(exhibitionId)

        // 관련 전시회 가져오기
        const relatedData = await getRelatedExhibitions(exhibitionId)
        setRelatedExhibitions(relatedData)

      } catch (err) {
        setError('전시회를 불러오는데 실패했습니다.')
        
      } finally {
        setLoading(false)
      }
    }

    if (exhibitionId) {
      loadExhibition()
    }
  }, [exhibitionId])

  // 공유 기능
  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = exhibition?.title || '동양서예협회 전시회'
    
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

  // 전시회 기간 계산
  const getExhibitionPeriod = () => {
    if (!exhibition) return ''
    
    const startDate = new Date(exhibition.start_date)
    const endDate = new Date(exhibition.end_date)
    
    return `${startDate.toLocaleDateString('ko-KR')} ~ ${endDate.toLocaleDateString('ko-KR')}`
  }

  // 전시회 남은 기간 계산
  const getRemainingDays = () => {
    if (!exhibition) return null
    
    const today = new Date()
    const endDate = new Date(exhibition.end_date)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return null
    if (diffDays === 0) return '오늘 종료'
    return `${diffDays}일 남음`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">전시회를 불러오는 중...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !exhibition) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">오류가 발생했습니다</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/exhibitions">
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
          <Link href="/exhibitions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">홈</Link>
            <span>/</span>
            <Link href="/exhibitions" className="hover:text-foreground">전시회</Link>
            <span>/</span>
            <span className="text-foreground">{exhibition.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            {/* 전시회 헤더 */}
            <Card className="border-border/50 mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[exhibition.status as keyof typeof statusColors]}>
                      {statusLabels[exhibition.status as keyof typeof statusLabels]}
                    </Badge>
                    {exhibition.is_featured && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        주요 전시회
                      </Badge>
                    )}
                    {getRemainingDays() && exhibition.status === 'current' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getRemainingDays()}
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
                
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {exhibition.title}
                </CardTitle>
                
                {exhibition.subtitle && (
                  <p className="text-lg text-muted-foreground mb-4">
                    {exhibition.subtitle}
                  </p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{getExhibitionPeriod()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{exhibition.views.toLocaleString()}회</span>
                  </div>
                </div>
              </CardHeader>
              
              {exhibition.featured_image_url && (
                <div className="px-6 pb-4">
                  <div className="relative w-full h-96">
                    <Image
                      src={exhibition.featured_image_url}
                      alt={exhibition.title}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
              
              <Separator />
              
              <CardContent className="pt-6">
                {/* 전시회 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{exhibition.location}</p>
                        {exhibition.venue && (
                          <p className="text-sm text-muted-foreground">{exhibition.venue}</p>
                        )}
                      </div>
                    </div>
                    
                    {exhibition.curator && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">큐레이터</p>
                          <p className="font-medium text-foreground">{exhibition.curator}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">전시 기간</p>
                        <p className="font-medium text-foreground">{getExhibitionPeriod()}</p>
                      </div>
                    </div>
                    
                    {exhibition.admission_fee && (
                      <div className="flex items-center gap-3">
                        <Ticket className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">입장료</p>
                          <p className="font-medium text-foreground">{exhibition.admission_fee}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-8" />

                {/* 전시회 설명 */}
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <h3 className="text-xl font-semibold text-foreground mb-4">전시회 소개</h3>
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {exhibition.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 전시회 정보 요약 */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">전시회 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">상태</p>
                    <Badge className={statusColors[exhibition.status as keyof typeof statusColors]}>
                      {statusLabels[exhibition.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">기간</p>
                    <p className="font-medium text-foreground">{getExhibitionPeriod()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">장소</p>
                    <p className="font-medium text-foreground">{exhibition.location}</p>
                    {exhibition.venue && (
                      <p className="text-sm text-muted-foreground">{exhibition.venue}</p>
                    )}
                  </div>
                  
                  {exhibition.curator && (
                    <div>
                      <p className="text-sm text-muted-foreground">큐레이터</p>
                      <p className="font-medium text-foreground">{exhibition.curator}</p>
                    </div>
                  )}
                  
                  {exhibition.admission_fee && (
                    <div>
                      <p className="text-sm text-muted-foreground">입장료</p>
                      <p className="font-medium text-foreground">{exhibition.admission_fee}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">조회수</p>
                    <p className="font-medium text-foreground">{exhibition.views.toLocaleString()}회</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 관련 전시회 */}
            {relatedExhibitions.length > 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">관련 전시회</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedExhibitions.map((relatedExhibition) => (
                    <Link
                      key={relatedExhibition.id}
                      href={`/exhibitions/${relatedExhibition.id}`}
                      className="block p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-2">
                                                 <Badge 
                           className={`text-xs ${statusColors[relatedExhibition.status as keyof typeof statusColors]}`}
                         >
                          {statusLabels[relatedExhibition.status as keyof typeof statusLabels]}
                        </Badge>
                        {relatedExhibition.is_featured && (
                          <Star className="h-3 w-3 text-muted-foreground mt-0.5" />
                        )}
                      </div>
                      <h4 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                        {relatedExhibition.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(relatedExhibition.start_date).toLocaleDateString('ko-KR')}</span>
                        <span>조회 {relatedExhibition.views}</span>
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
                <Link href="/exhibitions">
                  <Button variant="outline" className="w-full justify-start">
                    전시회 목록
                  </Button>
                </Link>
                <Link href="/notice">
                  <Button variant="outline" className="w-full justify-start">
                    공지사항
                  </Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline" className="w-full justify-start">
                    행사
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
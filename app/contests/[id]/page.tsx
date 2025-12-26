'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Calendar, Clock, MapPin, Award, Users, FileText,
  CheckCircle, AlertCircle, Share2, Facebook, Twitter, Link as LinkIcon
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchContestById, incrementContestViews } from '@/lib/api/contests'
import { getSupabaseClient } from '@/lib/supabase'
import {
  Contest,
  CONTEST_STATUS_LABELS,
  CONTEST_CATEGORY_LABELS,
  CONTEST_TYPE_LABELS,
  getContestDeadlineInfo,
  getContestStatusColor,
  canApplyToContest
} from '@/types/contest-new'

export default function ContestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string

  const [contest, setContest] = useState<Contest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const loadContest = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check authentication
        const supabase = getSupabaseClient()
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser()
          setIsAuthenticated(!!user)
        }

        // Fetch contest
        const { data, error: fetchError } = await fetchContestById(contestId)
        if (fetchError || !data) {
          throw new Error('공모전을 찾을 수 없습니다.')
        }

        setContest(data)

        // Increment views
        await incrementContestViews(contestId)

      } catch (err) {
        setError(err instanceof Error ? err.message : '공모전을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (contestId) {
      loadContest()
    }
  }, [contestId])

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = contest?.title || '동양서예협회 공모전'

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrize = (amount?: number) => {
    if (!amount) return '-'
    return `${(amount / 10000).toLocaleString()}만원`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-celadon-green border-t-transparent"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center py-12">
            <Link href="/contests">
              <Button variant="outline">목록으로 돌아가기</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const deadline = getContestDeadlineInfo(contest.endDate)
  const canApply = canApplyToContest(contest)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/contests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">홈</Link>
            <span>/</span>
            <Link href="/contests" className="hover:text-foreground">공모전</Link>
            <span>/</span>
            <span className="text-foreground">{contest.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={getContestStatusColor(contest.status)}>
                      {CONTEST_STATUS_LABELS[contest.status]?.ko}
                    </Badge>
                    <Badge variant="outline">
                      {CONTEST_CATEGORY_LABELS[contest.category]?.ko}
                    </Badge>
                    <Badge variant="outline">
                      {CONTEST_TYPE_LABELS[contest.contestType]?.ko}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleShare('facebook')}>
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare('twitter')}>
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare('copy')}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardTitle className="text-3xl font-serif font-bold text-foreground">
                  {contest.title}
                </CardTitle>
                {contest.subtitle && (
                  <p className="text-lg text-muted-foreground mt-2">{contest.subtitle}</p>
                )}

                {contest.posterImageUrl && (
                  <div className="relative w-full h-96 mt-6 rounded-lg overflow-hidden">
                    <Image
                      src={contest.posterImageUrl}
                      alt={contest.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </CardHeader>

              <Separator />

              <CardContent className="pt-6">
                {/* Key Info Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">접수 기간</p>
                        <p className="font-medium text-foreground">
                          {formatDate(contest.startDate)} ~ {formatDate(contest.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">주최</p>
                        <p className="font-medium text-foreground">{contest.organizer}</p>
                        {contest.sponsor && (
                          <p className="text-sm text-muted-foreground">후원: {contest.sponsor}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {contest.resultDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">결과 발표</p>
                          <p className="font-medium text-foreground">{formatDate(contest.resultDate)}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">신청자</p>
                        <p className="font-medium text-foreground">{contest.applicantCount}명</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">최대 제출 수</p>
                        <p className="font-medium text-foreground">{contest.maxSubmissions}개</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Description */}
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-4">공모전 소개</h3>
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {contest.description}
                  </div>
                </div>

                {contest.theme && (
                  <>
                    <Separator className="my-8" />
                    <div>
                      <h3 className="text-xl font-serif font-semibold text-foreground mb-4">주제</h3>
                      <p className="text-foreground">{contest.theme}</p>
                    </div>
                  </>
                )}

                {contest.eligibility && (
                  <>
                    <Separator className="my-8" />
                    <div>
                      <h3 className="text-xl font-serif font-semibold text-foreground mb-4">참가 자격</h3>
                      <p className="text-foreground whitespace-pre-wrap">{contest.eligibility}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Prizes */}
            {contest.prizes && contest.prizes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-serif flex items-center gap-2">
                    <Award className="w-5 h-5 text-temple-gold" />
                    시상 내역
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contest.prizes.map((prize, index) => (
                      <div key={index} className="flex items-start justify-between p-4 rounded-lg border border-border/50">
                        <div>
                          <h4 className="font-semibold text-foreground">{prize.rank}</h4>
                          <p className="text-sm text-muted-foreground">
                            {prize.count}명 선정
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-temple-gold">{prize.prize}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {contest.totalPrizeAmount && (
                    <div className="mt-4 p-4 bg-celadon-green/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">총 상금</p>
                      <p className="text-2xl font-bold text-celadon-green">
                        {formatPrize(contest.totalPrizeAmount)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="border-celadon-green/30">
              <CardHeader>
                <CardTitle className="text-lg font-serif">신청하기</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
               {deadline.isSoon && !deadline.isExpired && (
                  <Alert variant="destructive">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      마감 <strong>{deadline.daysRemaining}일</strong> 전입니다!
                    </AlertDescription>
                  </Alert>
                )}

                {deadline.isExpired && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      접수가 마감되었습니다
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">참가비</p>
                    <p className="text-2xl font-bold text-foreground">
                      {contest.entryFee === 0 ? '무료' : formatPrize(contest.entryFee)}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">마감까지</p>
                    {!deadline.isExpired ? (
                      <p className="text-lg font-semibold text-foreground">
                        {deadline.daysRemaining}일 {deadline.hoursRemaining % 24}시간
                      </p>
                    ) : (
                      <p className="text-lg font-semibold text-muted-foreground">마감됨</p>
                    )}
                  </div>
                </div>

                {canApply ? (
                  isAuthenticated ? (
                    <Link href={`/contests/${contestId}/apply`}>
                      <Button className="w-full bg-celadon-green hover:bg-celadon-green/90">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        지원하기
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login">
                      <Button className="w-full bg-celadon-green hover:bg-celadon-green/90">
                        로그인하여 지원하기
                      </Button>
                    </Link>
                  )
                ) : (
                  <Button className="w-full" disabled>
                    {deadline.isExpired ? '접수 마감' : '접수 대기중'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">문의</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {contest.contactEmail && (
                  <div>
                    <p className="text-muted-foreground">이메일</p>
                    <a href={`mailto:${contest.contactEmail}`} className="text-celadon-green hover:underline">
                      {contest.contactEmail}
                    </a>
                  </div>
                )}
                {contest.contactPhone && (
                  <div>
                    <p className="text-muted-foreground">전화</p>
                    <a href={`tel:${contest.contactPhone}`} className="text-celadon-green hover:underline">
                      {contest.contactPhone}
                    </a>
                  </div>
                )}
                {contest.websiteUrl && (
                  <div>
                    <p className="text-muted-foreground">웹사이트</p>
                    <a 
                      href={contest.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-celadon-green hover:underline"
                    >
                      공식 웹사이트 방문
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-serif">공모전 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">카테고리</p>
                  <p className="font-medium text-foreground">
                    {CONTEST_CATEGORY_LABELS[contest.category]?.ko}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">유형</p>
                  <p className="font-medium text-foreground">
                    {CONTEST_TYPE_LABELS[contest.contestType]?.ko}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">조회수</p>
                  <p className="font-medium text-foreground">{contest.viewCount.toLocaleString()}회</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Users, 
  Award, 
  DollarSign, 
  Clock, 
  MapPin,
  FileText,
  Image as ImageIcon,
  Trophy,
  Info,
  AlertCircle,
  ExternalLink,
  Download
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Route } from 'next'
import type { Contest } from '@/types/contest'

// 샘플 데이터 (실제로는 API에서 가져옴)
const sampleContest: Contest = {
  id: '1',
  title: '2024 대한민국 서예대전',
  titleEn: '2024 Korea Calligraphy Competition',
  description: '전통과 현대가 만나는 서예의 새로운 지평을 여는 대회입니다. 한국의 아름다운 서예 문화를 계승하고 발전시키기 위해 마련된 이번 대회는 국내외 모든 서예 애호가들이 참여할 수 있는 열린 무대입니다.',
  descriptionEn: 'A competition that opens new horizons in calligraphy where tradition meets modernity.',
  category: ['calligraphy'],
  theme: '온고지신 - 옛것을 익혀 새것을 안다',
  organizer: '동양서예협회',
  sponsors: ['문화체육관광부', 'KBS', '대한항공'],
  timeline: {
    registrationStart: new Date('2024-03-01'),
    registrationEnd: new Date('2024-04-30'),
    submissionStart: new Date('2024-04-01'),
    submissionEnd: new Date('2024-05-31'),
    judgingStart: new Date('2024-06-01'),
    judgingEnd: new Date('2024-06-15'),
    resultAnnouncement: new Date('2024-06-20'),
    exhibitionStart: new Date('2024-07-01'),
    exhibitionEnd: new Date('2024-07-31')
  },
  fees: {
    domestic: 30000,
    international: 50000,
    student: 15000,
    group: 25000
  },
  judging: {
    judges: [
      {
        id: '1',
        name: '김서예',
        nameEn: 'Kim Seoye',
        title: '한국서예협회 이사장',
        bio: '40년간 서예 교육과 작품 활동을 해오신 한국 서예계의 권위자',
        credentials: ['서울대학교 동양화과 교수', '한국서예협회 이사장'],
        specialties: ['전통서예', '현대서예', '서예교육']
      },
      {
        id: '2', 
        name: '이묵향',
        nameEn: 'Lee Mukhyang',
        title: '중국서예학회 명예회장',
        bio: '동아시아 서예 교류의 선구자',
        credentials: ['중국서예학회 명예회장', '국제서예연맹 부회장'],
        specialties: ['중국서예', '서예이론', '문인화']
      }
    ],
    criteria: [
      {
        id: '1',
        name: '필법',
        nameEn: 'Brushwork',
        description: '붓의 운용과 기법의 숙련도',
        weight: 30,
        maxScore: 30
      },
      {
        id: '2',
        name: '구성',
        nameEn: 'Composition',
        description: '전체적인 균형과 조화',
        weight: 25,
        maxScore: 25
      },
      {
        id: '3',
        name: '창의성',
        nameEn: 'Creativity',
        description: '독창적 표현과 현대적 해석',
        weight: 25,
        maxScore: 25
      },
      {
        id: '4',
        name: '완성도',
        nameEn: 'Completion',
        description: '작품의 전체적 완성도',
        weight: 20,
        maxScore: 20
      }
    ],
    maxScore: 100,
    isBlindJudging: true
  },
  awards: [
    {
      id: '1',
      name: '대상',
      nameEn: 'Grand Prize',
      description: '최우수 작품 1점',
      prize: {
        monetary: 5000000,
        exhibition: true,
        catalog: true,
        certificate: true,
        other: ['개인전 개최 지원', '해외 전시 기회']
      },
      maxWinners: 1
    },
    {
      id: '2',
      name: '금상',
      nameEn: 'Gold Prize', 
      description: '우수 작품 3점',
      prize: {
        monetary: 2000000,
        exhibition: true,
        catalog: true,
        certificate: true,
        other: ['작품집 발간 지원']
      },
      maxWinners: 3
    },
    {
      id: '3',
      name: '은상',
      nameEn: 'Silver Prize',
      description: '우수 작품 5점', 
      prize: {
        monetary: 1000000,
        exhibition: true,
        catalog: true,
        certificate: true
      },
      maxWinners: 5
    },
    {
      id: '4',
      name: '동상',
      nameEn: 'Bronze Prize',
      description: '우수 작품 10점',
      prize: {
        monetary: 500000,
        exhibition: true,
        catalog: true,
        certificate: true
      },
      maxWinners: 10
    }
  ],
  exhibition: {
    venue: '세종문화회관 미술관',
    venueEn: 'Sejong Center Art Gallery',
    isVirtual: false,
    catalogIncluded: true
  },
  requirements: {
    artworkTypes: ['calligraphy'],
    fileFormats: ['JPG', 'PNG', 'PDF'],
    maxFileSize: 10,
    maxSubmissions: 3,
    minResolution: '300dpi',
    additionalDocuments: ['작가 이력서', '작품 설명서']
  },
  status: 'submission-open',
  isPublished: true,
  isFeatured: true,
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
  createdBy: 'admin'
}

export default function ContestDetailPage() {
  const params = useParams()
  const [contest, setContest] = useState<Contest>(sampleContest)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    }).format(date)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const getTimeRemaining = (targetDate: Date) => {
    const diff = targetDate.getTime() - currentTime.getTime()
    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes }
  }

  const timeRemaining = getTimeRemaining(contest.timeline.submissionEnd)

  const canSubmit = () => {
    const now = currentTime
    return (
      contest.status === 'submission-open' &&
      now >= contest.timeline.submissionStart &&
      now <= contest.timeline.submissionEnd
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/contests" className="hover:text-primary">공모전</Link>
            <span>/</span>
            <span>{contest.title}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{contest.title}</h1>
              {contest.titleEn && (
                <h2 className="text-xl text-muted-foreground mb-4">{contest.titleEn}</h2>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-green-500 text-white">출품 접수중</Badge>
                {contest.isFeatured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">추천</Badge>
                )}
                {contest.category.map((cat) => (
                  <Badge key={cat} variant="outline">{cat}</Badge>
                ))}
              </div>

              <p className="text-lg text-muted-foreground mb-6">{contest.description}</p>
              
              {contest.theme && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-primary mb-2">대회 주제</h3>
                  <p className="text-primary">{contest.theme}</p>
                </div>
              )}
            </div>

            {/* 사이드바 */}
            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    출품 마감까지
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {timeRemaining ? (
                    <div className="text-center">
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-primary/10 rounded-lg p-3">
                          <div className="text-2xl font-bold text-primary">{timeRemaining.days}</div>
                          <div className="text-xs text-muted-foreground">일</div>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3">
                          <div className="text-2xl font-bold text-primary">{timeRemaining.hours}</div>
                          <div className="text-xs text-muted-foreground">시간</div>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3">
                          <div className="text-2xl font-bold text-primary">{timeRemaining.minutes}</div>
                          <div className="text-xs text-muted-foreground">분</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        마감: {formatDateTime(contest.timeline.submissionEnd)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-red-500 mb-4">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-semibold">출품 마감</p>
                    </div>
                  )}
                  
                  {canSubmit() ? (
                    <Button asChild className="w-full" size="lg">
                      <Link href={`/contests/${contest.id}/submit` as Route}>
                        지금 출품하기
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled className="w-full" size="lg">
                      출품 불가
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* 출품료 정보 */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    출품료
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>국내 작가</span>
                    <span className="font-semibold">{formatCurrency(contest.fees.domestic)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>해외 작가</span>
                    <span className="font-semibold">{formatCurrency(contest.fees.international)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>학생 할인</span>
                    <span className="font-semibold text-green-600">{formatCurrency(contest.fees.student)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>단체 할인</span>
                    <span className="font-semibold text-green-600">{formatCurrency(contest.fees.group)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* 상세 정보 탭 */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="schedule">일정</TabsTrigger>
            <TabsTrigger value="judges">심사위원</TabsTrigger>
            <TabsTrigger value="awards">시상</TabsTrigger>
            <TabsTrigger value="requirements">출품 요강</TabsTrigger>
            <TabsTrigger value="exhibition">전시 정보</TabsTrigger>
          </TabsList>

          {/* 개요 */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>대회 개요</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">주최</div>
                      <div className="text-muted-foreground">{contest.organizer}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">전시 장소</div>
                      <div className="text-muted-foreground">{contest.exhibition.venue}</div>
                    </div>
                  </div>
                </div>
                
                {contest.sponsors && contest.sponsors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">후원</h4>
                    <div className="flex flex-wrap gap-2">
                      {contest.sponsors.map((sponsor, index) => (
                        <Badge key={index} variant="outline">{sponsor}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 일정 */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>대회 일정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: '등록 시작', date: contest.timeline.registrationStart, icon: Calendar },
                    { label: '등록 마감', date: contest.timeline.registrationEnd, icon: Calendar },
                    { label: '출품 시작', date: contest.timeline.submissionStart, icon: FileText },
                    { label: '출품 마감', date: contest.timeline.submissionEnd, icon: FileText },
                    { label: '심사 시작', date: contest.timeline.judgingStart, icon: Award },
                    { label: '심사 종료', date: contest.timeline.judgingEnd, icon: Award },
                    { label: '결과 발표', date: contest.timeline.resultAnnouncement, icon: Trophy },
                    { label: '전시 시작', date: contest.timeline.exhibitionStart, icon: ImageIcon },
                    { label: '전시 종료', date: contest.timeline.exhibitionEnd, icon: ImageIcon }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                      <item.icon className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(item.date)}</div>
                      </div>
                      {item.date <= currentTime && (
                        <Badge variant="secondary">완료</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 심사위원 */}
          <TabsContent value="judges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contest.judging.judges.map((judge) => (
                <Card key={judge.id}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{judge.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{judge.title}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{judge.bio}</p>
                    
                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm">주요 경력</h5>
                      <ul className="text-sm space-y-1">
                        {judge.credentials.map((credential, index) => (
                          <li key={index} className="text-muted-foreground">• {credential}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-semibold text-sm mb-2">전문 분야</h5>
                      <div className="flex flex-wrap gap-1">
                        {judge.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{specialty}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>심사 기준</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contest.judging.criteria.map((criteria) => (
                    <div key={criteria.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{criteria.name}</div>
                        <div className="text-sm text-muted-foreground">{criteria.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{criteria.weight}%</div>
                        <div className="text-sm text-muted-foreground">({criteria.maxScore}점)</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <span className="font-semibold">총점</span>
                  <span className="font-semibold text-lg">{contest.judging.maxScore}점</span>
                </div>
                
                {contest.judging.isBlindJudging && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Info className="w-4 h-4" />
                      <span className="font-medium">블라인드 심사</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      공정한 심사를 위해 작가 정보를 숨기고 작품만으로 평가합니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 시상 */}
          <TabsContent value="awards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contest.awards.map((award) => (
                <Card key={award.id} className="border-l-4 border-l-yellow-400">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      {award.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{award.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {award.prize.monetary && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(award.prize.monetary)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {award.prize.exhibition && (
                        <Badge variant="outline" className="text-xs">전시 참여</Badge>
                      )}
                      {award.prize.catalog && (
                        <Badge variant="outline" className="text-xs">도록 수록</Badge>
                      )}
                      {award.prize.certificate && (
                        <Badge variant="outline" className="text-xs">상장</Badge>
                      )}
                    </div>

                    {award.prize.other && award.prize.other.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">추가 혜택</h5>
                        <ul className="text-sm space-y-1">
                          {award.prize.other.map((benefit, index) => (
                            <li key={index} className="text-muted-foreground">• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      수상자: {award.maxWinners}명
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 출품 요강 */}
          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>출품 요강</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">작품 유형</h4>
                  <div className="flex flex-wrap gap-2">
                    {contest.requirements.artworkTypes.map((type) => (
                      <Badge key={type} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">파일 형식</h4>
                  <div className="flex flex-wrap gap-2">
                    {contest.requirements.fileFormats.map((format) => (
                      <Badge key={format} variant="outline">{format}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">최대 파일 크기</h4>
                    <p className="text-muted-foreground">{contest.requirements.maxFileSize}MB</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">최대 출품 수</h4>
                    <p className="text-muted-foreground">{contest.requirements.maxSubmissions}점</p>
                  </div>
                </div>

                {contest.requirements.minResolution && (
                  <div>
                    <h4 className="font-semibold mb-2">최소 해상도</h4>
                    <p className="text-muted-foreground">{contest.requirements.minResolution}</p>
                  </div>
                )}

                {contest.requirements.additionalDocuments && (
                  <div>
                    <h4 className="font-semibold mb-3">제출 서류</h4>
                    <ul className="space-y-2">
                      {contest.requirements.additionalDocuments.map((doc, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-yellow-800 mb-1">유의사항</h5>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• 출품작은 미발표 창작품이어야 합니다</li>
                        <li>• 타인의 작품을 도용한 경우 수상이 취소됩니다</li>
                        <li>• 출품료는 결과와 관계없이 반환되지 않습니다</li>
                        <li>• 출품작의 저작권은 작가에게 있으나, 전시 및 홍보에 사용될 수 있습니다</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 전시 정보 */}
          <TabsContent value="exhibition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>전시 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">전시 장소</div>
                      <div className="text-muted-foreground">{contest.exhibition.venue}</div>
                      {contest.exhibition.venueEn && (
                        <div className="text-sm text-muted-foreground">{contest.exhibition.venueEn}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">전시 기간</div>
                      <div className="text-muted-foreground">
                        {formatDate(contest.timeline.exhibitionStart)} ~ {formatDate(contest.timeline.exhibitionEnd)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {contest.exhibition.isVirtual ? (
                    <Badge className="bg-blue-500 text-white">온라인 전시</Badge>
                  ) : (
                    <Badge className="bg-green-500 text-white">오프라인 전시</Badge>
                  )}
                  {contest.exhibition.catalogIncluded && (
                    <Badge variant="outline">도록 발간</Badge>
                  )}
                </div>

                {contest.exhibition.isVirtual && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-medium">온라인 전시 안내</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      수상작은 가상 전시관에서 고화질 이미지와 함께 관람할 수 있으며, 
                      전 세계 어디서나 접근 가능합니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </main>
  )
} 
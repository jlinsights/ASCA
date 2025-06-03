'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Users, 
  Award, 
  DollarSign, 
  Clock, 
  MapPin,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Contest, ContestStatus } from '@/types/contest'

// 샘플 데이터 (실제로는 API에서 가져옴)
const sampleContests: Contest[] = [
  {
    id: '1',
    title: '2024 대한민국 서예대전',
    titleEn: '2024 Korea Calligraphy Competition',
    description: '전통과 현대가 만나는 서예의 새로운 지평을 여는 대회입니다.',
    descriptionEn: 'A competition that opens new horizons in calligraphy where tradition meets modernity.',
    category: ['calligraphy'],
    theme: '온고지신 - 옛것을 익혀 새것을 안다',
    organizer: '동양서예협회',
    sponsors: ['문화체육관광부', 'KBS'],
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
      judges: [],
      criteria: [],
      maxScore: 100,
      isBlindJudging: true
    },
    awards: [
      {
        id: '1',
        name: '대상',
        nameEn: 'Grand Prize',
        description: '최우수 작품',
        prize: {
          monetary: 5000000,
          exhibition: true,
          catalog: true,
          certificate: true,
          other: ['개인전 지원']
        },
        maxWinners: 1
      }
    ],
    exhibition: {
      venue: '세종문화회관',
      venueEn: 'Sejong Center for the Performing Arts',
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
  },
  {
    id: '2',
    title: '현대미술 신진작가 공모전',
    titleEn: 'Contemporary Art Emerging Artists Competition',
    description: '미래의 거장을 찾는 현대미술 공모전입니다.',
    descriptionEn: 'A contemporary art competition to discover future masters.',
    category: ['painting', 'sculpture', 'mixed-media'],
    theme: '디지털 시대의 아날로그 감성',
    organizer: '한국현대미술협회',
    sponsors: ['삼성문화재단'],
    timeline: {
      registrationStart: new Date('2024-02-15'),
      registrationEnd: new Date('2024-04-15'),
      submissionStart: new Date('2024-03-01'),
      submissionEnd: new Date('2024-04-30'),
      judgingStart: new Date('2024-05-01'),
      judgingEnd: new Date('2024-05-15'),
      resultAnnouncement: new Date('2024-05-20'),
      exhibitionStart: new Date('2024-06-01'),
      exhibitionEnd: new Date('2024-06-30')
    },
    fees: {
      domestic: 35000,
      international: 60000,
      student: 20000,
      group: 30000
    },
    judging: {
      judges: [],
      criteria: [],
      maxScore: 100,
      isBlindJudging: true
    },
    awards: [],
    exhibition: {
      venue: '국립현대미술관',
      venueEn: 'National Museum of Modern and Contemporary Art',
      isVirtual: true,
      catalogIncluded: true
    },
    requirements: {
      artworkTypes: ['traditional-painting', 'modern-painting', 'sculpture', 'mixed-media'],
      fileFormats: ['JPG', 'PNG', 'PDF'],
      maxFileSize: 15,
      maxSubmissions: 2,
      minResolution: '300dpi'
    },
    status: 'registration-open',
    isPublished: true,
    isFeatured: false,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    createdBy: 'admin'
  }
]

const statusLabels: Record<ContestStatus, { label: string; color: string }> = {
  'draft': { label: '준비중', color: 'bg-gray-500' },
  'registration-open': { label: '등록 접수중', color: 'bg-blue-500' },
  'submission-open': { label: '출품 접수중', color: 'bg-green-500' },
  'submission-closed': { label: '접수 마감', color: 'bg-orange-500' },
  'judging': { label: '심사중', color: 'bg-purple-500' },
  'completed': { label: '완료', color: 'bg-gray-400' },
  'cancelled': { label: '취소', color: 'bg-red-500' }
}

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>(sampleContests)
  const [filteredContests, setFilteredContests] = useState<Contest[]>(sampleContests)
  const [activeTab, setActiveTab] = useState<'all' | ContestStatus>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let filtered = contests

    // 상태별 필터링
    if (activeTab !== 'all') {
      filtered = filtered.filter(contest => contest.status === activeTab)
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(contest => 
        contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contest.theme?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredContests(filtered)
  }, [contests, activeTab, searchTerm])

  const getStatusBadge = (status: ContestStatus) => {
    const statusInfo = statusLabels[status]
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">공모전</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            다양한 예술 분야의 공모전에 참여하여 여러분의 재능을 펼쳐보세요
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="공모전 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              필터
            </Button>
          </div>
        </div>

        {/* 상태별 탭 */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="registration-open">등록중</TabsTrigger>
            <TabsTrigger value="submission-open">접수중</TabsTrigger>
            <TabsTrigger value="judging">심사중</TabsTrigger>
            <TabsTrigger value="completed">완료</TabsTrigger>
            <TabsTrigger value="submission-closed">마감</TabsTrigger>
            <TabsTrigger value="cancelled">취소</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 공모전 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => (
            <Card key={contest.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{contest.title}</CardTitle>
                    {getStatusBadge(contest.status)}
                  </div>
                  {contest.isFeatured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      추천
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {contest.description}
                </p>
                {contest.theme && (
                  <p className="text-sm font-medium text-primary mt-2">
                    주제: {contest.theme}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* 주최자 */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{contest.organizer}</span>
                </div>

                {/* 출품료 */}
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>국내: {formatCurrency(contest.fees.domestic)}</span>
                </div>

                {/* 접수 마감일 */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>접수 마감: {formatDate(contest.timeline.submissionEnd)}</span>
                </div>

                {/* 전시 정보 */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{contest.exhibition.venue}</span>
                  {contest.exhibition.isVirtual && (
                    <Badge variant="outline" className="text-xs">온라인</Badge>
                  )}
                </div>

                {/* 카테고리 */}
                <div className="flex flex-wrap gap-1">
                  {contest.category.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-4">
                  <Button asChild className="flex-1">
                    <Link href={`/contests/${contest.id}`}>
                      상세보기
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                  {contest.status === 'submission-open' && (
                    <Button asChild variant="outline">
                      <Link href={`/contests/${contest.id}/submit`}>
                        출품하기
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredContests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Award className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">공모전이 없습니다</h3>
            <p className="text-muted-foreground">
              현재 조건에 맞는 공모전이 없습니다. 다른 조건으로 검색해보세요.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
} 
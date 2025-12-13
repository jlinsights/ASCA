'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Globe, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Star, 
  Award, 
  BookOpen, 
  Plane, 
  Heart,
  ArrowRight,
  CheckCircle,
  User,
  Mail,
  Phone,
  Building,
  Languages,
  GraduationCap,
  Camera,
  FileText,
  Download,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  CulturalExchangeProgramInfo,
  CulturalExchangeParticipantInfo,
  CulturalProgramType,
  CulturalProgramStatus
} from '@/lib/types/membership'

// Mock 프로그램 데이터
const mockPrograms: CulturalExchangeProgramInfo[] = [
  {
    id: 'program1',
    title: '한중일 서예교류 워크샵',
    titleKo: '한중일 서예교류 워크샵',
    titleEn: 'Korea-China-Japan Calligraphy Exchange Workshop',
    titleCn: '韩中日书法交流工作坊',
    titleJp: '韓中日書道交流ワークショップ',
    description: '한국, 중국, 일본의 서예 전통을 비교하고 서로의 기법을 배우는 3개국 문화교류 프로그램',
    descriptionKo: '한국, 중국, 일본의 서예 전통을 비교하고 서로의 기법을 배우는 3개국 문화교류 프로그램',
    descriptionEn: 'A three-nation cultural exchange program comparing calligraphy traditions of Korea, China, and Japan',
    
    programType: 'workshop_series',
    targetAudience: [2, 3, 4],
    partnerOrganizations: [
      {
        name: '중국서법협회',
        nameLocal: '中国书法协会',
        type: 'art_school',
        country: 'CN',
        city: '베이징',
        website: 'https://www.ccagov.com.cn'
      },
      {
        name: '일본서도연맹',
        nameLocal: '日本書道連盟',
        type: 'art_school',
        country: 'JP',
        city: '도쿄',
        website: 'https://www.shodorenmei.or.jp'
      }
    ],
    countries: ['KR', 'CN', 'JP'],
    languages: ['ko', 'zh', 'ja', 'en'],
    
    duration: 7,
    maxParticipants: 30,
    currentParticipants: 18,
    fee: 1200000,
    currency: 'KRW',
    
    location: '서울 인사동 한국전통문화센터',
    venue: '한국전통문화센터 대강당',
    accommodationProvided: true,
    mealsProvided: true,
    transportationProvided: false,
    
    requirements: [
      {
        type: 'membership_level',
        description: '고급 실습생 이상',
        mandatory: true,
        details: { minimumLevel: 2 }
      },
      {
        type: 'language_proficiency',
        description: '영어 기본 소통 가능',
        mandatory: false
      },
      {
        type: 'experience',
        description: '서예 경력 3년 이상',
        mandatory: true,
        details: { minimumYears: 3 }
      }
    ],
    
    benefits: [
      {
        type: 'certificate',
        description: '국제 문화교류 수료증',
        value: '3개국 공동 인증'
      },
      {
        type: 'networking',
        description: '국제 서예가 네트워크',
        value: '평생 멘토링'
      },
      {
        type: 'cultural_credit',
        description: '문화교류 활동 점수',
        value: '100점'
      }
    ],
    
    schedule: [
      {
        date: new Date('2025-03-15'),
        startTime: '09:00',
        endTime: '12:00',
        title: '환영식 및 개막 세리머니',
        location: '한국전통문화센터',
        type: 'cultural_activity',
        required: true
      },
      {
        date: new Date('2025-03-15'),
        startTime: '14:00',
        endTime: '17:00',
        title: '한국 전통 서예 워크샵',
        location: '서예실 A',
        type: 'workshop',
        required: true
      },
      {
        date: new Date('2025-03-16'),
        startTime: '09:00',
        endTime: '12:00',
        title: '중국 서법 기법 실습',
        location: '서예실 B',
        type: 'workshop',
        required: true
      },
      {
        date: new Date('2025-03-17'),
        startTime: '09:00',
        endTime: '12:00',
        title: '일본 서도 체험',
        location: '서예실 C',
        type: 'workshop',
        required: true
      }
    ],
    
    applicationDeadline: new Date('2025-02-28'),
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-03-21'),
    
    status: 'open_for_applications',
    organizerId: 'admin1',
    coordinators: [
      {
        userId: 'coord1',
        name: '김문화',
        role: 'lead',
        contact: 'kim.culture@asca.org',
        languages: ['ko', 'en', 'zh'],
        expertise: ['국제교류', '행정관리']
      }
    ],
    
    images: [
      '/images/programs/korea-china-japan-workshop.jpg',
      '/images/programs/calligraphy-exchange.jpg'
    ],
    documents: [
      {
        title: '참가 신청서',
        type: 'application_form',
        url: '/documents/kcj-workshop-application.pdf',
        language: 'ko',
        updatedAt: new Date('2025-01-15')
      },
      {
        title: '상세 일정표',
        type: 'itinerary',
        url: '/documents/kcj-workshop-schedule.pdf',
        language: 'ko',
        updatedAt: new Date('2025-01-15')
      }
    ],
    
    isFeatured: true,
    
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-20')
  },
  {
    id: 'program2',
    title: '아시아 서예가 레지던시',
    titleKo: '아시아 서예가 레지던시',
    titleEn: 'Asian Calligraphy Artist Residency',
    
    programType: 'artist_residency',
    targetAudience: [3, 4],
    partnerOrganizations: [],
    countries: ['KR', 'CN', 'JP', 'VN', 'TH'],
    languages: ['ko', 'en'],
    
    duration: 30,
    maxParticipants: 8,
    currentParticipants: 5,
    fee: 2500000,
    currency: 'KRW',
    
    location: '경주 전통문화예술마을',
    accommodationProvided: true,
    mealsProvided: true,
    transportationProvided: true,
    
    requirements: [
      {
        type: 'membership_level',
        description: '인증 서예가 이상',
        mandatory: true,
        details: { minimumLevel: 3 }
      },
      {
        type: 'experience',
        description: '전문 서예가 경력 5년 이상',
        mandatory: true,
        details: { minimumYears: 5 }
      }
    ],
    
    benefits: [
      {
        type: 'portfolio_enhancement',
        description: '개인 작품집 제작 지원'
      },
      {
        type: 'portfolio_enhancement',
        description: '레지던시 결과 전시회'
      }
    ],
    
    schedule: [],
    
    applicationDeadline: new Date('2025-04-30'),
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-30'),
    
    status: 'open_for_applications',
    organizerId: 'admin1',
    coordinators: [],
    
    images: ['/images/programs/artist-residency.jpg'],
    documents: [],
    
    isFeatured: false,
    
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-15')
  }
]

// 프로그램 타입별 설정
const programTypeConfig: Record<CulturalProgramType, { 
  name: string
  icon: string
  color: string
  description: string
}> = {
  cultural_immersion: { 
    name: '문화체험', 
    icon: '🏛️', 
    color: 'bg-blue-500', 
    description: '현지 문화에 깊이 몰입하는 체험형 프로그램' 
  },
  artist_residency: { 
    name: '아티스트 레지던시', 
    icon: '🎨', 
    color: 'bg-purple-500', 
    description: '작품 활동에 집중할 수 있는 창작 지원 프로그램' 
  },
  workshop_series: { 
    name: '워크샵 시리즈', 
    icon: '🛠️', 
    color: 'bg-green-500', 
    description: '체계적인 기법 학습을 위한 단계별 워크샵' 
  },
  exhibition_exchange: { 
    name: '전시교류', 
    icon: '🖼️', 
    color: 'bg-amber-500', 
    description: '작품 전시를 통한 국제적 문화교류' 
  },
  academic_collaboration: { 
    name: '학술교류', 
    icon: '🎓', 
    color: 'bg-indigo-500', 
    description: '연구 및 학술적 성과 공유 프로그램' 
  },
  youth_program: { 
    name: '청년 프로그램', 
    icon: '🌟', 
    color: 'bg-pink-500', 
    description: '젊은 서예가들을 위한 특별 프로그램' 
  },
  master_class: { 
    name: '마스터클래스', 
    icon: '👨‍🏫', 
    color: 'bg-red-500', 
    description: '거장들과 함께하는 고급 기법 교육' 
  }
}

// 상태별 설정
const statusConfig: Record<CulturalProgramStatus, {
  name: string
  color: string
  bgColor: string
}> = {
  planning: { name: '기획 중', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  open_for_applications: { name: '모집 중', color: 'text-green-600', bgColor: 'bg-green-100' },
  applications_closed: { name: '모집 마감', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  in_progress: { name: '진행 중', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  completed: { name: '완료', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  cancelled: { name: '취소', color: 'text-red-600', bgColor: 'bg-red-100' }
}

export default function CulturalExchangePage() {
  const [programs, setPrograms] = useState<CulturalExchangeProgramInfo[]>(mockPrograms)
  const [selectedProgram, setSelectedProgram] = useState<CulturalExchangeProgramInfo | null>(null)
  const [filterType, setFilterType] = useState<CulturalProgramType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<CulturalProgramStatus | 'all'>('all')

  // 필터링된 프로그램 목록
  const filteredPrograms = programs.filter(program => {
    if (filterType !== 'all' && program.programType !== filterType) return false
    if (filterStatus !== 'all' && program.status !== filterStatus) return false
    return true
  })

  // D-Day 계산
  const getDDay = (deadline: Date) => {
    const today = new Date()
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff > 0) return `D-${diff}`
    if (diff === 0) return 'D-Day'
    return '마감'
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* 헤더 섹션 */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl md:text-5xl font-bold">문화교류 프로그램</h1>
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              세계 각국의 서예 전통을 배우고, 국제적인 예술가 네트워크를 구축하세요
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {programs.length}
                </div>
                <div className="text-sm text-muted-foreground">진행 프로그램</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {programs.filter(p => p.status === 'open_for_applications').length}
                </div>
                <div className="text-sm text-muted-foreground">모집 중</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {programs.reduce((sum, p) => sum + p.currentParticipants, 0)}
                </div>
                <div className="text-sm text-muted-foreground">총 참가자</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="programs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="programs">프로그램 목록</TabsTrigger>
            <TabsTrigger value="my-applications">내 신청 현황</TabsTrigger>
            <TabsTrigger value="certificates">수료증</TabsTrigger>
          </TabsList>

          {/* 프로그램 목록 탭 */}
          <TabsContent value="programs" className="space-y-6">
            {/* 필터 */}
            <Card>
              <CardHeader>
                <CardTitle>프로그램 필터</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">프로그램 유형</label>
                    <select 
                      className="px-3 py-2 border border-border rounded-md"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                    >
                      <option value="all">전체</option>
                      {Object.entries(programTypeConfig).map(([type, config]) => (
                        <option key={type} value={type}>
                          {config.icon} {config.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">모집 상태</label>
                    <select 
                      className="px-3 py-2 border border-border rounded-md"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                      <option value="all">전체</option>
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <option key={status} value={status}>
                          {config.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 프로그램 목록 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPrograms.map(program => {
                const typeConfig = programTypeConfig[program.programType]
                const statusConfig_ = statusConfig[program.status]
                const progressPercentage = (program.currentParticipants / program.maxParticipants) * 100
                
                return (
                  <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* 프로그램 이미지 */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={program.images[0] || '/placeholder.svg'}
                        alt={program.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={cn("text-white", typeConfig.color)}>
                          {typeConfig.icon} {typeConfig.name}
                        </Badge>
                        <Badge className={cn(statusConfig_.bgColor, statusConfig_.color)}>
                          {statusConfig_.name}
                        </Badge>
                      </div>
                      {program.isFeatured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-amber-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            추천
                          </Badge>
                        </div>
                      )}
                      {program.applicationDeadline && (
                        <div className="absolute bottom-4 right-4">
                          <Badge variant="secondary" className="bg-black/50 text-white border-0">
                            <Clock className="w-3 h-3 mr-1" />
                            {getDDay(program.applicationDeadline)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2">{program.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {program.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{program.startDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{program.duration}일</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">{program.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{program.currentParticipants}/{program.maxParticipants}명</span>
                          </div>
                        </div>

                        {/* 참가 국가 */}
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">참가 국가</div>
                          <div className="flex gap-2">
                            {program.countries.map(country => (
                              <Badge key={country} variant="outline" className="text-xs">
                                {country === 'KR' ? '🇰🇷 한국' :
                                 country === 'CN' ? '🇨🇳 중국' :
                                 country === 'JP' ? '🇯🇵 일본' :
                                 country === 'VN' ? '🇻🇳 베트남' :
                                 country === 'TH' ? '🇹🇭 태국' : country}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* 모집 진행률 */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>모집 진행률</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>

                        {/* 참가비 */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold">
                              ₩{program.fee.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {program.accommodationProvided && '숙박 포함'} 
                              {program.mealsProvided && ' • 식사 포함'}
                            </div>
                          </div>
                          <Button 
                            onClick={() => setSelectedProgram(program)}
                            disabled={program.status !== 'open_for_applications'}
                          >
                            {program.status === 'open_for_applications' ? '신청하기' : '모집마감'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* 내 신청 현황 탭 */}
          <TabsContent value="my-applications">
            <Card>
              <CardHeader>
                <CardTitle>신청 현황</CardTitle>
                <p className="text-muted-foreground">
                  내가 신청한 문화교류 프로그램의 진행 상황을 확인하세요.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">아직 신청한 프로그램이 없습니다</h3>
                  <p className="text-muted-foreground mb-4">
                    관심 있는 문화교류 프로그램에 신청해 보세요.
                  </p>
                  <Button onClick={() => window.history.back()}>
                    프로그램 둘러보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 수료증 탭 */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>수료증</CardTitle>
                <p className="text-muted-foreground">
                  완료한 문화교류 프로그램의 수료증을 다운로드하실 수 있습니다.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">보유한 수료증이 없습니다</h3>
                  <p className="text-muted-foreground">
                    문화교류 프로그램을 완료하면 수료증이 발급됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 프로그램 상세 모달 (임시) */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedProgram.title}</CardTitle>
                  <p className="text-muted-foreground mt-2">{selectedProgram.description}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedProgram(null)}
                >
                  닫기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h4 className="font-semibold mb-3">프로그램 정보</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">기간:</span>
                      <span className="ml-2">{selectedProgram.duration}일</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">장소:</span>
                      <span className="ml-2">{selectedProgram.location}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">참가비:</span>
                      <span className="ml-2">₩{selectedProgram.fee.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">모집인원:</span>
                      <span className="ml-2">{selectedProgram.maxParticipants}명</span>
                    </div>
                  </div>
                </div>

                {/* 신청 자격 */}
                <div>
                  <h4 className="font-semibold mb-3">신청 자격</h4>
                  <div className="space-y-2">
                    {selectedProgram.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{req.description}</span>
                        {req.mandatory && <Badge variant="secondary" className="text-xs">필수</Badge>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 프로그램 혜택 */}
                <div>
                  <h4 className="font-semibold mb-3">프로그램 혜택</h4>
                  <div className="space-y-2">
                    {selectedProgram.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-sm">{benefit.description}</span>
                        {benefit.value && (
                          <Badge variant="outline" className="text-xs">{benefit.value}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 신청 버튼 */}
                <div className="pt-4 border-t">
                  <Button className="w-full" size="lg">
                    지금 신청하기
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    신청 마감: {selectedProgram.applicationDeadline?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
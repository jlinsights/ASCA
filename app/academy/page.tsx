'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, Clock, User, Info, BookOpen, ArrowRight, ImageIcon } from 'lucide-react'

// Mock Data for Fallback
const MOCK_COURSES = [
    {
      id: 'cal1',
      courseId: 'C102104202511005',
      title: '나만의 캘리그라피 작품완성',
      instructor: '심재 오민준',
      schedule: '매주 화요일 10:00 - 13:00',
      period: '2026.01.13 - 02.03',
      level: '통합',
      description: '자신만의 독창적인 서체를 개발하고 완성도 높은 캘리그라피 작품을 제작하는 과정입니다.',
      curriculum: ['기초 선긋기와 필압 조절', '나만의 서체 찾기', '구도와 장법', '작품 제작 및 크리틱'],
      fee: '200,000원 (4주)',
      status: '접수중',
      externalLink: 'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511005',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cal2',
      courseId: 'C102104202511008',
      title: '서법의 기초 운필원리 핵심',
      instructor: '무산 허회태',
      schedule: '매주 수요일 10:00 - 13:00',
      period: '2026.01.14 - 02.04',
      level: '중급',
      description: '운필의 원리를 익히고 서법의 기초를 다지는 핵심 강의입니다.',
      curriculum: ['문자의 조형성 연구', '재료학 및 표현기법', '공간 구성 실습', '포트폴리오 제작'],
      fee: '250,000원 (4주)',
      status: '접수중',
      externalLink: 'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511008',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cal3',
      courseId: 'C102104202511009',
      title: '전통과 현대문인화의 만남',
      instructor: '화정 김무호',
      schedule: '매주 목요일 13:00 - 16:00',
      period: '2026.01.15 - 02.05',
      level: '고급',
      description: '전통 문인화의 기법을 현대적 감각으로 재해석하여 작품을 완성합니다.',
      curriculum: ['전통 문인화의 이해', '사군자 표현 기법', '현대적 재료 활용', '작품 창작 실습'],
      fee: '200,000원 (4주)',
      status: '접수중',
      externalLink: 'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511009',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
       id: 'han1',
       courseId: 'C102104202511019',
       title: '한글서예 (한결)',
       instructor: '한결 김문희',
       schedule: '매주 토요일 10:00 - 13:00',
       period: '2026.01.10 - 01.31',
       level: '통합',
       description: '한글 서예의 정통 필법을 익히고 아름다운 우리말을 품격 있게 표현합니다.',
       curriculum: ['자음과 모음의 결구', '판본체와 궁체', '흘림체 기초', '창작 연습'],
       fee: '200,000원 (4주)',
       status: '마감임박',
       externalLink: 'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511019',
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString()
    },
    {
       id: 'min1',
       courseId: 'C102104202511020',
       title: '새해 행운과 행복을 가져오는 민화',
       instructor: '심수현',
       schedule: '매주 토요일 10:00 - 13:00',
       period: '2026.01.10 - 01.31',
       level: '통합',
       description: '새해를 맞아 복을 기원하는 전통 민화를 배우고 작품을 완성합니다.',
       curriculum: ['민화의 기초 이해', '채색 기법 익히기', '상징물 표현', '작품 완성'],
       fee: '200,000원 (4주)',
       status: '접수중',
       externalLink: 'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511020',
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString()
    }
];

const MOCK_INSTRUCTORS = [
  {
    id: 'A1',
    name: '화정 김무호',
    category: '문인화·사군자',
    introTitle: '전통과 현대의 조화',
    imageUrl: 'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_kmh1_20250823.jpg',
    career: [
      '대한민국미술대전-대한민국서예대전-초대작가',
      '충남미술대전 초대작가',
      '대한민국미술대전(문인화 부문) 특선'
    ],
    artworkUrl: 'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_kmh1_20250823_1.jpg',
    artworkDesc: '▲ 화정 김무호_지지송추영...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'A2',
    name: '한결 김문희',
    category: '한글서예',
    introTitle: '한글 서예의 아름다움',
    imageUrl: 'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_kmh2_20250823.jpg',
    career: [
      '대한민국미술대전 서예부문 초대작가',
      '경기미술대전 서예부문 초대작가',
      '중국미술대학 서법과 석사'
    ],
    artworkUrl: '',
    artworkDesc: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'A3',
    name: '무산 허회태',
    category: '한문서예',
    introTitle: '이모그래피의 창시자',
    imageUrl: '', 
    career: [
      '이모그래피(Emography) 창시자',
      '개인전 20회 (한국, 미국, 독일 등)',
      '대한민국미술대전 심사위원 역임'
    ],
    artworkUrl: '',
    artworkDesc: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'A4',
    name: '심재 오민준',
    category: '캘리그라피',
    introTitle: '감성과 조형의 만남',
    imageUrl: 'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_omj_20250823.jpg', 
    career: [
        '한국캘리그라피디자인협회 이사',
        '원광대학교 서예문화예술학과 겸임교수',
        '개인전 및 초대전 다수'
    ],
    artworkUrl: '',
    artworkDesc: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'A5',
    name: '심수현',
    category: '민화',
    introTitle: '행복을 그리는 민화',
    imageUrl: '', 
    career: [
        '전통민화 작가',
        '다수 회원전 및 그룹전 참여',
        '민화 지도사 자격 보유'
    ],
    artworkUrl: '',
    artworkDesc: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];


// Types based on DB Schema
interface AcademyCourse {
  id: string
  courseId: string
  title: string
  instructor: string
  schedule: string
  period: string
  level: string
  description: string
  curriculum: string[]
  fee: string
  status: string
  externalLink: string
  createdAt: string
  updatedAt: string
}

interface AcademyInstructor {
  id: string
  name: string
  introTitle: string
  category: string
  imageUrl: string
  career: string[]
  artworkUrl: string
  artworkDesc: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState("courses")
  
  const { data: courses, error: coursesError, isLoading: coursesLoading } = useSWR<AcademyCourse[]>('/api/academy/courses', fetcher)
  const { data: instructors, error: instructorsError, isLoading: instructorsLoading } = useSWR<AcademyInstructor[]>('/api/academy/instructors', fetcher)

  // Use API data if available is array, otherwise use mock data
  const allCourses = (Array.isArray(courses) && courses.length > 0) ? courses : MOCK_COURSES
  const safeInstructors = (Array.isArray(instructors) && instructors.length > 0) ? instructors : MOCK_INSTRUCTORS
  
  // Only show loading if we have NO data to show (e.g. neither real nor mock)
  // In this case, we always have mock, so we never really "loading" in a way that blocks view.
  // But let's keep original flag logic but negated by existence of mock.
  const isLoading = (coursesLoading || instructorsLoading) && allCourses.length === 0 && safeInstructors.length === 0

  // Helper to determine if a course is "New" (e.g. created within last 7 days)
  const isNewCourse = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
    return diffDays <= 7
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/academy-hero.jpg"
            alt="Academy Hero"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            예술의전당 서화아카데미
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            한국 서예의 맥을 잇다
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto">
            국내 최고의 강사진과 함께하는 깊이 있는 서예 교육.<br className="hidden md:block" />
            전통의 향기와 현대적 감각이 어우러진 배움의 장에 여러분을 초대합니다.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="grid grid-cols-2 w-full max-w-[400px]">
              <TabsTrigger value="courses">강좌소개</TabsTrigger>
              <TabsTrigger value="instructors">강사소개</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="courses" className="space-y-12">
            
            {/* Notice Section */}
            <div className="bg-muted/30 border border-border rounded-lg p-6 md:p-8">
              <div className="flex items-start space-x-4">
                <Info className="w-6 h-6 text-celadon-green mt-1 flex-shrink-0" />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">수강신청 안내</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      모든 강좌는 예술의전당 홈페이지를 통해 신청 및 결제가 진행됩니다. 
                      아래 '수강 신청하기' 버튼을 클릭하시면 해당 강좌의 접수 페이지로 이동합니다.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="bg-background/50 p-4 rounded-md">
                      <strong className="block text-foreground mb-1">환불 규정</strong>
                      개강일 전일까지 전액 환불 가능하며, 이후 평생교육법 반환 기준에 따릅니다.
                    </div>
                    <div className="bg-background/50 p-4 rounded-md">
                      <strong className="block text-foreground mb-1">문의 사항</strong>
                      전화: 02-580-1657~9 (서에박물관)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
               <div className="text-center py-20">
                 <p className="text-muted-foreground">데이터를 불러오는 중입니다...</p>
               </div>
            ) : allCourses.length === 0 ? (
               <div className="text-center py-20">
                 <p className="text-muted-foreground">현재 등록된 강좌가 없습니다.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {allCourses.map((course) => (
                  <div key={course.id} className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-celadon-green">{course.period}</span>
                              {isNewCourse(course.createdAt) && (
                                <Badge className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] px-1.5 py-0.5 h-auto">NEW</Badge>
                              )}
                           </div>
                          <h3 className="text-2xl font-serif font-bold group-hover:text-celadon-green transition-colors">
                            {course.title}
                          </h3>
                        </div>
                        <Badge variant={course.status === '접수중' ? 'default' : 'secondary'}>
                          {course.status || '상태미정'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4 mb-8 flex-1">
                        <p className="text-muted-foreground line-clamp-2 md:line-clamp-none">
                          {course.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <User className="w-4 h-4 mr-2" />
                            {course.instructor}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {course.schedule}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <BookOpen className="w-4 h-4 mr-2" />
                            {course.level}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            4주 과정
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
                        <div className="text-lg font-semibold">
                          {course.fee}
                        </div>
                        <div className="flex gap-3">
                           <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">상세보기</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-serif mb-2">{course.title}</DialogTitle>
                                <DialogDescription>
                                  {course.instructor} • {course.schedule}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6 py-4">
                                <div>
                                  <h4 className="font-semibold mb-2">강좌 소개</h4>
                                  <p className="text-muted-foreground leading-relaxed">
                                    {course.description}
                                  </p>
                                </div>
                                
                                {course.curriculum && course.curriculum.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2">커리큘럼</h4>
                                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                      <ul className="space-y-2">
                                        {course.curriculum.map((item, index) => (
                                          <li key={index} className="text-sm text-muted-foreground flex">
                                            <span className="mr-3 text-celadon-green font-medium">{index + 1}주차</span>
                                            {item}
                                          </li>
                                        ))}
                                      </ul>
                                    </ScrollArea>
                                  </div>
                                )}

                                <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">수강기간</span>
                                    <span className="font-medium">{course.period}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">강의시간</span>
                                    <span className="font-medium">{course.schedule}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">수강료</span>
                                    <span className="font-medium">{course.fee}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-3">
                                 {course.externalLink && (
                                   <Button 
                                      className="bg-celadon-green hover:bg-celadon-green/90 w-full md:w-auto"
                                      onClick={() => window.open(course.externalLink, '_blank')}
                                    >
                                      수강 신청하기
                                      <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                 )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          {course.externalLink && (
                            <Button 
                              className="bg-celadon-green hover:bg-celadon-green/90"
                              onClick={() => window.open(course.externalLink, '_blank')}
                            >
                              수강 신청하기
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="instructors" className="space-y-12">
             {isLoading ? (
               <div className="text-center py-20">
                 <p className="text-muted-foreground">강사 정보를 불러오는 중입니다...</p>
               </div>
             ) : !safeInstructors || safeInstructors.length === 0 ? (
               <div className="text-center py-20">
                 <p className="text-muted-foreground">현재 등록된 강사 정보가 없습니다.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {safeInstructors.map((instructor) => (
                  <div key={instructor.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                      {instructor.imageUrl ? (
                        <Image
                          src={instructor.imageUrl}
                          alt={instructor.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          이미지 준비중
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-24 text-white">
                        <span className="text-sm font-medium text-celadon-green/90 mb-1 block">
                          {instructor.category || '전문강사'}
                        </span>
                        <h3 className="text-2xl font-serif font-bold">
                          {instructor.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {instructor.career && instructor.career.length > 0 ? (
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {instructor.career.slice(0, 3).map((item, i) => (
                            <li key={i} className="line-clamp-1">• {item}</li>
                          ))}
                          {instructor.career.length > 3 && (
                            <li className="text-xs text-celadon-green pt-1">외 다수 경력 보유</li>
                          )}
                        </ul>
                      ) : (
                         <p className="text-sm text-muted-foreground">약력 정보가 없습니다.</p>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full mt-4">프로필 상세보기</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                           <DialogHeader>
                            <DialogTitle className="text-2xl font-serif">{instructor.name}</DialogTitle>
                            <DialogDescription className="text-celadon-green font-medium">
                              {instructor.category}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid md:grid-cols-2 gap-6 py-4">
                             <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-muted">
                                {instructor.imageUrl && (
                                  <Image src={instructor.imageUrl} alt={instructor.name} fill className="object-cover" />
                                )}
                             </div>
                             <div className="space-y-6">
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center">
                                    <User className="w-4 h-4 mr-2" /> 주요 약력
                                  </h4>
                                  <ul className="space-y-2 text-sm text-muted-foreground">
                                     {instructor.career?.map((item, i) => (
                                      <li key={i}>• {item}</li>
                                     ))}
                                  </ul>
                                </div>
                                {instructor.artworkUrl && (
                                  <div>
                                     <h4 className="font-semibold mb-3 flex items-center">
                                       <ImageIcon className="w-4 h-4 mr-2" /> 대표 작품
                                     </h4>
                                     <div className="aspect-square relative rounded-lg overflow-hidden border bg-muted">
                                        <Image src={instructor.artworkUrl} alt={instructor.artworkDesc || 'Artwork'} fill className="object-cover" />
                                     </div>
                                     {instructor.artworkDesc && (
                                       <p className="text-xs text-muted-foreground mt-2">{instructor.artworkDesc}</p>
                                     )}
                                  </div>
                                )}
                             </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
               </div>
             )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

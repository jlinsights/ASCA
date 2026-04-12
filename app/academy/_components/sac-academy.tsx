'use client'

import { useState } from 'react'
import useSWR from 'swr'
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

const MOCK_COURSES = [
  {
    id: 'cal1',
    courseId: 'C102104202511005',
    title: '나만의 캘리그라피 작품완성',
    instructor: '심재 오민준',
    schedule: '매주 화요일 10:00 - 13:00',
    period: '2026.01.13 - 02.03',
    level: '통합',
    description:
      '자신만의 독창적인 서체를 개발하고 완성도 높은 캘리그라피 작품을 제작하는 과정입니다.',
    curriculum: [
      '기초 선긋기와 필압 조절',
      '나만의 서체 찾기',
      '구도와 장법',
      '작품 제작 및 크리틱',
    ],
    fee: '200,000원 (4주)',
    status: '접수중',
    externalLink:
      'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511005',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    externalLink:
      'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511008',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    externalLink:
      'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511009',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    externalLink:
      'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511019',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    externalLink:
      'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511020',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_INSTRUCTORS = [
  {
    id: 'A1',
    name: '화정 김무호',
    category: '문인화·사군자',
    introTitle: '전통과 현대의 조화',
    imageUrl:
      'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_kmh1_20250823.jpg',
    career: [
      '대한민국미술대전-대한민국서예대전-초대작가',
      '충남미술대전 초대작가',
      '대한민국미술대전(문인화 부문) 특선',
    ],
    artworkUrl:
      'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_kmh1_20250823_1.jpg',
    artworkDesc: '▲ 화정 김무호_지지송추영...',
  },
  {
    id: 'A2',
    name: '한결 김문희',
    category: '한글서예',
    introTitle: '한글 서예의 아름다움',
    imageUrl:
      'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_kmh2_20250823.jpg',
    career: [
      '대한민국미술대전 서예부문 초대작가',
      '경기미술대전 서예부문 초대작가',
      '중국미술대학 서법과 석사',
    ],
    artworkUrl: '',
    artworkDesc: '',
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
      '대한민국미술대전 심사위원 역임',
    ],
    artworkUrl: '',
    artworkDesc: '',
  },
  {
    id: 'A4',
    name: '심재 오민준',
    category: '캘리그라피',
    introTitle: '감성과 조형의 만남',
    imageUrl:
      'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_omj_20250823.jpg',
    career: [
      '한국캘리그라피디자인협회 이사',
      '원광대학교 서예문화예술학과 겸임교수',
      '개인전 및 초대전 다수',
    ],
    artworkUrl: '',
    artworkDesc: '',
  },
  {
    id: 'A5',
    name: '심수현',
    category: '민화',
    introTitle: '행복을 그리는 민화',
    imageUrl: '',
    career: ['전통민화 작가', '다수 회원전 및 그룹전 참여', '민화 지도사 자격 보유'],
    artworkUrl: '',
    artworkDesc: '',
  },
]

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

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function SacAcademy() {
  const [activeTab, setActiveTab] = useState('courses')

  const { data: courses } = useSWR<AcademyCourse[]>('/api/academy/courses', fetcher)
  const { data: instructors } = useSWR<AcademyInstructor[]>('/api/academy/instructors', fetcher)

  const allCourses = Array.isArray(courses) && courses.length > 0 ? courses : MOCK_COURSES
  const safeInstructors =
    Array.isArray(instructors) && instructors.length > 0 ? instructors : MOCK_INSTRUCTORS

  const isNewCourse = (createdAt: string) => {
    const diffMs = Math.abs(Date.now() - new Date(createdAt).getTime())
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) <= 7
  }

  return (
    <div id='sac-academy' className='scroll-mt-24 space-y-8'>
      <div className='text-center'>
        <Badge
          variant='outline'
          className='mb-3 bg-scholar-red/5 text-scholar-red border-scholar-red/20'
        >
          예술의전당 서화아카데미
        </Badge>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>한국 서예의 맥을 잇다</h2>
        <p className='text-muted-foreground max-w-2xl mx-auto'>
          국내 최고의 강사진과 함께하는 깊이 있는 서예 교육. 전통의 향기와 현대적 감각이 어우러진
          배움의 장에 여러분을 초대합니다.
        </p>
      </div>

      {/* SAC Poster + Benefit */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <a
          href='https://www.sac.or.kr/site/main/board/academy_stats/314871'
          target='_blank'
          rel='noopener noreferrer'
          className='block overflow-hidden rounded-lg border hover:shadow-md transition-shadow'
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='/webflow/orientalcalligraphy/images/예술의전당-서화아카데미-포스터.webp'
            alt='예술의전당 서화아카데미 포스터'
            className='w-full object-contain'
            loading='lazy'
          />
        </a>
        <div className='space-y-4 text-sm text-muted-foreground'>
          <h3 className='text-lg font-bold text-foreground'>전통과 신뢰로 이어온 특별한 혜택</h3>
          <p>
            동양서예협회의 대표 전시공간인 예술의전당에서 서화아카데미 정규강좌 수강생 중
            동양서예협회에서 주최하는 공모전, 초대작가전 및 특별 기획전에 출품 예정이신 분들께{' '}
            <strong className='text-scholar-red'>
              수강료의 최대 10%에 해당하는 금액을 출품료에서 할인
            </strong>
            하여 드립니다.
          </p>
          <ul className='space-y-2'>
            <li>
              <strong className='text-foreground'>대상:</strong> 예술의전당 서화아카데미 수강생
            </li>
            <li>
              <strong className='text-foreground'>혜택:</strong> 수강료의 5% 상당 출품료 할인
              (정회원 등록 시 추가 5% 할인)
            </li>
            <li>
              <strong className='text-foreground'>신청:</strong> 동양서협 사무국에 수강증 제시
            </li>
          </ul>
          <div className='flex items-center gap-3 pt-2'>
            <a
              href='https://cal.com/orientalcalligraphy/academy'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center rounded-md bg-scholar-red px-4 py-2 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors'
            >
              상담 예약
            </a>
            <a
              href='https://www.sac.or.kr/site/main/board/academy_stats/314871'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors'
            >
              교육과정 상세 보기
            </a>
          </div>
        </div>
      </div>

      {/* Courses & Instructors Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <div className='flex justify-center mb-8'>
          <TabsList className='grid grid-cols-2 w-full max-w-[400px]'>
            <TabsTrigger value='courses'>강좌소개</TabsTrigger>
            <TabsTrigger value='instructors'>강사소개</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='courses' className='space-y-8'>
          {/* Notice */}
          <div className='bg-muted/30 border rounded-lg p-5 md:p-6'>
            <div className='flex items-start gap-3'>
              <Info className='w-5 h-5 text-celadon-green mt-0.5 shrink-0' />
              <div className='space-y-3'>
                <div>
                  <h3 className='text-sm font-semibold mb-1'>수강신청 안내</h3>
                  <p className='text-sm text-muted-foreground'>
                    모든 강좌는 예술의전당 홈페이지를 통해 신청 및 결제가 진행됩니다.
                  </p>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground'>
                  <div className='bg-background/50 p-3 rounded-md'>
                    <strong className='block text-foreground mb-0.5 text-sm'>환불 규정</strong>
                    개강일 전일까지 전액 환불 가능, 이후 평생교육법 기준 적용
                  </div>
                  <div className='bg-background/50 p-3 rounded-md'>
                    <strong className='block text-foreground mb-0.5 text-sm'>문의 사항</strong>
                    전화: 02-580-1657~9 (서예박물관)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {allCourses.map(course => (
              <div
                key={course.id}
                className='group flex flex-col bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all'
              >
                <div className='p-5 md:p-6 flex-1 flex flex-col'>
                  <div className='flex justify-between items-start mb-3'>
                    <div className='space-y-1.5'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-medium text-celadon-green'>
                          {course.period}
                        </span>
                        {isNewCourse(course.createdAt) && (
                          <Badge className='bg-rose-500 hover:bg-rose-600 text-white text-[10px] px-1.5 py-0.5 h-auto'>
                            NEW
                          </Badge>
                        )}
                      </div>
                      <h3 className='text-xl font-bold group-hover:text-celadon-green transition-colors'>
                        {course.title}
                      </h3>
                    </div>
                    <Badge variant={course.status === '접수중' ? 'default' : 'secondary'}>
                      {course.status || '상태미정'}
                    </Badge>
                  </div>

                  <div className='space-y-3 mb-6 flex-1'>
                    <p className='text-sm text-muted-foreground line-clamp-2'>
                      {course.description}
                    </p>
                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <div className='flex items-center text-muted-foreground'>
                        <User className='w-3.5 h-3.5 mr-1.5' />
                        {course.instructor}
                      </div>
                      <div className='flex items-center text-muted-foreground'>
                        <Clock className='w-3.5 h-3.5 mr-1.5' />
                        {course.schedule}
                      </div>
                      <div className='flex items-center text-muted-foreground'>
                        <BookOpen className='w-3.5 h-3.5 mr-1.5' />
                        {course.level}
                      </div>
                      <div className='flex items-center text-muted-foreground'>
                        <Calendar className='w-3.5 h-3.5 mr-1.5' />
                        4주 과정
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-4 border-t mt-auto'>
                    <div className='font-semibold text-sm'>{course.fee}</div>
                    <div className='flex gap-2'>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant='outline' size='sm'>
                            상세보기
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                          <DialogHeader>
                            <DialogTitle className='text-2xl mb-1'>{course.title}</DialogTitle>
                            <DialogDescription>
                              {course.instructor} &bull; {course.schedule}
                            </DialogDescription>
                          </DialogHeader>
                          <div className='space-y-5 py-4'>
                            <div>
                              <h4 className='font-semibold mb-2 text-sm'>강좌 소개</h4>
                              <p className='text-sm text-muted-foreground leading-relaxed'>
                                {course.description}
                              </p>
                            </div>
                            {course.curriculum?.length > 0 && (
                              <div>
                                <h4 className='font-semibold mb-2 text-sm'>커리큘럼</h4>
                                <ScrollArea className='h-[180px] rounded-md border p-4'>
                                  <ul className='space-y-2'>
                                    {course.curriculum.map((item, i) => (
                                      <li key={i} className='text-sm text-muted-foreground flex'>
                                        <span className='mr-3 text-celadon-green font-medium'>
                                          {i + 1}주차
                                        </span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </ScrollArea>
                              </div>
                            )}
                            <div className='bg-muted p-4 rounded-lg text-sm space-y-2'>
                              <div className='flex justify-between'>
                                <span className='text-muted-foreground'>수강기간</span>
                                <span className='font-medium'>{course.period}</span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-muted-foreground'>강의시간</span>
                                <span className='font-medium'>{course.schedule}</span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-muted-foreground'>수강료</span>
                                <span className='font-medium'>{course.fee}</span>
                              </div>
                            </div>
                          </div>
                          {course.externalLink && (
                            <div className='flex justify-end'>
                              <Button
                                className='bg-celadon-green hover:bg-celadon-green/90'
                                onClick={() => window.open(course.externalLink, '_blank')}
                              >
                                수강 신청하기
                                <ArrowRight className='w-4 h-4 ml-2' />
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      {course.externalLink && (
                        <Button
                          size='sm'
                          className='bg-celadon-green hover:bg-celadon-green/90'
                          onClick={() => window.open(course.externalLink, '_blank')}
                        >
                          수강 신청
                          <ArrowRight className='w-3.5 h-3.5 ml-1' />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='instructors'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {safeInstructors.map(instructor => (
              <div
                key={instructor.id}
                className='group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all'
              >
                <div className='aspect-[3/4] relative overflow-hidden bg-muted'>
                  {instructor.imageUrl ? (
                    <Image
                      src={instructor.imageUrl}
                      alt={instructor.name}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-muted-foreground text-sm'>
                      이미지 준비중
                    </div>
                  )}
                  <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-20 text-white'>
                    <span className='text-xs font-medium text-celadon-green/90 mb-0.5 block'>
                      {instructor.category || '전문강사'}
                    </span>
                    <h3 className='text-xl font-bold'>{instructor.name}</h3>
                  </div>
                </div>

                <div className='p-5 space-y-3'>
                  {instructor.career?.length > 0 ? (
                    <ul className='space-y-1.5 text-xs text-muted-foreground'>
                      {instructor.career.slice(0, 3).map((item, i) => (
                        <li key={i} className='line-clamp-1'>
                          &bull; {item}
                        </li>
                      ))}
                      {instructor.career.length > 3 && (
                        <li className='text-xs text-celadon-green pt-0.5'>외 다수 경력 보유</li>
                      )}
                    </ul>
                  ) : (
                    <p className='text-xs text-muted-foreground'>약력 정보가 없습니다.</p>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant='outline' size='sm' className='w-full'>
                        프로필 상세보기
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-2xl'>
                      <DialogHeader>
                        <DialogTitle className='text-2xl'>{instructor.name}</DialogTitle>
                        <DialogDescription className='text-celadon-green font-medium'>
                          {instructor.category}
                        </DialogDescription>
                      </DialogHeader>
                      <div className='grid md:grid-cols-2 gap-6 py-4'>
                        <div className='aspect-[3/4] relative rounded-lg overflow-hidden bg-muted'>
                          {instructor.imageUrl && (
                            <Image
                              src={instructor.imageUrl}
                              alt={instructor.name}
                              fill
                              className='object-cover'
                            />
                          )}
                        </div>
                        <div className='space-y-5'>
                          <div>
                            <h4 className='font-semibold mb-2 flex items-center text-sm'>
                              <User className='w-4 h-4 mr-2' /> 주요 약력
                            </h4>
                            <ul className='space-y-1.5 text-xs text-muted-foreground'>
                              {instructor.career?.map((item, i) => (
                                <li key={i}>&bull; {item}</li>
                              ))}
                            </ul>
                          </div>
                          {instructor.artworkUrl && (
                            <div>
                              <h4 className='font-semibold mb-2 flex items-center text-sm'>
                                <ImageIcon className='w-4 h-4 mr-2' /> 대표 작품
                              </h4>
                              <div className='aspect-square relative rounded-lg overflow-hidden border bg-muted'>
                                <Image
                                  src={instructor.artworkUrl}
                                  alt={instructor.artworkDesc || 'Artwork'}
                                  fill
                                  className='object-cover'
                                />
                              </div>
                              {instructor.artworkDesc && (
                                <p className='text-xs text-muted-foreground mt-1.5'>
                                  {instructor.artworkDesc}
                                </p>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

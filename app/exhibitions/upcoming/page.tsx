'use client'

import { LayoutFooter } from '@/components/layout/layout-footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, Users, Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// 전시 분류 타입 정의
type ExhibitionType =
  | '개인전'
  | '공모전'
  | '회원전'
  | '추천작가전'
  | '초대작가전'
  | '온라인전시'
  | '특별기획전'

// 전시 분류별 색상 및 아이콘 매핑
const getExhibitionTypeStyle = (type: ExhibitionType) => {
  const styles = {
    개인전: { color: 'bg-blue-600', label: '개인전' },
    공모전: { color: 'bg-purple-600', label: '공모전' },
    회원전: { color: 'bg-green-600', label: '회원전' },
    추천작가전: { color: 'bg-orange-600', label: '추천작가전' },
    초대작가전: { color: 'bg-red-600', label: '초대작가전' },
    온라인전시: { color: 'bg-indigo-600', label: '온라인전시' },
    특별기획전: { color: 'bg-rose-600', label: '특별기획전' },
  }
  return styles[type]
}

// 예정 전시 데이터
const upcomingExhibitions = [
  {
    id: 3,
    title: '서경(書境) 새로운 지평 - 동양서예의 현재와 미래',
    subtitle: 'New Horizons in East Asian Calligraphy',
    description:
      '사단법인 동양서예협회가 주최하는 2026년 특별 기획전입니다. 개인전뿐만 아니라 소규모 서예단체들의 부스전, 연합전, 그리고 작품 1점만 출품하는 것도 가능한 열린 전시입니다. 실력있는 작가들을 발굴하고 동양서예의 현재와 미래를 조망할 수 있는 귀중한 자리가 될 것입니다.',
    type: '특별기획전' as ExhibitionType,
    venue: '예술의전당 서울서예박물관 제1전시실 (2층)',
    startDate: '2026-04-15',
    endDate: '2026-04-28',
    openingHours: '오전 10시 - 오후 7시',
    admission: '무료',
    curator: '(사)동양서예협회 운영위원회',
    participatingArtists: 100, // Estimated from poster context implying many individual exhibitions
    artworks: 200, // Estimated
    image: '/images/exhibitions/poster-main.png',
    status: 'upcoming',
    daysUntil: Math.ceil(
      (new Date('2026-04-15').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    ),
  },
]

export default function UpcomingExhibitionsPage() {
  return (
    <main className='min-h-screen'>
      {/* Hero Section */}
      <section className='bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto text-center'>
            <Badge className='mb-4 bg-blue-600 text-white'>예정 전시</Badge>
            <h1 className='text-4xl md:text-5xl font-normal mb-6'>다가오는 전시</h1>
            <p className='text-lg text-muted-foreground'>
              앞으로 열릴 흥미진진한 전시들을 미리 만나보세요
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Exhibitions */}
      <section className='container mx-auto px-4 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {upcomingExhibitions.map(exhibition => (
            <Card
              key={exhibition.id}
              className='overflow-hidden group hover:shadow-lg transition-shadow'
            >
              {/* Image */}
              <div className='relative aspect-[9/16] overflow-hidden'>
                <Image
                  src={exhibition.image}
                  alt={exhibition.title}
                  fill
                  className='object-cover group-hover:scale-105 transition-transform duration-300'
                />
                <div className='absolute top-4 left-4 flex flex-col gap-2'>
                  <Badge className='bg-blue-600 text-white'>{exhibition.daysUntil}일 후</Badge>
                  <Badge className={`${getExhibitionTypeStyle(exhibition.type).color} text-white`}>
                    {getExhibitionTypeStyle(exhibition.type).label}
                  </Badge>
                </div>
                <div className='absolute top-4 right-4'>
                  <Button size='sm' variant='secondary' className='h-8 w-8 p-0'>
                    <Bell className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-xl font-medium mb-2 line-clamp-2'>{exhibition.title}</h3>
                    <p className='text-sm text-muted-foreground mb-3'>{exhibition.subtitle}</p>
                    <p className='text-sm text-muted-foreground leading-relaxed line-clamp-3'>
                      {exhibition.description}
                    </p>
                  </div>

                  {/* Exhibition Info */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Calendar className='w-4 h-4 text-muted-foreground' />
                      <span>
                        {exhibition.startDate} ~ {exhibition.endDate}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                      <MapPin className='w-4 h-4 text-muted-foreground' />
                      <span className='line-clamp-1'>{exhibition.venue}</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                      <Users className='w-4 h-4 text-muted-foreground' />
                      <span>참여작가 {exhibition.participatingArtists}명</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2 pt-2'>
                    <Button asChild size='sm' className='flex-1'>
                      <Link href={`/exhibitions/${exhibition.id}`}>상세보기</Link>
                    </Button>
                    <Button size='sm' variant='outline'>
                      알림 설정
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <LayoutFooter />
    </main>
  )
}

'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// 전시 분류 타입 정의
type ExhibitionType = '개인전' | '공모전' | '회원전' | '추천작가전' | '초대작가전' | '온라인전시'

// 전시 분류별 색상 및 아이콘 매핑
const getExhibitionTypeStyle = (type: ExhibitionType) => {
  const styles = {
    '개인전': { color: 'bg-blue-600', label: '개인전' },
    '공모전': { color: 'bg-purple-600', label: '공모전' },
    '회원전': { color: 'bg-green-600', label: '회원전' },
    '추천작가전': { color: 'bg-orange-600', label: '추천작가전' },
    '초대작가전': { color: 'bg-red-600', label: '초대작가전' },
    '온라인전시': { color: 'bg-indigo-600', label: '온라인전시' }
  }
  return styles[type]
}

// 현재 전시 데이터
const currentExhibitions = [
  {
    id: 1,
    title: '2024 동양서예협회 정기전',
    subtitle: '전통과 현대의 만남',
    description: '동양서예협회 회원들의 한 해 성과를 집약한 정기전시입니다. 전통 서예의 정수와 현대적 해석이 어우러진 작품들을 만나보실 수 있습니다.',
    type: '회원전' as ExhibitionType,
    venue: '서울시립미술관 본관',
    startDate: '2024-03-15',
    endDate: '2024-04-15',
    openingHours: '오전 10시 - 오후 6시 (월요일 휴관)',
    admission: '무료',
    curator: '김서예',
    participatingArtists: 45,
    artworks: 120,
    image: '/placeholder.svg',
    gallery: [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg'
    ],
    highlights: [
      '한글서예 특별 섹션',
      '젊은 작가들의 현대적 해석',
      '전통 한자서예의 정수',
      '문인화와 서예의 조화'
    ]
  },
  {
    id: 2,
    title: '한글의 아름다움',
    subtitle: '세종대왕 탄신 626주년 기념전',
    description: '한글의 과학성과 예술성을 서예를 통해 조명하는 특별전입니다. 궁체부터 현대 캘리그라피까지 한글 서예의 다양한 면모를 선보입니다.',
    type: '추천작가전' as ExhibitionType,
    venue: '국립한글박물관 기획전시실',
    startDate: '2024-05-15',
    endDate: '2024-07-15',
    openingHours: '오전 10시 - 오후 6시 (화요일 휴관)',
    admission: '성인 3,000원, 청소년 2,000원',
    curator: '이한글',
    participatingArtists: 25,
    artworks: 80,
    image: '/placeholder.svg',
    gallery: [
      '/placeholder.svg',
      '/placeholder.svg'
    ],
    highlights: [
      '궁체 서예의 정수',
      '현대 한글 캘리그라피',
      '한글 창제 원리 해설',
      '인터랙티브 체험 공간'
    ]
  }
]

export default function CurrentExhibitionsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">현재 전시</Badge>
            <h1 className="text-4xl md:text-5xl font-normal mb-6">
              현재 진행 중인 전시
            </h1>
            <p className="text-lg text-muted-foreground">
              동양서예협회가 주최하는 현재 진행 중인 전시를 만나보세요
            </p>
          </div>
        </div>
      </section>

      {/* Current Exhibitions */}
      <section className="container mx-auto px-4 py-16">
        <div className="space-y-16">
          {currentExhibitions.map((exhibition, index) => (
            <Card key={exhibition.id} className="overflow-hidden">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}>
                {/* Image */}
                <div className={`relative aspect-[9/16] ${
                  index % 2 === 1 ? 'lg:col-start-2' : ''
                }`}>
                  <Image
                    src={exhibition.image}
                    alt={exhibition.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-green-600 text-white">진행 중</Badge>
                    <Badge className={`${getExhibitionTypeStyle(exhibition.type).color} text-white`}>
                      {getExhibitionTypeStyle(exhibition.type).label}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardContent className={`p-8 flex flex-col justify-center ${
                  index % 2 === 1 ? 'lg:col-start-1' : ''
                }`}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-normal mb-2">{exhibition.title}</h2>
                      <p className="text-xl text-muted-foreground mb-4">{exhibition.subtitle}</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {exhibition.description}
                      </p>
                    </div>

                    {/* Exhibition Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{exhibition.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{exhibition.startDate} ~ {exhibition.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{exhibition.openingHours}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>참여작가 {exhibition.participatingArtists}명</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div>
                      <h3 className="font-medium mb-3">전시 하이라이트</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {exhibition.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ArrowRight className="w-3 h-3" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button asChild>
                        <Link href={`/exhibitions/${exhibition.id}`}>
                          전시 상세보기
                        </Link>
                      </Button>
                      <Button variant="outline">
                        관람 예약
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-normal mb-4">더 많은 전시 정보</h2>
          <p className="text-muted-foreground mb-8">
            동양서예협회의 다양한 전시 소식을 확인해보세요
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/exhibitions/upcoming">예정 전시</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/exhibitions/past">지난 전시</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/exhibitions/online">온라인 전시</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 
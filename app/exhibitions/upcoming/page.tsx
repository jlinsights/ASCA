'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, Users, Bell } from 'lucide-react'
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

// 예정 전시 데이터
const upcomingExhibitions = [
  {
    id: 3,
    title: '2024 청년 서예가 초대전',
    subtitle: '새로운 시대, 새로운 붓끝',
    description: '30세 이하 젊은 서예가들의 참신한 작품을 선보이는 특별전입니다. 전통 서예의 기법을 바탕으로 현대적 감각을 더한 작품들을 만나보실 수 있습니다.',
    type: '초대작가전' as ExhibitionType,
    venue: '인사동 갤러리 현대',
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    openingHours: '오전 10시 - 오후 7시 (일요일 휴관)',
    admission: '성인 5,000원, 학생 3,000원',
    curator: '박청년',
    participatingArtists: 20,
    artworks: 60,
    image: '/placeholder.svg',
    status: 'upcoming',
    daysUntil: 15
  },
  {
    id: 4,
    title: '한중일 서예 교류전',
    subtitle: '동아시아 서예의 만남',
    description: '한국, 중국, 일본 3개국 서예가들의 작품을 한자리에서 감상할 수 있는 국제 교류전입니다. 각국의 서예 전통과 현대적 해석을 비교해보는 귀중한 기회입니다.',
    type: '추천작가전' as ExhibitionType,
    venue: '국립현대미술관 덕수궁관',
    startDate: '2024-07-15',
    endDate: '2024-09-15',
    openingHours: '오전 10시 - 오후 6시 (월요일 휴관)',
    admission: '성인 8,000원, 청소년 6,000원',
    curator: '김국제',
    participatingArtists: 60,
    artworks: 180,
    image: '/placeholder.svg',
    status: 'upcoming',
    daysUntil: 45
  },
  {
    id: 5,
    title: '전각의 세계',
    subtitle: '돌에 새긴 문자의 예술',
    description: '전각(篆刻) 예술의 깊이와 아름다움을 조명하는 특별전입니다. 고대부터 현대까지 전각의 역사와 기법, 그리고 현대 전각가들의 작품을 소개합니다.',
    type: '공모전' as ExhibitionType,
    venue: '서울공예박물관',
    startDate: '2024-08-01',
    endDate: '2024-10-31',
    openingHours: '오전 10시 - 오후 6시 (화요일 휴관)',
    admission: '성인 4,000원, 청소년 2,000원',
    curator: '이전각',
    participatingArtists: 15,
    artworks: 100,
    image: '/placeholder.svg',
    status: 'upcoming',
    daysUntil: 60
  }
]

export default function UpcomingExhibitionsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-600 text-white">예정 전시</Badge>
            <h1 className="text-4xl md:text-5xl font-normal mb-6">
              다가오는 전시
            </h1>
            <p className="text-lg text-muted-foreground">
              앞으로 열릴 흥미진진한 전시들을 미리 만나보세요
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Exhibitions */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {upcomingExhibitions.map((exhibition) => (
            <Card key={exhibition.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative aspect-[9/16] overflow-hidden">
                <Image
                  src={exhibition.image}
                  alt={exhibition.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-blue-600 text-white">
                    {exhibition.daysUntil}일 후
                  </Badge>
                  <Badge className={`${getExhibitionTypeStyle(exhibition.type).color} text-white`}>
                    {getExhibitionTypeStyle(exhibition.type).label}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium mb-2 line-clamp-2">
                      {exhibition.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {exhibition.subtitle}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {exhibition.description}
                    </p>
                  </div>

                  {/* Exhibition Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{exhibition.startDate} ~ {exhibition.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="line-clamp-1">{exhibition.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>참여작가 {exhibition.participatingArtists}명</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/exhibitions/${exhibition.id}`}>
                        상세보기
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      알림 설정
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Archive, BookOpen } from 'lucide-react'
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

const pastExhibitions = [
  {
    id: 6,
    title: '2023 동양서예협회 정기전',
    subtitle: '전통의 계승과 발전',
    description: '2023년 한 해 동안의 회원 작품을 총망라한 정기전시였습니다.',
    type: '회원전' as ExhibitionType,
    venue: '예술의전당 한가람미술관',
    startDate: '2023-11-01',
    endDate: '2023-11-30',
    participatingArtists: 52,
    artworks: 156,
    visitors: 15420,
    image: '/placeholder.svg?height=400&width=600',
    hasCatalog: true
  },
  {
    id: 7,
    title: '서예와 문학의 만남',
    subtitle: '시와 서예의 조화',
    description: '한국 고전 문학 작품을 서예로 표현한 특별전시였습니다.',
    type: '추천작가전' as ExhibitionType,
    venue: '국립중앙박물관',
    startDate: '2023-09-15',
    endDate: '2023-10-15',
    participatingArtists: 30,
    artworks: 90,
    visitors: 12800,
    image: '/placeholder.svg?height=400&width=600',
    hasCatalog: true
  }
]

export default function PastExhibitionsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      <section className="bg-gradient-to-b from-amber-50 to-background dark:from-amber-950/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-amber-600 text-white">지난 전시</Badge>
            <h1 className="text-4xl md:text-5xl font-normal mb-6">
              지난 전시 아카이브
            </h1>
            <p className="text-lg text-muted-foreground">
              동양서예협회의 소중한 전시 기록들을 만나보세요
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pastExhibitions.map((exhibition) => (
            <Card key={exhibition.id} className="overflow-hidden">
              <div className="relative aspect-[9/16]">
                <Image
                  src={exhibition.image}
                  alt={exhibition.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-amber-600 text-white">
                    <Archive className="w-3 h-3 mr-1" />
                    완료
                  </Badge>
                  <Badge className={`${getExhibitionTypeStyle(exhibition.type).color} text-white`}>
                    {getExhibitionTypeStyle(exhibition.type).label}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-2">{exhibition.title}</h3>
                <p className="text-muted-foreground mb-4">{exhibition.subtitle}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{exhibition.startDate} ~ {exhibition.endDate}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/exhibitions/${exhibition.id}`}>
                      전시 기록 보기
                    </Link>
                  </Button>
                  {exhibition.hasCatalog && (
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/catalog/${exhibition.id}`}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        도록
                      </Link>
                    </Button>
                  )}
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
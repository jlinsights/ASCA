'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react'

// 전시 분류 타입 정의
type ExhibitionType = '개인전' | '공모전' | '회원전' | '추천작가전' | '초대작가전' | '온라인전시'

// 전시 데이터 타입
interface Exhibition {
  id: number
  title: string
  subtitle: string
  type: ExhibitionType
  venue: string
  startDate: string
  endDate: string
  image: string
  featured?: boolean
}

// 전시 분류별 색상 매핑
const getExhibitionTypeStyle = (type: ExhibitionType) => {
  const styles = {
    '개인전': { color: 'bg-celadon-green', label: '개인전' },
    '공모전': { color: 'bg-scholar-red', label: '공모전' },
    '회원전': { color: 'bg-temple-gold', label: '회원전' },
    '추천작가전': { color: 'bg-autumn-gold', label: '추천작가전' },
    '초대작가전': { color: 'bg-plum-blossom', label: '초대작가전' },
    '온라인전시': { color: 'bg-indigo-600', label: '온라인전시' }
  }
  return styles[type]
}

// Featured 전시 데이터 (실제로는 API에서 가져올 데이터)
const featuredExhibitions: Exhibition[] = [
  {
    id: 1,
    title: '2024 동양서예협회 정기전',
    subtitle: '전통과 현대의 만남',
    type: '회원전',
    venue: '서울시립미술관 본관',
    startDate: '2024-03-15',
    endDate: '2024-04-15',
    image: '/placeholder.svg',
    featured: true
  },
  {
    id: 2,
    title: '한글의 아름다움',
    subtitle: '세종대왕 탄신 626주년 기념전',
    type: '추천작가전',
    venue: '국립한글박물관 기획전시실',
    startDate: '2024-05-15',
    endDate: '2024-07-15',
    image: '/placeholder.svg',
    featured: true
  },
  {
    id: 3,
    title: '청년 서예가의 시선',
    subtitle: '새로운 세대, 새로운 해석',
    type: '공모전',
    venue: '인사동 갤러리',
    startDate: '2024-04-01',
    endDate: '2024-05-01',
    image: '/placeholder.svg',
    featured: true
  }
]

export function FeaturedExhibitionsSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-background via-rice-paper/30 to-background dark:via-stone-gray/10 overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/patterns/korean-pattern.png')] bg-repeat" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div
            className={`transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Badge className="mb-4 bg-celadon-green/10 text-celadon-green border-celadon-green/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured Exhibitions
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              주요 전시
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              동양서예협회가 엄선한 현재 진행 중인 주요 전시를 만나보세요
            </p>
          </div>
        </div>

        {/* Exhibition Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredExhibitions.map((exhibition, index) => (
            <div
              key={exhibition.id}
              className={`transition-all duration-1000 delay-${index * 200} ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Card className="group h-full overflow-hidden border-border/50 hover:border-celadon-green/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                {/* Exhibition Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={exhibition.image}
                    alt={exhibition.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getExhibitionTypeStyle(exhibition.type).color} text-rice-paper border-0`}>
                      {getExhibitionTypeStyle(exhibition.type).label}
                    </Badge>
                  </div>

                  {/* Featured Badge */}
                  {exhibition.featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-scholar-red text-rice-paper border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        추천
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Exhibition Info */}
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-celadon-green transition-colors">
                      {exhibition.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {exhibition.subtitle}
                    </p>
                  </div>

                  {/* Exhibition Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{exhibition.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{exhibition.startDate} ~ {exhibition.endDate}</span>
                    </div>
                  </div>

                  {/* View Details Link */}
                  <Link
                    href={`/exhibitions/${exhibition.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-celadon-green hover:text-scholar-red transition-colors group/link"
                  >
                    전시 상세보기
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div
          className={`text-center transition-all duration-1000 delay-600 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group h-14 px-8 text-lg border-2 border-celadon-green text-celadon-green hover:bg-celadon-green hover:text-rice-paper shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/exhibitions">
              모든 전시 둘러보기
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Bottom Decorative Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}

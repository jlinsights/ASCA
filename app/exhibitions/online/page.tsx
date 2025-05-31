'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Monitor, Play, Users, Eye, BookOpen } from 'lucide-react'
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

const onlineExhibitions = [
  {
    id: 8,
    title: '디지털 서예관',
    subtitle: '언제 어디서나 만나는 서예',
    description: '온라인으로 감상하는 동양서예협회 대표 작품들',
    type: '온라인전시' as ExhibitionType,
    viewers: 25000,
    artworks: 200,
    image: '/placeholder.svg?height=400&width=600',
    isInteractive: true,
    hasCatalog: true
  },
  {
    id: 9,
    title: 'VR 서예 체험관',
    subtitle: '가상현실로 체험하는 서예',
    description: '최신 VR 기술로 서예 창작 과정을 체험해보세요',
    type: '온라인전시' as ExhibitionType,
    viewers: 8500,
    artworks: 50,
    image: '/placeholder.svg?height=400&width=600',
    isInteractive: true,
    hasCatalog: false
  }
]

export default function OnlineExhibitionsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      <section className="bg-gradient-to-b from-purple-50 to-background dark:from-purple-950/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-purple-600 text-white">온라인 전시</Badge>
            <h1 className="text-4xl md:text-5xl font-normal mb-6">
              온라인 전시관
            </h1>
            <p className="text-lg text-muted-foreground">
              디지털 기술로 만나는 새로운 서예 경험
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {onlineExhibitions.map((exhibition) => (
            <Card key={exhibition.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative aspect-[9/16]">
                <Image
                  src={exhibition.image}
                  alt={exhibition.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-purple-600 text-white">
                    <Monitor className="w-3 h-3 mr-1" />
                    온라인
                  </Badge>
                  <Badge className={`${getExhibitionTypeStyle(exhibition.type).color} text-white`}>
                    {getExhibitionTypeStyle(exhibition.type).label}
                  </Badge>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link href={`/exhibitions/online/${exhibition.id}`}>
                    <Button size="lg" className="bg-white/90 text-black hover:bg-white">
                      <Play className="w-5 h-5 mr-2" />
                      전시 관람하기
                    </Button>
                  </Link>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-2">{exhibition.title}</h3>
                <p className="text-muted-foreground mb-4">{exhibition.subtitle}</p>
                <p className="text-sm text-muted-foreground mb-4">{exhibition.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{exhibition.viewers?.toLocaleString()} 관람</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{exhibition.artworks}점</span>
                    </div>
                  </div>
                  {exhibition.hasCatalog && (
                    <Link href={`/catalog/${exhibition.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <BookOpen className="w-4 h-4 mr-2" />
                        디지털 도록 보기
                      </Button>
                    </Link>
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
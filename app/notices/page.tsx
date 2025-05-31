'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  Share2,
  Eye,
  Calendar,
  User,
  Pin,
  TrendingUp,
  Bell,
  Image as ImageIcon,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// 샘플 공지사항 데이터
const sampleNotices = [
  {
    id: '1',
    title: '제23회 대한민국 동양서예대전 개최 안내',
    content: '2024년도 제23회 대한민국 동양서예대전을 개최합니다. 많은 관심과 참여 부탁드립니다.',
    author: '동양서예협회',
    date: '2024-01-15',
    image: '/api/placeholder/400/400',
    category: '공모전',
    isPinned: true,
    views: 1245,
    likes: 89,
    comments: 23,
    tags: ['공모전', '서예대전', '출품안내']
  },
  {
    id: '2',
    title: '2024년 신년 서예 강좌 수강생 모집',
    content: '새해를 맞아 초보자부터 전문가까지 다양한 수준의 서예 강좌를 개설합니다.',
    author: '교육부',
    date: '2024-01-10',
    image: '/api/placeholder/400/400',
    category: '교육',
    isPinned: false,
    views: 892,
    likes: 67,
    comments: 15,
    tags: ['교육', '강좌', '모집']
  },
  {
    id: '3',
    title: '한중일 동양서예 초대작가전 작품 전시',
    content: '국제 교류의 일환으로 한국, 중국, 일본 3개국 초대작가들의 작품을 전시합니다.',
    author: '국제교류부',
    date: '2024-01-08',
    image: '/api/placeholder/400/400',
    category: '전시',
    isPinned: false,
    views: 673,
    likes: 45,
    comments: 8,
    tags: ['전시', '국제교류', '초대작가']
  },
  {
    id: '4',
    title: '협회 회원 정기총회 개최 공지',
    content: '2024년도 정기총회를 개최하오니 회원 여러분의 많은 참석 부탁드립니다.',
    author: '사무국',
    date: '2024-01-05',
    image: '/api/placeholder/400/400',
    category: '공지',
    isPinned: false,
    views: 456,
    likes: 34,
    comments: 12,
    tags: ['총회', '회원', '정기모임']
  },
  {
    id: '5',
    title: '서예 작품 온라인 전시관 오픈',
    content: '디지털 시대에 맞춰 온라인으로도 서예 작품을 감상할 수 있는 전시관을 오픈했습니다.',
    author: '디지털팀',
    date: '2024-01-03',
    image: '/api/placeholder/400/400',
    category: '서비스',
    isPinned: false,
    views: 789,
    likes: 123,
    comments: 34,
    tags: ['온라인', '전시관', '디지털']
  },
  {
    id: '6',
    title: '젊은 서예가를 위한 멘토링 프로그램',
    content: '차세대 서예가 양성을 위한 멘토-멘티 프로그램을 시작합니다.',
    author: '청년작가부',
    date: '2024-01-01',
    image: '/api/placeholder/400/400',
    category: '프로그램',
    isPinned: false,
    views: 345,
    likes: 56,
    comments: 19,
    tags: ['멘토링', '청년', '프로그램']
  }
]

const categories = ['전체', '공모전', '교육', '전시', '공지', '서비스', '프로그램']

export default function NoticesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredNotices = sampleNotices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '전체' || notice.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const pinnedNotices = filteredNotices.filter(notice => notice.isPinned)
  const regularNotices = filteredNotices.filter(notice => !notice.isPinned)

  const NoticeCard = ({ notice, featured = false }: { notice: any, featured?: boolean }) => (
    <Link href={`/notices/${notice.id}`}>
      <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        featured ? 'border-scholar-red/30 bg-gradient-to-br from-scholar-red/5 to-transparent' : ''
      }`}>
        <CardContent className="p-0">
          {/* 이미지 섹션 */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <Image
              src={notice.image}
              alt={notice.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* 카테고리 뱃지 */}
            <div className="absolute top-3 left-3">
              <Badge 
                variant={notice.isPinned ? "destructive" : "secondary"}
                className="text-xs font-medium"
              >
                {notice.isPinned && <Pin className="h-3 w-3 mr-1" />}
                {notice.category}
              </Badge>
            </div>

            {/* 인터랙션 오버레이 */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                <Eye className="h-3 w-3" />
                {notice.views}
              </div>
            </div>
          </div>

          {/* 콘텐츠 섹션 */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-scholar-red transition-colors">
                {notice.title}
              </h3>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-scholar-red transition-colors flex-shrink-0" />
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {notice.content}
            </p>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>{notice.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{notice.date}</span>
              </div>
            </div>

            {/* 인터랙션 바 */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                  <Heart className="h-3 w-3" />
                  {notice.likes}
                </button>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-blue-500 transition-colors">
                  <MessageCircle className="h-3 w-3" />
                  {notice.comments}
                </button>
              </div>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-green-500 transition-colors">
                <Share2 className="h-3 w-3" />
                공유
              </button>
            </div>

            {/* 태그 */}
            <div className="flex flex-wrap gap-1">
              {notice.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-scholar-red/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Bell className="h-8 w-8 md:h-10 md:w-10 text-scholar-red" />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              공지사항
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            동양서예협회의 최신 소식과 중요한 공지사항을 확인하세요
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="outline" className="text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              실시간 업데이트
            </Badge>
            <Badge variant="outline" className="text-sm">
              <MessageCircle className="h-3 w-3 mr-1" />
              인터랙티브
            </Badge>
            <Badge variant="outline" className="text-sm">
              <ImageIcon className="h-3 w-3 mr-1" />
              비주얼 콘텐츠
            </Badge>
          </div>
        </div>
      </section>

      {/* 검색 및 필터 */}
      <section className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* 검색 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="공지사항 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* 뷰 모드 토글 */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                그리드
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                리스트
              </Button>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* 공지사항 목록 */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* 고정 공지사항 */}
          {pinnedNotices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pin className="h-5 w-5 text-scholar-red" />
                <h2 className="text-xl font-bold">중요 공지</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pinnedNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} featured />
                ))}
              </div>
            </div>
          )}

          {/* 일반 공지사항 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">전체 공지사항</h2>
              <span className="text-sm text-muted-foreground">
                총 {regularNotices.length}개
              </span>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {regularNotices.map((notice) => (
                  <Link key={notice.id} href={`/notices/${notice.id}`}>
                    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={notice.image}
                              alt={notice.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold group-hover:text-scholar-red transition-colors line-clamp-1">
                                {notice.title}
                              </h3>
                              <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                                {notice.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notice.content}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span>{notice.author}</span>
                                <span>{notice.date}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {notice.views}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {notice.likes}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {notice.comments}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 로드 더 버튼 */}
          <div className="text-center pt-8">
            <Button variant="outline" size="lg" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              더 많은 공지사항 보기
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 
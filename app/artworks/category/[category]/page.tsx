'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TranslatedContent } from '@/components/translated-content'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Heart, Eye, Filter, SlidersHorizontal, ArrowLeft } from 'lucide-react'

// 카테고리 정보
const categoryInfo = {
  calligraphy: {
    title: '서예',
    titleEn: 'Calligraphy',
    description: '正法의 계승과 創新의 조화로 탄생한 한국, 중국, 일본의 서예 작품을 만나보세요',
    descriptionEn: 'Discover Korean, Chinese, and Japanese calligraphy works spanning tradition and modernity'
  },
  painting: {
    title: '회화',
    titleEn: 'Painting',
    description: '산수화부터 현대 동양화까지, 다채로운 회화 작품들을 감상하세요',
    descriptionEn: 'Appreciate diverse paintings from traditional landscapes to contemporary oriental art'
  },
  sculpture: {
    title: '조각',
    titleEn: 'Sculpture',
    description: '동양의 정신성을 담은 입체 예술 작품들을 경험하세요',
    descriptionEn: 'Experience three-dimensional artworks embodying Oriental spirituality'
  },
  'mixed-media': {
    title: '혼합매체',
    titleEn: 'Mixed Media',
    description: '正法의 계승과 創新의 기법이 만나는 실험적 작품들을 만나보세요',
    descriptionEn: 'Discover experimental works where traditional and modern techniques converge'
  }
}

interface Artwork {
  id: string
  title: string
  artist: string
  category: 'calligraphy' | 'painting' | 'sculpture' | 'mixed-media'
  style: 'traditional' | 'contemporary' | 'modern'
  medium: string
  dimensions: string
  year: number
  price: number
  currency: string
  description: string
  imageUrl: string
  images: string[]
  isAvailable: boolean
  isFeatured: boolean
  tags: string[]
  views: number
  likes: number
}

// 확장된 샘플 데이터
const sampleArtworks: Artwork[] = [
  {
    id: '1',
    title: '산수화 - 봄의 선율',
    artist: '김한수',
    category: 'painting',
    style: 'traditional',
    medium: '종이에 수묵',
    dimensions: '60 × 80 cm',
    year: 2023,
    price: 1200000,
    currency: 'KRW',
    description: '전통 산수화 기법으로 표현한 봄의 아름다운 풍경',
    imageUrl: '/placeholder.svg',
    images: ['/placeholder.svg'],
    isAvailable: true,
    isFeatured: true,
    tags: ['봄', '산수', '전통'],
    views: 156,
    likes: 23
  },
  {
    id: '2',
    title: '서예 - 묵향',
    artist: '이정화',
    category: 'calligraphy',
    style: 'contemporary',
    medium: '한지에 먹',
    dimensions: '45 × 65 cm',
    year: 2024,
    price: 800000,
    currency: 'KRW',
    description: '현대적 감각으로 재해석한 전통 서예 작품',
    imageUrl: '/placeholder.svg',
    images: ['/placeholder.svg'],
    isAvailable: true,
    isFeatured: false,
    tags: ['서예', '현대', '먹향'],
    views: 89,
    likes: 12
  },
  {
    id: '3',
    title: '조각 - 영원의 순간',
    artist: '박철민',
    category: 'sculpture',
    style: 'modern',
    medium: '청동',
    dimensions: '120 × 80 × 60 cm',
    year: 2023,
    price: 3500000,
    currency: 'KRW',
    description: '동양의 정신성을 현대적 조형언어로 표현한 작품',
    imageUrl: '/placeholder.svg',
    images: ['/placeholder.svg'],
    isAvailable: false,
    isFeatured: true,
    tags: ['조각', '청동', '현대'],
    views: 234,
    likes: 45
  },
  {
    id: '4',
    title: '혼합매체 - 시간의 층',
    artist: '최영미',
    category: 'mixed-media',
    style: 'contemporary',
    medium: '한지, 먹, 디지털 프린트',
    dimensions: '100 × 150 cm',
    year: 2024,
    price: 2200000,
    currency: 'KRW',
          description: '正法의 계승과 創新의 조화를 보여주는 실험적 작품',
    imageUrl: '/placeholder.svg',
    images: ['/placeholder.svg'],
    isAvailable: true,
    isFeatured: false,
    tags: ['혼합매체', '실험', '전통'],
    views: 123,
    likes: 18
  },
  {
    id: '5',
    title: '서예 - 정중동',
    artist: '한영수',
    category: 'calligraphy',
    style: 'traditional',
    medium: '선지에 먹',
    dimensions: '70 × 140 cm',
    year: 2023,
    price: 1500000,
    currency: 'KRW',
    description: '정중동(靜中動)의 철학을 담은 전통 서예',
    imageUrl: '/placeholder.svg',
    images: ['/placeholder.svg'],
    isAvailable: true,
    isFeatured: true,
    tags: ['서예', '전통', '철학'],
    views: 203,
    likes: 31
  },
  {
    id: '6',
    title: '민화 - 모란도',
    artist: '송미경',
    category: 'painting',
    style: 'traditional',
    medium: '견본채색',
    dimensions: '50 × 70 cm',
    year: 2024,
    price: 900000,
    currency: 'KRW',
    description: '화려한 모란꽃을 전통 민화 기법으로 그린 작품',
    imageUrl: '/placeholder.svg',
    images: ['/placeholder.svg'],
    isAvailable: true,
    isFeatured: false,
    tags: ['민화', '모란', '전통'],
    views: 145,
    likes: 19
  }
]

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  const [selectedStyle, setSelectedStyle] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('sortFeatured')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // 카테고리 정보 가져오기
  const currentCategory = categoryInfo[category as keyof typeof categoryInfo]

  // 카테고리별 작품 필터링
  const categoryArtworks = useMemo(() => {
    let filtered = sampleArtworks.filter(artwork => {
      if (category === 'all') return true
      return artwork.category === category
    })

    // 스타일 필터
    if (selectedStyle !== 'all') {
      filtered = filtered.filter(artwork => artwork.style === selectedStyle)
    }

    // 구매 가능 필터
    if (showAvailableOnly) {
      filtered = filtered.filter(artwork => artwork.isAvailable)
    }

    // 정렬
    switch (sortBy) {
      case 'sortFeatured':
        return filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
      case 'newest':
        return filtered.sort((a, b) => b.year - a.year)
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price)
      case 'popular':
        return filtered.sort((a, b) => b.views - a.views)
      default:
        return filtered
    }
  }, [category, selectedStyle, sortBy, showAvailableOnly])

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`
    }
    return `$${price.toLocaleString()}`
  }

  if (!currentCategory) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-xl md:text-2xl font-semibold mb-4">카테고리를 찾을 수 없습니다</h1>
          <Link href="/artworks">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              작품 목록으로 돌아가기
            </Button>
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rice-paper to-background dark:from-ink-black dark:to-background">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="text-center space-y-4 md:space-y-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Link href="/artworks" className="hover:text-foreground transition-colors">작품</Link>
              <span>/</span>
              <span className="text-foreground">{currentCategory.title}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-tight">
              {currentCategory.title}
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {currentCategory.description}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm text-muted-foreground">
              <span>총 {categoryArtworks.length}개 작품</span>
              <span className="hidden sm:inline">•</span>
              <span>{categoryArtworks.filter(art => art.isAvailable).length}개 구매가능</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Mobile Filter Toggle */}
          <div className="flex items-center justify-between md:hidden mb-4">
            <div className="flex items-center gap-3">
              <Link href="/artworks">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  목록
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                필터 {showFilters ? '닫기' : '열기'}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {categoryArtworks.length}개
            </div>
          </div>

          {/* Desktop back link */}
          <div className="hidden md:block mb-4">
            <Link href="/artworks">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                전체 작품 보기
              </Button>
            </Link>
          </div>

          {/* Filter Controls */}
          <div className={`${showFilters ? 'block' : 'hidden md:flex'} flex-col md:flex-row md:items-center md:justify-between gap-4`}>
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <span className="text-sm font-medium hidden md:inline">필터:</span>
              
              <div className="grid grid-cols-2 md:flex gap-3">
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="스타일" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="traditional">전통</SelectItem>
                    <SelectItem value="contemporary">현대</SelectItem>
                    <SelectItem value="modern">모던</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showAvailableOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                  className="flex items-center gap-2 h-10"
                >
                  <Filter className="h-4 w-4" />
                  구매가능
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <span className="text-sm font-medium hidden md:inline">정렬:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 w-full md:w-[120px]">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sortFeatured">추천순</SelectItem>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="popular">인기순</SelectItem>
                  <SelectItem value="price-low">가격낮은순</SelectItem>
                  <SelectItem value="price-high">가격높은순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Artworks Grid */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        {categoryArtworks.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <p className="text-muted-foreground text-base md:text-lg mb-4">해당 조건에 맞는 작품이 없습니다.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStyle('all')
                setShowAvailableOnly(false)
              }}
            >
              필터 초기화
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {categoryArtworks.map((artwork) => (
              <Card key={artwork.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                <Link href={`/artworks/${artwork.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Badges */}
                    <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1 md:gap-2">
                      {artwork.isFeatured && (
                        <Badge className="bg-scholar-red text-white text-xs">추천</Badge>
                      )}
                      {!artwork.isAvailable && (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">판매완료</Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 flex gap-2 md:gap-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {artwork.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {artwork.likes}
                      </span>
                    </div>
                  </div>
                </Link>

                <CardContent className="p-3 md:p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-1 text-foreground">
                          {artwork.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {artwork.artist}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="line-clamp-1">{artwork.medium}</span>
                      <span>{artwork.year}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-wrap">
                      {artwork.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-3 md:px-4 pb-3 md:pb-4 pt-0">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-sm">
                      {formatPrice(artwork.price, artwork.currency)}
                    </span>
                    <Button
                      size="sm"
                      variant={artwork.isAvailable ? "default" : "outline"}
                      disabled={!artwork.isAvailable}
                      className="text-xs px-3 py-1 h-auto"
                    >
                      {artwork.isAvailable ? '문의하기' : '판매완료'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Category Navigation */}
      <section className="bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-center">다른 카테고리 둘러보기</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {Object.entries(categoryInfo).map(([key, info]) => (
              <Link
                key={key}
                href={`/artworks/category/${key}`}
                className={`p-3 md:p-4 text-center rounded-lg border transition-all hover:shadow-md ${
                  key === category ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                }`}
              >
                <h3 className="font-medium text-sm">{info.title}</h3>
                <p className="text-xs opacity-80 mt-1">{info.titleEn}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 
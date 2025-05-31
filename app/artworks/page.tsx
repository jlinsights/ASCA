'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TranslatedContent } from '@/components/translated-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Search, Filter, Heart, Eye, SlidersHorizontal, ArrowUpDown, Download, Grid2X2, ShoppingCart, Calendar } from 'lucide-react'
import { ImageViewer } from '@/components/image-viewer'
import { ArtworkImage } from '@/components/adaptive-image'
import { Toaster } from '@/components/ui/toaster'

// 작품 데이터 타입 정의
interface Artwork {
  id: string
  title: string
  titleEn: string
  titleJa: string
  titleZh: string
  artist: string
  artistEn: string
  artistJa: string
  artistZh: string
  category: 'calligraphy' | 'painting' | 'sculpture' | 'mixed-media'
  style: 'traditional' | 'contemporary' | 'modern'
  medium: string
  mediumEn: string
  dimensions: string
  year: number
  price: number
  currency: string
  description: string
  descriptionEn: string
  descriptionJa: string
  descriptionZh: string
  imageUrl: string
  images: string[]
  isAvailable: boolean
  isFeatured: boolean
  tags: string[]
  views: number
  likes: number
  paperSize?: 'ban-jeol' | 'jeon-ji' | 'guk-jeon-ji'
  collectionStatus?: 'available' | 'artist-collection' | 'private-collection' | 'exhibition' | 'sold' | 'reserved'
  collectionOwner?: string
  showPrice?: boolean
  isRentable?: boolean
  rentalPrice?: number
  rentalPeriod?: string
  showRentalPrice?: boolean
}

// 샘플 작품 데이터
const sampleArtworks: Artwork[] = [
  {
    id: '1',
    title: '산수화 - 봄의 선율',
    titleEn: 'Landscape - Spring Melody',
    titleJa: '山水画 - 春のメロディー',
    titleZh: '山水画 - 春天的旋律',
    artist: '김한수',
    artistEn: 'Kim Han-su',
    artistJa: 'キム・ハンス',
    artistZh: '金汉水',
    category: 'painting',
    style: 'traditional',
    medium: '종이에 수묵',
    mediumEn: 'Ink on Paper',
    dimensions: '60 × 80 cm',
    year: 2023,
    price: 1200000,
    currency: 'KRW',
    description: '전통 산수화 기법으로 표현한 봄의 아름다운 풍경',
    descriptionEn: 'Beautiful spring landscape expressed with traditional landscape painting techniques',
    descriptionJa: '伝統的な山水画技法で表現した春の美しい風景',
    descriptionZh: '用传统山水画技法表现的春天美丽风景',
    imageUrl: '/placeholder.svg?height=400&width=300',
    images: ['/placeholder.svg?height=600&width=400', '/placeholder.svg?height=400&width=600'],
    isAvailable: false,
    isFeatured: true,
    tags: ['봄', '산수', '전통'],
    views: 156,
    likes: 23,
    collectionStatus: 'artist-collection',
    collectionOwner: '작가 소장',
    showPrice: false,
    isRentable: true,
    rentalPrice: 200000,
    rentalPeriod: '1개월',
    showRentalPrice: false
  },
  {
    id: '2',
    title: '서예 - 묵향',
    titleEn: 'Calligraphy - Ink Fragrance',
    titleJa: '書道 - 墨香',
    titleZh: '书法 - 墨香',
    artist: '이정화',
    artistEn: 'Lee Jung-hwa',
    artistJa: 'イ・ジョンファ',
    artistZh: '李静华',
    category: 'calligraphy',
    style: 'contemporary',
    medium: '한지에 먹',
    mediumEn: 'Ink on Hanji',
    dimensions: '35 × 135 cm (반절지)',
    year: 2024,
    price: 800000,
    currency: 'KRW',
    description: '현대적 감각으로 재해석한 전통 서예 작품, 반절지에 깊이 있는 묵향을 담았습니다.',
    descriptionEn: 'Traditional calligraphy reinterpreted with modern sensibility on ban-jeol paper',
    descriptionJa: '現代的感覚で再解釈した伝統書道作品、半切紙に深い墨香を込めました',
    descriptionZh: '用现代感觉重新诠释的传统书法作品，在半切纸上蕴含深邃墨香',
    imageUrl: '/placeholder.svg?height=540&width=140',
    images: ['/placeholder.svg?height=1080&width=280'],
    isAvailable: true,
    isFeatured: false,
    tags: ['서예', '현대', '먹향', '반절지'],
    views: 89,
    likes: 12,
    paperSize: 'ban-jeol',
    collectionStatus: 'available',
    isRentable: true,
    rentalPrice: 150000,
    rentalPeriod: '1개월',
    showRentalPrice: true
  },
  {
    id: '3',
    title: '조각 - 영원의 순간',
    titleEn: 'Sculpture - Moment of Eternity',
    titleJa: '彫刻 - 永遠の瞬間',
    titleZh: '雕塑 - 永恒的瞬间',
    artist: '박철민',
    artistEn: 'Park Cheol-min',
    artistJa: 'パク・チョルミン',
    artistZh: '朴哲民',
    category: 'sculpture',
    style: 'modern',
    medium: '청동',
    mediumEn: 'Bronze',
    dimensions: '120 × 80 × 60 cm',
    year: 2023,
    price: 3500000,
    currency: 'KRW',
    description: '동양의 정신성을 현대적 조형언어로 표현한 작품',
    descriptionEn: 'Work expressing Oriental spirituality in modern sculptural language',
    descriptionJa: '東洋の精神性を現代的造形言語で表現した作品',
    descriptionZh: '用现代造型语言表现东方精神性的作品',
    imageUrl: '/placeholder.svg?height=400&width=300',
    images: ['/placeholder.svg?height=600&width=400', '/placeholder.svg?height=400&width=600'],
    isAvailable: false,
    isFeatured: true,
    tags: ['조각', '청동', '현대'],
    views: 234,
    likes: 45,
    collectionStatus: 'private-collection',
    collectionOwner: '개인 소장',
    showPrice: false
  },
  {
    id: '4',
    title: '혼합매체 - 시간의 층',
    titleEn: 'Mixed Media - Layers of Time',
    titleJa: 'ミクストメディア - 時の層',
    titleZh: '混合媒体 - 时间的层次',
    artist: '최영미',
    artistEn: 'Choi Young-mi',
    artistJa: 'チェ・ヨンミ',
    artistZh: '崔英美',
    category: 'mixed-media',
    style: 'contemporary',
    medium: '한지, 먹, 디지털 프린트',
    mediumEn: 'Hanji, Ink, Digital Print',
    dimensions: '100 × 150 cm',
    year: 2024,
    price: 2200000,
    currency: 'KRW',
    description: '正法의 계승과 創新의 조화를 보여주는 실험적 작품',
    descriptionEn: 'Experimental work bridging tradition and modernity',
    descriptionJa: '伝統と現代を包括する実験的作品',
    descriptionZh: '融合传统与现代的实验性作品',
    imageUrl: '/placeholder.svg?height=400&width=300',
    images: ['/placeholder.svg?height=600&width=400'],
    isAvailable: false,
    isFeatured: false,
    tags: ['혼합매체', '실험', '전통'],
    views: 123,
    likes: 18,
    collectionStatus: 'exhibition',
    collectionOwner: '전시 중',
    showPrice: false
  },
  {
    id: '5',
    title: '서예 - 천자문',
    titleEn: 'Calligraphy - Thousand Character Classic',
    titleJa: '書道 - 千字文',
    titleZh: '书法 - 千字文',
    artist: '정승호',
    artistEn: 'Jung Seung-ho',
    artistJa: 'チョン・スンホ',
    artistZh: '郑承浩',
    category: 'calligraphy',
    style: 'traditional',
    medium: '한지에 먹',
    mediumEn: 'Ink on Hanji',
    dimensions: '70 × 135 cm (전지)',
    year: 2023,
    price: 1500000,
    currency: 'KRW',
    description: '전통 천자문을 해서체로 정성스럽게 쓴 전지 작품입니다. 붓의 강약과 먹의 농담이 조화롭게 어우러져 있습니다.',
    descriptionEn: 'Traditional Thousand Character Classic written in regular script on full-size paper',
    descriptionJa: '伝統的な千字文を楷書体で丁寧に書いた全紙作品です',
    descriptionZh: '用楷书认真书写的传统千字文全纸作品',
    imageUrl: '/placeholder.svg?height=540&width=280',
    images: ['/placeholder.svg?height=1080&width=560'],
    isAvailable: true,
    isFeatured: true,
    tags: ['서예', '천자문', '해서', '전지', '전통'],
    views: 267,
    likes: 38,
    paperSize: 'jeon-ji',
    collectionStatus: 'available',
    isRentable: true,
    rentalPrice: 250000,
    rentalPeriod: '1개월',
    showRentalPrice: true
  },
  {
    id: '6',
    title: '서예 - 시서화',
    titleEn: 'Calligraphy - Poetry, Calligraphy and Painting',
    titleJa: '書道 - 詩書画',
    titleZh: '书法 - 诗书画',
    artist: '송미경',
    artistEn: 'Song Mi-kyung',
    artistJa: 'ソン・ミギョン',
    artistZh: '宋美景',
    category: 'calligraphy',
    style: 'contemporary',
    medium: '한지에 먹, 담채',
    mediumEn: 'Ink and Light Colors on Hanji',
    dimensions: '70 × 200 cm (국전지)',
    year: 2024,
    price: 2800000,
    currency: 'KRW',
    description: '시와 서예, 그림이 하나로 어우러진 국전지 대작입니다. 이백의 시를 행서로 쓰고 간결한 매화를 곁들였습니다.',
    descriptionEn: 'Large-scale work on national exhibition paper combining poetry, calligraphy and painting',
    descriptionJa: '詩と書道、絵画が一つに調和した国展紙の大作です',
    descriptionZh: '诗、书、画合一的国展纸大作',
    imageUrl: '/placeholder.svg?height=600&width=210',
    images: ['/placeholder.svg?height=1200&width=420'],
    isAvailable: false,
    isFeatured: true,
    tags: ['서예', '시서화', '행서', '국전지', '이백'],
    views: 345,
    likes: 52,
    paperSize: 'guk-jeon-ji',
    collectionStatus: 'artist-collection',
    collectionOwner: '작가 소장',
    showPrice: false
  },
  {
    id: '7',
    title: '서예 - 불경사경',
    titleEn: 'Calligraphy - Buddhist Sutra Copying',
    titleJa: '書道 - 仏経写経',
    titleZh: '书法 - 佛经抄写',
    artist: '법운',
    artistEn: 'Beopun',
    artistJa: '法雲',
    artistZh: '法云',
    category: 'calligraphy',
    style: 'traditional',
    medium: '한지에 먹',
    mediumEn: 'Ink on Hanji',
    dimensions: '35 × 135 cm (반절지)',
    year: 2023,
    price: 1200000,
    currency: 'KRW',
    description: '정성스럽게 쓴 반야심경 사경 작품입니다. 단아한 소해서체로 마음의 평온함이 느껴집니다.',
    descriptionEn: 'Devotionally written Heart Sutra copying work in small regular script',
    descriptionJa: '丁寧に書かれた般若心経写経作品です',
    descriptionZh: '虔诚书写的般若心经抄经作品',
    imageUrl: '/placeholder.svg?height=540&width=140',
    images: ['/placeholder.svg?height=1080&width=280'],
    isAvailable: false,
    isFeatured: false,
    tags: ['서예', '사경', '반야심경', '반절지', '소해서'],
    views: 198,
    likes: 31,
    paperSize: 'ban-jeol',
    collectionStatus: 'private-collection',
    collectionOwner: '사찰 소장'
  },
  {
    id: '8',
    title: '서예 - 추사체 명구',
    titleEn: 'Calligraphy - Chusa Style Famous Phrase',
    titleJa: '書道 - 秋史体名句',
    titleZh: '书法 - 秋史体名句',
    artist: '김서현',
    artistEn: 'Kim Seo-hyun',
    artistJa: 'キム・ソヒョン',
    artistZh: '金书贤',
    category: 'calligraphy',
    style: 'traditional',
    medium: '한지에 먹',
    mediumEn: 'Ink on Hanji',
    dimensions: '70 × 135 cm (전지)',
    year: 2024,
    price: 1800000,
    currency: 'KRW',
    description: '추사 김정희의 서체를 현대적으로 재해석한 전지 작품입니다. "학은즉진(學則盡)"이라는 명구를 힘차게 표현했습니다.',
    descriptionEn: 'Modern reinterpretation of Chusa Kim Jeong-hui\'s calligraphy style on full paper',
    descriptionJa: '秋史金正喜の書体を現代的に再解釈した全紙作品です',
    descriptionZh: '现代重新诠释秋史金正喜书体的全纸作品',
    imageUrl: '/placeholder.svg?height=540&width=280',
    images: ['/placeholder.svg?height=1080&width=560'],
    isAvailable: false,
    isFeatured: false,
    tags: ['서예', '추사체', '김정희', '전지', '학은즉진'],
    views: 156,
    likes: 22,
    paperSize: 'jeon-ji',
    collectionStatus: 'reserved',
    collectionOwner: '예약됨'
  }
]

function ArtworksContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStyle, setSelectedStyle] = useState<string>('all')
  const [selectedPaperSize, setSelectedPaperSize] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('sortFeatured')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // 필터링 및 검색 로직
  const filteredArtworks = useMemo(() => {
    let filtered = sampleArtworks.filter(artwork => {
      const matchesSearch = searchTerm === '' || 
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || artwork.category === selectedCategory
      const matchesStyle = selectedStyle === 'all' || artwork.style === selectedStyle
      const matchesPaperSize = selectedPaperSize === 'all' || artwork.paperSize === selectedPaperSize
      const matchesAvailability = !showAvailableOnly || artwork.isAvailable

      return matchesSearch && matchesCategory && matchesStyle && matchesPaperSize && matchesAvailability
    })

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
  }, [searchTerm, selectedCategory, selectedStyle, selectedPaperSize, sortBy, showAvailableOnly])

  // 서예 작품인지 확인하여 적절한 이미지 비율 반환
  const getImageAspectRatio = (artwork: Artwork) => {
    if (artwork.category === 'calligraphy') {
      // 서예 작품은 세로가 긴 비율 사용
      if (artwork.paperSize === 'ban-jeol') return 'aspect-[35/135]' // 반절지 비율
      if (artwork.paperSize === 'jeon-ji') return 'aspect-[70/135]' // 전지 비율  
      if (artwork.paperSize === 'guk-jeon-ji') return 'aspect-[70/200]' // 국전지 비율
      return 'aspect-[1/4]' // 기본 세로형 비율
    }
    return 'aspect-[3/4]' // 기존 회화/조각 비율
  }

  // 소장 상태에 따른 세련된 표시 텍스트와 스타일 반환
  const getCollectionStatusInfo = (artwork: Artwork) => {
    // 구매 가능한 작품
    if (artwork.isAvailable) {
      const hasRental = artwork.isRentable
      const hasPurchase = true
      
      if (hasRental && hasPurchase) {
        return {
          text: '구매/대여 가능',
          subText: '문의하기',
          className: 'text-emerald-600 dark:text-emerald-400',
          bgClassName: 'bg-emerald-50 dark:bg-emerald-950/30'
        }
      } else if (hasRental) {
        return {
          text: '대여 가능',
          subText: '대여 문의',
          className: 'text-blue-600 dark:text-blue-400',
          bgClassName: 'bg-blue-50 dark:bg-blue-950/30'
        }
      } else {
        return {
          text: '구매 가능',
          subText: artwork.showPrice === false ? '가격 문의' : '문의하기',
          className: 'text-emerald-600 dark:text-emerald-400',
          bgClassName: 'bg-emerald-50 dark:bg-emerald-950/30'
        }
      }
    }

    // 구매 불가능하지만 대여 가능한 작품
    if (!artwork.isAvailable && artwork.isRentable) {
      switch (artwork.collectionStatus) {
        case 'artist-collection':
          return {
            text: '작가 소장',
            subText: '대여 문의',
            className: 'text-amber-600 dark:text-amber-400',
            bgClassName: 'bg-amber-50 dark:bg-amber-950/30'
          }
        case 'private-collection':
          return {
            text: artwork.collectionOwner || '개인 소장',
            subText: '대여 문의',
            className: 'text-blue-600 dark:text-blue-400',
            bgClassName: 'bg-blue-50 dark:bg-blue-950/30'
          }
        default:
          return {
            text: '대여 가능',
            subText: '대여 문의',
            className: 'text-blue-600 dark:text-blue-400',
            bgClassName: 'bg-blue-50 dark:bg-blue-950/30'
          }
      }
    }

    // 구매/대여 모두 불가능한 작품
    switch (artwork.collectionStatus) {
      case 'artist-collection':
        return {
          text: '작가 소장',
          subText: '감상전용',
          className: 'text-amber-600 dark:text-amber-400',
          bgClassName: 'bg-amber-50 dark:bg-amber-950/30'
        }
      case 'private-collection':
        return {
          text: artwork.collectionOwner || '개인 소장',
          subText: '비매품',
          className: 'text-slate-600 dark:text-slate-400',
          bgClassName: 'bg-slate-50 dark:bg-slate-950/30'
        }
      case 'exhibition':
        return {
          text: '전시 중',
          subText: '전시종료 후 문의',
          className: 'text-blue-600 dark:text-blue-400',
          bgClassName: 'bg-blue-50 dark:bg-blue-950/30'
        }
      case 'reserved':
        return {
          text: '예약됨',
          subText: '대기가능',
          className: 'text-orange-600 dark:text-orange-400',
          bgClassName: 'bg-orange-50 dark:bg-orange-950/30'
        }
      case 'sold':
        return {
          text: '판매완료',
          subText: '소장됨',
          className: 'text-red-600 dark:text-red-400',
          bgClassName: 'bg-red-50 dark:bg-red-950/30'
        }
      default:
        return {
          text: '비매품',
          subText: '감상전용',
          className: 'text-muted-foreground',
          bgClassName: 'bg-muted/50'
        }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            <TranslatedContent textKey="artCollection" />
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            <TranslatedContent textKey="artworksDescription" />
          </p>
          <p className="text-sm text-muted-foreground">
            총 {filteredArtworks.length}개의 작품이 있습니다
          </p>
        </div>
      </section>

      {/* PC Layout */}
      <div className="hidden lg:block">
        {/* PC Search and Filters */}
        <section className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="작품명, 작가명, 태그로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="calligraphy">서예</SelectItem>
                    <SelectItem value="painting">회화</SelectItem>
                    <SelectItem value="sculpture">조각</SelectItem>
                    <SelectItem value="mixed-media">혼합매체</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="스타일" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="traditional">전통</SelectItem>
                    <SelectItem value="contemporary">현대</SelectItem>
                    <SelectItem value="modern">모던</SelectItem>
                  </SelectContent>
                </Select>

                {/* 서예 종이 규격 필터 추가 */}
                {selectedCategory === 'calligraphy' && (
                  <Select value={selectedPaperSize} onValueChange={setSelectedPaperSize}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="종이 규격" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 규격</SelectItem>
                      <SelectItem value="ban-jeol">반절지 (35×135)</SelectItem>
                      <SelectItem value="jeon-ji">전지 (70×135)</SelectItem>
                      <SelectItem value="guk-jeon-ji">국전지 (70×200)</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
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

                {/* Available Only Filter */}
                <Button
                  variant={showAvailableOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  구매가능
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* PC Artworks Grid */}
        <section className="container mx-auto px-4 py-8">
          {filteredArtworks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">검색 조건에 맞는 작품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtworks.map((artwork) => (
                <Card key={artwork.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className={`relative overflow-hidden ${getImageAspectRatio(artwork)}`}>
                    <ImageViewer
                      images={artwork.images}
                      title={artwork.title}
                      artist={artwork.artist}
                      description={artwork.description}
                      allowDownload={artwork.category === 'calligraphy'} // 서예 작품만 다운로드 허용
                    >
                      <ArtworkImage
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        variant="card"
                        className="cursor-pointer transition-transform duration-300 group-hover:scale-105"
                        fill
                      />
                    </ImageViewer>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {artwork.isFeatured && (
                        <Badge className="bg-scholar-red text-white">추천</Badge>
                      )}
                      {!artwork.isAvailable && (
                        <Badge variant="secondary" className={`text-xs ${getCollectionStatusInfo(artwork).bgClassName} ${getCollectionStatusInfo(artwork).className} border-0`}>
                          {getCollectionStatusInfo(artwork).text}
                        </Badge>
                      )}
                      {/* 서예 작품 종이 규격 표시 */}
                      {artwork.category === 'calligraphy' && artwork.paperSize && (
                        <Badge variant="outline" className="text-xs">
                          {artwork.paperSize === 'ban-jeol' && '반절지'}
                          {artwork.paperSize === 'jeon-ji' && '전지'}
                          {artwork.paperSize === 'guk-jeon-ji' && '국전지'}
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="absolute bottom-3 right-3 flex gap-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="flex items-center gap-1 bg-black/50 rounded px-2 py-1">
                        <Eye className="h-3 w-3" />
                        {artwork.views}
                      </span>
                      <span className="flex items-center gap-1 bg-black/50 rounded px-2 py-1">
                        <Heart className="h-3 w-3" />
                        {artwork.likes}
                      </span>
                    </div>
                  </div>

                  {/* 세련된 캡션 디자인 */}
                  <div className="p-6 space-y-4 bg-gradient-to-b from-background to-muted/20">
                    {/* 메인 타이틀 */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-scholar-red transition-colors duration-200 flex-grow min-w-0">
                          {artwork.title}
                        </h3>
                        <p className="text-base text-muted-foreground font-medium text-right whitespace-nowrap ml-auto">
                          {artwork.artist}
                        </p>
                      </div>
                    </div>

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">{artwork.dimensions}</span>
                        <span className="text-xs">{artwork.medium}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-lg font-semibold text-foreground">
                          {artwork.year}
                        </span>
                      </div>
                    </div>

                    {/* 태그 */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/50">
                      {artwork.tags.slice(0, 3).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs px-2 py-1 bg-muted/60 hover:bg-muted transition-colors duration-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* 가격 및 액션 버튼 */}
                    <div className="flex items-start justify-between pt-3 border-t border-border">
                      <div className="flex flex-col space-y-1 flex-1 min-w-0">
                        {/* 구매 정보 */}
                        {artwork.isAvailable && (
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold text-sm text-foreground">
                              구매 {artwork.showPrice === false ? '가격 문의' : 
                                artwork.currency === 'KRW' 
                                  ? `₩${artwork.price.toLocaleString()}`
                                  : `$${artwork.price.toLocaleString()}`
                              }
                            </span>
                          </div>
                        )}
                        
                        {/* 대여 정보 */}
                        {artwork.isRentable && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold text-sm text-foreground">
                              대여 {artwork.showRentalPrice === false || !artwork.rentalPrice ? '가격 문의' :
                                `${artwork.currency === 'KRW' 
                                  ? `₩${artwork.rentalPrice.toLocaleString()}`
                                  : `$${artwork.rentalPrice.toLocaleString()}`
                                }/${artwork.rentalPeriod || '월'}`
                              }
                            </span>
                          </div>
                        )}
                        
                        {/* 상태 표시 */}
                        <span className="text-xs text-muted-foreground">
                          {getCollectionStatusInfo(artwork).text}
                        </span>
                      </div>
                      
                      <Button
                        variant={(artwork.isAvailable || artwork.isRentable) ? "default" : "outline"}
                        disabled={!artwork.isAvailable && !artwork.isRentable}
                        className={`text-xs px-3 py-1.5 h-auto ml-3 ${(artwork.isAvailable || artwork.isRentable) ? 'bg-scholar-red hover:bg-scholar-red/90' : getCollectionStatusInfo(artwork).className}`}
                        asChild={artwork.isAvailable || artwork.isRentable}
                      >
                        {artwork.isAvailable || artwork.isRentable ? (
                          <a href="https://cal.com/orientalcalligraphy" target="_blank" rel="noopener noreferrer">
                            {getCollectionStatusInfo(artwork).subText}
                          </a>
                        ) : (
                          getCollectionStatusInfo(artwork).subText
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Search and Filters */}
        <section className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 md:py-6">
            {/* Mobile Search */}
            <div className="mb-4 md:mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="작품명, 작가명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 h-10 px-4"
              >
                <SlidersHorizontal className="h-4 w-4" />
                필터 {showFilters ? '닫기' : '열기'}
              </Button>
              <div className="text-sm text-muted-foreground">
                총 {filteredArtworks.length}개의 작품
              </div>
            </div>

            {/* Collapsible Mobile Filters */}
            {showFilters && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="카테고리" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="calligraphy">서예</SelectItem>
                      <SelectItem value="painting">회화</SelectItem>
                      <SelectItem value="sculpture">조각</SelectItem>
                      <SelectItem value="mixed-media">혼합매체</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="스타일" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="traditional">전통</SelectItem>
                      <SelectItem value="contemporary">현대</SelectItem>
                      <SelectItem value="modern">모던</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 모바일 종이 규격 필터 */}
                {selectedCategory === 'calligraphy' && (
                  <Select value={selectedPaperSize} onValueChange={setSelectedPaperSize}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="종이 규격" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 규격</SelectItem>
                      <SelectItem value="ban-jeol">반절지 (35×135)</SelectItem>
                      <SelectItem value="jeon-ji">전지 (70×135)</SelectItem>
                      <SelectItem value="guk-jeon-ji">국전지 (70×200)</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12">
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

                  <Button
                    variant={showAvailableOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                    className="flex items-center gap-2 h-12"
                  >
                    <Filter className="h-4 w-4" />
                    구매가능
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedStyle('all')
                    setSelectedPaperSize('all')
                    setShowAvailableOnly(false)
                  }}
                  className="w-full h-12"
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Mobile Artworks Grid */}
        <section className="container mx-auto px-4 py-6">
          {filteredArtworks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">검색 조건에 맞는 작품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredArtworks.map((artwork) => (
                <Card key={artwork.id} className="group overflow-hidden border-0 shadow-md">
                  <div className={`relative overflow-hidden ${getImageAspectRatio(artwork)}`}>
                    <ImageViewer
                      images={artwork.images}
                      title={artwork.title}
                      artist={artwork.artist}
                      description={artwork.description}
                      allowDownload={artwork.category === 'calligraphy'}
                    >
                      <ArtworkImage
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        variant="card"
                        className="cursor-pointer"
                        fill
                      />
                    </ImageViewer>
                    
                    {/* Mobile Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {artwork.isFeatured && (
                        <Badge className="bg-scholar-red text-white text-xs">추천</Badge>
                      )}
                      {!artwork.isAvailable && (
                        <Badge variant="secondary" className={`text-xs ${getCollectionStatusInfo(artwork).bgClassName} ${getCollectionStatusInfo(artwork).className} border-0`}>
                          {getCollectionStatusInfo(artwork).text}
                        </Badge>
                      )}
                      {/* 모바일 종이 규격 표시 */}
                      {artwork.category === 'calligraphy' && artwork.paperSize && (
                        <Badge variant="outline" className="text-xs">
                          {artwork.paperSize === 'ban-jeol' && '반절'}
                          {artwork.paperSize === 'jeon-ji' && '전지'}
                          {artwork.paperSize === 'guk-jeon-ji' && '국전'}
                        </Badge>
                      )}
                    </div>

                    {/* Mobile Stats */}
                    <div className="absolute bottom-2 right-2 flex gap-2 text-white text-xs">
                      <span className="flex items-center gap-1 bg-black/70 rounded px-2 py-1">
                        <Eye className="h-3 w-3" />
                        {artwork.views}
                      </span>
                      <span className="flex items-center gap-1 bg-black/70 rounded px-2 py-1">
                        <Heart className="h-3 w-3" />
                        {artwork.likes}
                      </span>
                    </div>
                  </div>

                  {/* 모바일 세련된 캡션 디자인 */}
                  <div className="p-4 space-y-3 bg-gradient-to-b from-background to-muted/10">
                    {/* 메인 타이틀 */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-scholar-red transition-colors duration-200 flex-grow min-w-0">
                          {artwork.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium text-right whitespace-nowrap ml-auto">
                          {artwork.artist}
                        </p>
                      </div>
                    </div>

                    {/* 메타 정보 */}
                    <div className="flex items-start justify-between text-xs text-muted-foreground">
                      <div className="flex flex-col space-y-1 flex-1">
                        <span className="font-medium line-clamp-1">{artwork.dimensions}</span>
                        <span className="line-clamp-1">{artwork.medium}</span>
                      </div>
                      <div className="text-right ml-2">
                        <span className="font-mono text-sm font-semibold text-foreground">
                          {artwork.year}
                        </span>
                      </div>
                    </div>

                    {/* 태그 */}
                    <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-border/30">
                      {artwork.tags.slice(0, 2).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs px-2 py-0 bg-muted/50 hover:bg-muted transition-colors duration-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* 가격 및 액션 버튼 */}
                    <div className="flex items-start justify-between pt-3 border-t border-border">
                      <div className="flex flex-col space-y-1 flex-1">
                        {/* 구매 정보 */}
                        {artwork.isAvailable && (
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold text-sm text-foreground">
                              구매 {artwork.showPrice === false ? '가격 문의' : 
                                artwork.currency === 'KRW' 
                                  ? `₩${artwork.price.toLocaleString()}`
                                  : `$${artwork.price.toLocaleString()}`
                              }
                            </span>
                          </div>
                        )}
                        
                        {/* 대여 정보 */}
                        {artwork.isRentable && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold text-sm text-foreground">
                              대여 {artwork.showRentalPrice === false || !artwork.rentalPrice ? '가격 문의' :
                                `${artwork.currency === 'KRW' 
                                  ? `₩${artwork.rentalPrice.toLocaleString()}`
                                  : `$${artwork.rentalPrice.toLocaleString()}`
                                }/${artwork.rentalPeriod || '월'}`
                              }
                            </span>
                          </div>
                        )}
                        
                        {/* 상태 표시 */}
                        <span className="text-xs text-muted-foreground">
                          {getCollectionStatusInfo(artwork).text}
                        </span>
                      </div>
                      
                      <Button
                        variant={(artwork.isAvailable || artwork.isRentable) ? "default" : "outline"}
                        disabled={!artwork.isAvailable && !artwork.isRentable}
                        className={`text-xs px-3 py-1.5 h-auto ml-3 ${(artwork.isAvailable || artwork.isRentable) ? 'bg-scholar-red hover:bg-scholar-red/90' : getCollectionStatusInfo(artwork).className}`}
                        asChild={artwork.isAvailable || artwork.isRentable}
                      >
                        {artwork.isAvailable || artwork.isRentable ? (
                          <a href="https://cal.com/orientalcalligraphy" target="_blank" rel="noopener noreferrer">
                            {getCollectionStatusInfo(artwork).subText}
                          </a>
                        ) : (
                          getCollectionStatusInfo(artwork).subText
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
      <Toaster />
    </div>
  )
}

export default function ArtworksPage() {
  return (
    <ArtworksContent />
  )
} 
'use client'

import { useState, useMemo, useEffect } from 'react'
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
import { getArtworks, type ArtworkWithArtist } from '@/lib/api/artworks'
import { useLanguage } from '@/contexts/language-context'

// 작품 데이터 타입을 실제 데이터베이스 타입으로 변경
type Artwork = ArtworkWithArtist

function ArtworksContent() {
  const { language } = useLanguage()
  const [artworks, setArtworks] = useState<ArtworkWithArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStyle, setSelectedStyle] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('sortFeatured')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // API에서 작품 데이터 로드
  useEffect(() => {
    const loadArtworks = async () => {
      try {
        setLoading(true)
        setError(null)
        const { artworks: artworksList } = await getArtworks()
        setArtworks(artworksList)
      } catch (err) {
        
        setError('작품 목록을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadArtworks()
  }, [])

  // 필터링 및 정렬 로직
  const filteredArtworks = useMemo(() => {
    const filtered = artworks.filter(artwork => {
      let matchesSearch = true
      let matchesCategory = true
      let matchesStyle = true
      let matchesAvailability = true
      
      // 검색어 필터
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        matchesSearch = 
          artwork.title.toLowerCase().includes(searchLower) ||
          artwork.artist.name.toLowerCase().includes(searchLower) ||
          artwork.description.toLowerCase().includes(searchLower) ||
          artwork.materials.some(material => material.toLowerCase().includes(searchLower))
      }
      
      // 카테고리 필터
      if (selectedCategory !== 'all') {
        matchesCategory = artwork.category === selectedCategory
      }
      
      // 스타일 필터
      if (selectedStyle !== 'all') {
        matchesStyle = artwork.style === selectedStyle
      }
      
      // 구매 가능 여부 필터
      if (showAvailableOnly) {
        matchesAvailability = artwork.availability === 'available'
      }
      
      return matchesSearch && matchesCategory && matchesStyle && matchesAvailability
    })

    // 정렬 적용
    switch (sortBy) {
      case 'sortFeatured':
        return filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      case 'priceAsc':
        return filtered.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0))
      case 'priceDesc':
        return filtered.sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0))
      case 'yearDesc':
        return filtered.sort((a, b) => b.year - a.year)
      case 'yearAsc':
        return filtered.sort((a, b) => a.year - b.year)
      case 'nameAsc':
        return filtered.sort((a, b) => a.title.localeCompare(b.title))
      case 'nameDesc':
        return filtered.sort((a, b) => b.title.localeCompare(a.title))
      default:
        return filtered
    }
  }, [artworks, searchTerm, selectedCategory, selectedStyle, showAvailableOnly, sortBy])

  // 서예 작품인지 확인하여 적절한 이미지 비율 반환
  const getImageAspectRatio = (artwork: Artwork) => {
    if (artwork.category === 'calligraphy') {
      return 'aspect-[1/4]' // 기본 세로형 비율
    }
    return 'aspect-[3/4]' // 기존 회화/조각 비율
  }

  // 소장 상태에 따른 세련된 표시 텍스트와 스타일 반환
  const getCollectionStatusInfo = (artwork: Artwork) => {
    // 구매 가능한 작품
    if (artwork.availability === 'available') {
        return {
        text: '구매 가능',
          subText: '문의하기',
          className: 'text-emerald-600 dark:text-emerald-400',
          bgClassName: 'bg-emerald-50 dark:bg-emerald-950/30'
      }
    }

    // 기타 상태
    switch (artwork.availability) {
      case 'sold':
          return {
          text: '판매완료',
          subText: '소장됨',
          className: 'text-red-600 dark:text-red-400',
          bgClassName: 'bg-red-50 dark:bg-red-950/30'
        }
      case 'reserved':
        return {
          text: '예약됨',
          subText: '대기가능',
          className: 'text-orange-600 dark:text-orange-400',
          bgClassName: 'bg-orange-50 dark:bg-orange-950/30'
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scholar-red mx-auto mb-4"></div>
          <p className="text-muted-foreground">작품 목록을 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg font-medium mb-2 text-red-600">{error}</p>
          <p className="text-sm text-muted-foreground">페이지를 새로고침해 주세요.</p>
        </div>
        <Footer />
      </div>
    )
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

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="정렬" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sortFeatured">추천순</SelectItem>
                    <SelectItem value="priceAsc">가격낮은순</SelectItem>
                    <SelectItem value="priceDesc">가격높은순</SelectItem>
                    <SelectItem value="yearDesc">최신순</SelectItem>
                    <SelectItem value="yearAsc">오래된순</SelectItem>
                    <SelectItem value="nameAsc">이름순</SelectItem>
                    <SelectItem value="nameDesc">이름역순</SelectItem>
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
                    <Link href={`/artworks/${artwork.id}`}>
                    <ImageViewer
                      images={artwork.images}
                      title={artwork.title}
                        artist={artwork.artist.name}
                      description={artwork.description}
                      allowDownload={artwork.category === 'calligraphy'} // 서예 작품만 다운로드 허용
                    >
                      <ArtworkImage
                          src={artwork.thumbnail}
                        alt={artwork.title}
                        variant="card"
                        className="cursor-pointer transition-transform duration-300 group-hover:scale-105"
                        fill
                      />
                    </ImageViewer>
                    </Link>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {artwork.featured && (
                        <Badge className="bg-scholar-red text-white">추천</Badge>
                      )}
                      {artwork.availability !== 'available' && (
                        <Badge variant="secondary" className={`text-xs ${getCollectionStatusInfo(artwork).bgClassName} ${getCollectionStatusInfo(artwork).className} border-0`}>
                          {getCollectionStatusInfo(artwork).text}
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
                        <Link href={`/artworks/${artwork.id}`}>
                          <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-scholar-red transition-colors duration-200 flex-grow min-w-0 cursor-pointer">
                          {artwork.title}
                        </h3>
                        </Link>
                        <Link href={`/artists/${artwork.artist.id}`}>
                          <p className="text-base text-muted-foreground font-medium text-right whitespace-nowrap ml-auto hover:text-foreground transition-colors cursor-pointer">
                            {artwork.artist.name}
                          </p>
                        </Link>
                      </div>
                    </div>

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">{artwork.dimensions.width} × {artwork.dimensions.height} {artwork.dimensions.unit}</span>
                        <span className="text-xs">{artwork.materials.join(', ')}</span>
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
                        {artwork.availability === 'available' && (
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold text-sm text-foreground">
                              구매 {!artwork.price ? '가격 문의' : 
                                artwork.price.currency === 'KRW' 
                                  ? `₩${artwork.price.amount.toLocaleString()}`
                                  : `$${artwork.price.amount.toLocaleString()}`
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
                        variant={artwork.availability === 'available' ? "default" : "outline"}
                        disabled={artwork.availability !== 'available'}
                        className={`text-xs px-3 py-1.5 h-auto ml-3 ${artwork.availability === 'available' ? 'bg-scholar-red hover:bg-scholar-red/90' : getCollectionStatusInfo(artwork).className}`}
                        asChild={artwork.availability === 'available'}
                      >
                        {artwork.availability === 'available' ? (
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

                <div className="grid grid-cols-2 gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="정렬" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sortFeatured">추천순</SelectItem>
                      <SelectItem value="priceAsc">가격낮은순</SelectItem>
                      <SelectItem value="priceDesc">가격높은순</SelectItem>
                      <SelectItem value="yearDesc">최신순</SelectItem>
                      <SelectItem value="yearAsc">오래된순</SelectItem>
                      <SelectItem value="nameAsc">이름순</SelectItem>
                      <SelectItem value="nameDesc">이름역순</SelectItem>
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
                    <Link href={`/artworks/${artwork.id}`}>
                    <ImageViewer
                      images={artwork.images}
                      title={artwork.title}
                        artist={artwork.artist.name}
                      description={artwork.description}
                      allowDownload={artwork.category === 'calligraphy'}
                    >
                      <ArtworkImage
                          src={artwork.thumbnail}
                        alt={artwork.title}
                        variant="card"
                        className="cursor-pointer"
                        fill
                      />
                    </ImageViewer>
                    </Link>
                    
                    {/* Mobile Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {artwork.featured && (
                        <Badge className="bg-scholar-red text-white text-xs">추천</Badge>
                      )}
                      {artwork.availability !== 'available' && (
                        <Badge variant="secondary" className={`text-xs ${getCollectionStatusInfo(artwork).bgClassName} ${getCollectionStatusInfo(artwork).className} border-0`}>
                          {getCollectionStatusInfo(artwork).text}
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
                        <Link href={`/artworks/${artwork.id}`}>
                          <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-scholar-red transition-colors duration-200 flex-grow min-w-0 cursor-pointer">
                          {artwork.title}
                        </h3>
                        </Link>
                        <Link href={`/artists/${artwork.artist.id}`}>
                          <p className="text-sm text-muted-foreground font-medium text-right whitespace-nowrap ml-auto hover:text-foreground transition-colors cursor-pointer">
                            {artwork.artist.name}
                          </p>
                        </Link>
                      </div>
                    </div>

                    {/* 메타 정보 */}
                    <div className="flex items-start justify-between text-xs text-muted-foreground">
                      <div className="flex flex-col space-y-1 flex-1">
                        <span className="font-medium line-clamp-1">{artwork.dimensions.width} × {artwork.dimensions.height} {artwork.dimensions.unit}</span>
                        <span className="line-clamp-1">{artwork.materials.join(', ')}</span>
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
                        {artwork.availability === 'available' && (
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold text-sm text-foreground">
                              구매 {!artwork.price ? '가격 문의' : 
                                artwork.price.currency === 'KRW' 
                                  ? `₩${artwork.price.amount.toLocaleString()}`
                                  : `$${artwork.price.amount.toLocaleString()}`
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
                        variant={artwork.availability === 'available' ? "default" : "outline"}
                        disabled={artwork.availability !== 'available'}
                        className={`text-xs px-3 py-1.5 h-auto ml-3 ${artwork.availability === 'available' ? 'bg-scholar-red hover:bg-scholar-red/90' : getCollectionStatusInfo(artwork).className}`}
                        asChild={artwork.availability === 'available'}
                      >
                        {artwork.availability === 'available' ? (
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
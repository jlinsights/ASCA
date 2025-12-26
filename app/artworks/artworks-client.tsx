'use client'

import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
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
import { ArtworkImage } from '@/components/adaptive-image'
import { Toaster } from '@/components/ui/toaster'
import type { ArtworkWithArtist } from '@/lib/api/artworks'
import { useLanguage } from '@/contexts/language-context'

// 동적 임포트를 사용한 지연 로딩
const ImageViewer = lazy(() => import('@/components/image-viewer').then(mod => ({ default: mod.ImageViewer })))
const ZoomableImageViewer = lazy(() => import('@/components/dynamic-imports').then(mod => ({ default: mod.default.ZoomableImageViewer })))
const AdvancedGallerySearch = lazy(() => import('@/components/dynamic-imports').then(mod => ({ default: mod.default.AdvancedGallerySearch })))

// 작품 데이터 타입을 실제 데이터베이스 타입으로 변경
type Artwork = ArtworkWithArtist

export function ArtworksClient() {
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
        const response = await fetch('/api/artworks')
        if (!response.ok) {
          throw new Error('Failed to fetch artworks')
        }
        const { artworks: artworksList } = await response.json()
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
          (artwork.materials?.some((material: string) => material.toLowerCase().includes(searchLower)) ?? false)
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
      case 'sortNewest':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'sortOldest':
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case 'sortPriceHigh':
        return filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
      case 'sortPriceLow':
        return filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
      default:
        return filtered
    }
  }, [artworks, searchTerm, selectedCategory, selectedStyle, showAvailableOnly, sortBy])

  // 이미지 비율 계산
  const getImageAspectRatio = (artwork: Artwork) => {
    // 실제 이미지 비율에 따라 조정
    return artwork.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'
  }

  // 컬렉션 상태 정보
  const getCollectionStatusInfo = (artwork: Artwork) => {
    if (artwork.collection_status === 'private') {
      return { label: '개인 소장', color: 'bg-blue-100 text-blue-800' }
    } else if (artwork.collection_status === 'museum') {
      return { label: '박물관 소장', color: 'bg-green-100 text-green-800' }
    } else if (artwork.collection_status === 'gallery') {
      return { label: '갤러리 소장', color: 'bg-purple-100 text-purple-800' }
    }
    return { label: '공개', color: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <TranslatedContent textKey="artworks.gallery.title" />
          </h1>
          <p className="text-muted-foreground">
            <TranslatedContent textKey="artworks.gallery.description"
            />
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="작품명, 작가명, 재료로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 필터 버튼 */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              필터
            </Button>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sortFeatured">추천순</SelectItem>
                  <SelectItem value="sortNewest">최신순</SelectItem>
                  <SelectItem value="sortOldest">오래된순</SelectItem>
                  <SelectItem value="sortPriceHigh">가격 높은순</SelectItem>
                  <SelectItem value="sortPriceLow">가격 낮은순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 필터 패널 */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="calligraphy">서예</SelectItem>
                  <SelectItem value="painting">회화</SelectItem>
                  <SelectItem value="seal">인장</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="스타일" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="traditional">전통</SelectItem>
                  <SelectItem value="modern">현대</SelectItem>
                  <SelectItem value="contemporary">현대적</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="availableOnly"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="availableOnly" className="text-sm">
                  구매 가능한 작품만
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 작품 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => {
            const statusInfo = getCollectionStatusInfo(artwork)
            
            return (
              <Card key={artwork.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  {/* 이미지 */}
                  <div className={`relative ${getImageAspectRatio(artwork)} overflow-hidden rounded-t-lg`}>
                    <ArtworkImage
                      src={artwork.image_url || '/placeholder.svg'}
                      alt={artwork.title}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* 오버레이 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Badge variant="secondary" className="gap-1">
                          <Eye className="w-3 h-3" />
                          자세히 보기
                        </Badge>
                      </div>
                    </div>

                    {/* 상태 배지 */}
                    <div className="absolute top-2 right-2">
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>

                  {/* 작품 정보 */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {artwork.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {artwork.artist.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <p>{artwork.year}</p>
                        <p>{artwork.materials?.join(', ') || ''}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/artworks/${artwork.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 결과 없음 */}
        {filteredArtworks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              다른 검색어나 필터를 시도해보세요
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedStyle('all')
                setShowAvailableOnly(false)
              }}
            >
              필터 초기화
            </Button>
          </div>
        )}
      </main>

      <Footer />
      <Toaster />
    </div>
  )
} 
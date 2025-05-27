'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Heart, 
  Share2, 
  Download,
  Calendar,
  User,
  Palette,
  Star,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

// 작품 데이터 (실제로는 API에서 가져와야 함)
const artworks = [
  {
    id: '1',
    title: '정법의 계승',
    titleEn: 'Inheritance of Orthodox Dharma',
    artist: '김서예',
    artistEn: 'Kim Seoye',
    year: 2023,
    category: 'calligraphy',
    style: '행서',
    medium: '한지, 먹',
    dimensions: '70 x 140 cm',
    description: '전통 서예의 정신을 현대적 감각으로 재해석한 작품입니다. 정법의 계승이라는 주제를 통해 과거와 현재를 잇는 서예의 본질을 탐구합니다.',
    descriptionEn: 'A work that reinterprets the spirit of traditional calligraphy with a modern sensibility. Through the theme of inheriting orthodox dharma, it explores the essence of calligraphy that connects past and present.',
    imageUrl: '/images/artworks/artwork-001.jpg',
    tags: ['전통', '현대', '행서', '정법'],
    isFeatured: true,
    viewCount: 1250,
    likes: 89,
    price: 5000000,
    isForSale: true
  },
  {
    id: '2',
    title: '창신의 조화',
    titleEn: 'Harmony of Innovation',
    artist: '김서예',
    artistEn: 'Kim Seoye',
    year: 2023,
    category: 'calligraphy',
    style: '초서',
    medium: '비단, 먹',
    dimensions: '60 x 120 cm',
    description: '혁신적 접근을 통한 서예의 새로운 가능성을 탐구한 작품입니다. 창신과 조화라는 두 가지 가치의 균형을 추구합니다.',
    descriptionEn: 'A work exploring new possibilities in calligraphy through innovative approaches. It seeks a balance between the two values of innovation and harmony.',
    imageUrl: '/images/artworks/artwork-002.jpg',
    tags: ['혁신', '창신', '초서', '조화'],
    isFeatured: true,
    viewCount: 980,
    likes: 67,
    price: 4500000,
    isForSale: true
  },
  {
    id: '3',
    title: '동아시아의 정신',
    titleEn: 'Spirit of East Asia',
    artist: '이묵향',
    artistEn: 'Lee Mukhyang',
    year: 2022,
    category: 'calligraphy',
    style: '해서',
    medium: '한지, 먹',
    dimensions: '80 x 160 cm',
    description: '한중일 서예 문화의 공통점과 차이점을 표현한 작품입니다. 동아시아 문화권의 서예 정신을 하나로 아우르는 대작입니다.',
    descriptionEn: 'A work expressing the commonalities and differences in Korean, Chinese, and Japanese calligraphy cultures. A masterpiece that encompasses the calligraphic spirit of the East Asian cultural sphere.',
    imageUrl: '/images/artworks/artwork-003.jpg',
    tags: ['동아시아', '문화교류', '해서', '정신'],
    isFeatured: false,
    viewCount: 756,
    likes: 45,
    price: 6000000,
    isForSale: false
  },
  {
    id: '4',
    title: '현대의 울림',
    titleEn: 'Modern Resonance',
    artist: '박문인',
    artistEn: 'Park Munin',
    year: 2024,
    category: 'mixed',
    style: '현대서예',
    medium: '캔버스, 아크릴, 먹',
    dimensions: '100 x 100 cm',
    description: '전통 서예와 현대 미술의 경계를 허무는 실험적 작품입니다. 젊은 세대의 감각으로 서예의 새로운 지평을 열어갑니다.',
    descriptionEn: 'An experimental work that breaks down the boundaries between traditional calligraphy and contemporary art. Opens new horizons for calligraphy with the sensibility of the younger generation.',
    imageUrl: '/images/artworks/artwork-004.jpg',
    tags: ['현대', '실험', '혼합매체'],
    isFeatured: false,
    viewCount: 432,
    likes: 28,
    price: 3000000,
    isForSale: true
  },
  {
    id: '5',
    title: '묵향의 정취',
    titleEn: 'Essence of Ink Fragrance',
    artist: '이묵향',
    artistEn: 'Lee Mukhyang',
    year: 2023,
    category: 'calligraphy',
    style: '예서',
    medium: '한지, 먹',
    dimensions: '50 x 100 cm',
    description: '먹의 향기와 붓의 움직임이 만들어내는 시적 정취를 담은 작품입니다. 고전적 아름다움의 현대적 재현을 보여줍니다.',
    descriptionEn: 'A work capturing the poetic essence created by the fragrance of ink and the movement of the brush. Shows a modern reproduction of classical beauty.',
    imageUrl: '/images/artworks/artwork-005.jpg',
    tags: ['묵향', '정취', '예서', '고전'],
    isFeatured: true,
    viewCount: 623,
    likes: 52,
    price: 3500000,
    isForSale: true
  },
  {
    id: '6',
    title: '서예의 미래',
    titleEn: 'Future of Calligraphy',
    artist: '박문인',
    artistEn: 'Park Munin',
    year: 2024,
    category: 'digital',
    style: '디지털서예',
    medium: '디지털 프린트',
    dimensions: '120 x 80 cm',
    description: '디지털 기술과 전통 서예의 만남을 통해 서예의 미래를 제시하는 작품입니다. 새로운 매체를 통한 서예의 확장 가능성을 탐구합니다.',
    descriptionEn: 'A work that presents the future of calligraphy through the meeting of digital technology and traditional calligraphy. Explores the expansion possibilities of calligraphy through new media.',
    imageUrl: '/images/artworks/artwork-006.jpg',
    tags: ['미래', '디지털', '기술', '확장'],
    isFeatured: false,
    viewCount: 298,
    likes: 19,
    price: 2500000,
    isForSale: true
  }
]

const categories = [
  { value: 'all', label: { ko: '전체', en: 'All' } },
  { value: 'calligraphy', label: { ko: '서예', en: 'Calligraphy' } },
  { value: 'painting', label: { ko: '회화', en: 'Painting' } },
  { value: 'seal', label: { ko: '전각', en: 'Seal' } },
  { value: 'mixed', label: { ko: '혼합매체', en: 'Mixed Media' } },
  { value: 'digital', label: { ko: '디지털', en: 'Digital' } }
]

const sortOptions = [
  { value: 'newest', label: { ko: '최신순', en: 'Newest' } },
  { value: 'oldest', label: { ko: '오래된순', en: 'Oldest' } },
  { value: 'popular', label: { ko: '인기순', en: 'Most Popular' } },
  { value: 'title', label: { ko: '제목순', en: 'Title' } }
]

export default function GalleryPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedArtwork, setSelectedArtwork] = useState<typeof artworks[0] | null>(null)
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set())

  const filteredArtworks = artworks
    .filter(artwork => {
      const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artwork.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artwork.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || artwork.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.year - a.year
        case 'oldest':
          return a.year - b.year
        case 'popular':
          return b.viewCount - a.viewCount
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const toggleLike = (artworkId: string) => {
    setLikedArtworks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(artworkId)) {
        newSet.delete(artworkId)
      } else {
        newSet.add(artworkId)
      }
      return newSet
    })
  }

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-celadon/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-celadon text-white">
              {language === 'ko' ? '작품 갤러리' : 'Artwork Gallery'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-normal mb-6">
              {language === 'ko' ? '작품 갤러리' : 'Artwork Gallery'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === 'ko' 
                ? '동양서예협회 작가들의 뛰어난 작품을 감상하세요'
                : 'Appreciate the outstanding works of ASCA artists'
              }
            </p>
          </div>
        </div>
      </section>

      {/* 필터 및 검색 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* 검색 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'ko' ? '작품명, 작가명, 태그로 검색...' : 'Search by title, artist, tags...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* 필터 */}
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label[language as 'ko' | 'en']}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label[language as 'ko' | 'en']}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 결과 정보 */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {language === 'ko' 
              ? `총 ${filteredArtworks.length}개의 작품`
              : `${filteredArtworks.length} artworks found`
            }
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              {language === 'ko' ? '추천작품' : 'Featured'} ({artworks.filter(a => a.isFeatured).length})
            </Button>
            <Button variant="outline" size="sm">
              {language === 'ko' ? '판매중' : 'For Sale'} ({artworks.filter(a => a.isForSale).length})
            </Button>
          </div>
        </div>

        {/* 작품 목록 */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtworks.map((artwork) => (
              <Card key={artwork.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  {/* 작품 이미지 */}
                  <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                    <Image
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* 오버레이 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                    
                    {/* 액션 버튼들 */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="secondary" onClick={() => setSelectedArtwork(artwork)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => toggleLike(artwork.id)}
                      >
                        <Heart className={`h-4 w-4 ${likedArtworks.has(artwork.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* 배지들 */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {artwork.isFeatured && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">
                          <Star className="h-3 w-3 mr-1" />
                          {language === 'ko' ? '추천' : 'Featured'}
                        </Badge>
                      )}
                      {artwork.isForSale && (
                        <Badge variant="secondary">
                          {language === 'ko' ? '판매중' : 'For Sale'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* 작품 정보 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                      {artwork.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {artwork.artist} • {artwork.year}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {artwork.style}
                      </Badge>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {artwork.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {artwork.likes}
                        </span>
                      </div>
                    </div>
                    
                    {artwork.isForSale && (
                      <p className="text-sm font-medium text-celadon">
                        {formatPrice(artwork.price)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArtworks.map((artwork) => (
              <Card key={artwork.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* 썸네일 */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* 작품 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {artwork.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {artwork.artist} • {artwork.year} • {artwork.dimensions}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {artwork.isFeatured && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600">
                              <Star className="h-3 w-3 mr-1" />
                              {language === 'ko' ? '추천' : 'Featured'}
                            </Badge>
                          )}
                          {artwork.isForSale && (
                            <Badge variant="secondary">
                              {language === 'ko' ? '판매중' : 'For Sale'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {language === 'ko' ? artwork.description : artwork.descriptionEn}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{artwork.style}</span>
                          <span>{artwork.medium}</span>
                          {artwork.isForSale && (
                            <span className="font-medium text-celadon">
                              {formatPrice(artwork.price)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {artwork.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {artwork.likes}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedArtwork(artwork)}>
                                <Eye className="h-4 w-4 mr-1" />
                                {language === 'ko' ? '보기' : 'View'}
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleLike(artwork.id)}
                          >
                            <Heart className={`h-4 w-4 ${likedArtworks.has(artwork.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredArtworks.length === 0 && (
          <div className="text-center py-12">
            <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'ko' ? '작품을 찾을 수 없습니다' : 'No artworks found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ko' 
                ? '검색 조건을 변경해보세요'
                : 'Try changing your search criteria'
              }
            </p>
          </div>
        )}
      </section>

      {/* 작품 상세 모달 */}
      <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArtwork && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">
                  {selectedArtwork.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 작품 이미지 */}
                <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* 작품 정보 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{selectedArtwork.title}</h3>
                    <p className="text-muted-foreground">{selectedArtwork.titleEn}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">{language === 'ko' ? '작가' : 'Artist'}:</span>
                      <p>{selectedArtwork.artist}</p>
                    </div>
                    <div>
                      <span className="font-medium">{language === 'ko' ? '제작년도' : 'Year'}:</span>
                      <p>{selectedArtwork.year}</p>
                    </div>
                    <div>
                      <span className="font-medium">{language === 'ko' ? '스타일' : 'Style'}:</span>
                      <p>{selectedArtwork.style}</p>
                    </div>
                    <div>
                      <span className="font-medium">{language === 'ko' ? '재료' : 'Medium'}:</span>
                      <p>{selectedArtwork.medium}</p>
                    </div>
                    <div>
                      <span className="font-medium">{language === 'ko' ? '크기' : 'Dimensions'}:</span>
                      <p>{selectedArtwork.dimensions}</p>
                    </div>
                    {selectedArtwork.isForSale && (
                      <div>
                        <span className="font-medium">{language === 'ko' ? '가격' : 'Price'}:</span>
                        <p className="text-celadon font-semibold">{formatPrice(selectedArtwork.price)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <span className="font-medium">{language === 'ko' ? '작품 설명' : 'Description'}:</span>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {language === 'ko' ? selectedArtwork.description : selectedArtwork.descriptionEn}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedArtwork.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedArtwork.viewCount} {language === 'ko' ? '조회' : 'views'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {selectedArtwork.likes} {language === 'ko' ? '좋아요' : 'likes'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="flex-1"
                      onClick={() => toggleLike(selectedArtwork.id)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${likedArtworks.has(selectedArtwork.id) ? 'fill-current' : ''}`} />
                      {language === 'ko' ? '좋아요' : 'Like'}
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '공유' : 'Share'}
                    </Button>
                    {selectedArtwork.isForSale && (
                      <Button variant="outline">
                        {language === 'ko' ? '구매 문의' : 'Inquiry'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
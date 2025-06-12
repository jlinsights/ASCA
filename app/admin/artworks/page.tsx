'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AdminNavigation } from '@/components/AdminNavigation'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Image,
  Star,
  Calendar,
  Palette,
  Filter,
  Grid,
  List,
  Download,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import NextImage from 'next/image'
import { useLanguage } from '@/contexts/language-context'

// 임시 작품 데이터
const mockArtworks = [
  {
    id: '1',
    title: '정법의 계승',
    titleEn: 'Inheritance of Orthodox Dharma',
    artistId: '1',
    artistName: '김서예',
    category: 'calligraphy',
    style: '행서',
    medium: '한지, 먹',
    dimensions: '70 x 140 cm',
    year: 2023,
    imageUrl: '/images/artworks/artwork-001.jpg',
    price: 5000000,
    currency: 'KRW',
    isForSale: true,
    isFeatured: true,
    tags: ['전통', '현대', '행서', '정법'],
    description: '전통 서예의 정신을 현대적 감각으로 재해석한 작품입니다.',
    viewCount: 1250,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    title: '창신의 조화',
    titleEn: 'Harmony of Innovation',
    artistId: '1',
    artistName: '김서예',
    category: 'calligraphy',
    style: '초서',
    medium: '비단, 먹',
    dimensions: '60 x 120 cm',
    year: 2023,
    imageUrl: '/images/artworks/artwork-002.jpg',
    price: 4500000,
    currency: 'KRW',
    isForSale: true,
    isFeatured: true,
    tags: ['혁신', '창신', '초서', '조화'],
    description: '혁신적 접근을 통한 서예의 새로운 가능성을 탐구한 작품입니다.',
    viewCount: 980,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    title: '동아시아의 정신',
    titleEn: 'Spirit of East Asia',
    artistId: '2',
    artistName: '이묵향',
    category: 'calligraphy',
    style: '해서',
    medium: '한지, 먹',
    dimensions: '80 x 160 cm',
    year: 2022,
    imageUrl: '/images/artworks/artwork-003.jpg',
    price: 6000000,
    currency: 'KRW',
    isForSale: false,
    isFeatured: false,
    tags: ['동아시아', '문화교류', '해서', '정신'],
    description: '한중일 서예 문화의 공통점과 차이점을 표현한 작품입니다.',
    viewCount: 756,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-15'
  },
  {
    id: '4',
    title: '현대의 울림',
    titleEn: 'Modern Resonance',
    artistId: '3',
    artistName: '박문인',
    category: 'mixed',
    style: '현대서예',
    medium: '캔버스, 아크릴, 먹',
    dimensions: '100 x 100 cm',
    year: 2024,
    imageUrl: '/images/artworks/artwork-004.jpg',
    price: 3000000,
    currency: 'KRW',
    isForSale: true,
    isFeatured: false,
    tags: ['현대', '실험', '혼합매체'],
    description: '전통 서예와 현대 미술의 경계를 허무는 실험적 작품입니다.',
    viewCount: 432,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-10'
  }
]

const categories = [
  { value: 'all', label: { ko: '전체', en: 'All' } },
  { value: 'calligraphy', label: { ko: '서예', en: 'Calligraphy' } },
  { value: 'painting', label: { ko: '회화', en: 'Painting' } },
  { value: 'seal', label: { ko: '전각', en: 'Seal' } },
  { value: 'mixed', label: { ko: '혼합매체', en: 'Mixed Media' } }
]

export default function ArtworksManagement() {
  const { language } = useLanguage()
  const [artworks, setArtworks] = useState(mockArtworks)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(false)

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || artwork.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleDeleteArtwork = (id: string) => {
    if (confirm(language === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setArtworks(artworks.filter(artwork => artwork.id !== id))
    }
  }

  const toggleFeatured = (id: string) => {
    setArtworks(artworks.map(artwork =>
      artwork.id === id ? { ...artwork, isFeatured: !artwork.isFeatured } : artwork
    ))
  }

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`
    }
    return `$${price.toLocaleString()}`
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <AdminNavigation currentPage="artworks" />
        
        <main className="container mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {language === 'ko' ? '작품 관리' : 'Artworks Management'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ko' 
                  ? '작품을 관리하고 전시회에 연결하세요.'
                  : 'Manage artworks and connect to exhibitions.'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                {language === 'ko' ? '일괄 업로드' : 'Bulk Upload'}
              </Button>
              <Button className="bg-celadon hover:bg-celadon/90">
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ko' ? '새 작품 추가' : 'Add New Artwork'}
              </Button>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === 'ko' ? '작품명, 작가명, 태그로 검색...' : 'Search by title, artist, tags...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
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
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  {language === 'ko' ? '전체' : 'All'} ({artworks.length})
                </Button>
                <Button variant="outline" size="sm">
                  {language === 'ko' ? '추천' : 'Featured'} ({artworks.filter(a => a.isFeatured).length})
                </Button>
                <Button variant="outline" size="sm">
                  {language === 'ko' ? '판매중' : 'For Sale'} ({artworks.filter(a => a.isForSale).length})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 작품 목록 */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtworks.map((artwork) => (
                <Card key={artwork.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow group">
                  <CardContent className="p-0">
                    {/* 작품 이미지 */}
                    <div className="relative aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
                      {artwork.imageUrl ? (
                        <NextImage 
                          src={artwork.imageUrl} 
                          alt={artwork.title}
                          width={300}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* 오버레이 액션 */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => toggleFeatured(artwork.id)}
                        >
                          <Star className={`h-4 w-4 ${artwork.isFeatured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
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
                        {artwork.artistName} • {artwork.year}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {artwork.style}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {artwork.viewCount} views
                        </span>
                      </div>
                      
                      {artwork.isForSale && (
                        <p className="text-sm font-medium text-foreground mb-3">
                          {formatPrice(artwork.price, artwork.currency)}
                        </p>
                      )}
                      
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          {language === 'ko' ? '편집' : 'Edit'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteArtwork(artwork.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArtworks.map((artwork) => (
                <Card key={artwork.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* 썸네일 */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                          {artwork.imageUrl ? (
                            <NextImage 
                              src={artwork.imageUrl} 
                              alt={artwork.title}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
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
                              {artwork.artistName} • {artwork.year} • {artwork.dimensions}
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
                          {artwork.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{artwork.style}</span>
                            <span>{artwork.medium}</span>
                            {artwork.isForSale && (
                              <span className="font-medium text-foreground">
                                {formatPrice(artwork.price, artwork.currency)}
                              </span>
                            )}
                            <span>{artwork.viewCount} views</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              {language === 'ko' ? '보기' : 'View'}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              {language === 'ko' ? '편집' : 'Edit'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleFeatured(artwork.id)}
                            >
                              <Star className={`h-4 w-4 ${artwork.isFeatured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteArtwork(artwork.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
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
            <Card>
              <CardContent className="p-12 text-center">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {language === 'ko' ? '작품이 없습니다' : 'No artworks found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'ko' 
                    ? '검색 조건을 변경하거나 새 작품을 추가해보세요.'
                    : 'Try changing your search criteria or add a new artwork.'
                  }
                </p>
                <Button className="bg-celadon hover:bg-celadon/90">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'ko' ? '첫 작품 추가' : 'Add First Artwork'}
                </Button>
              </CardContent>
            </Card>
          )}
        </main>

        <Footer />
      </div>
    </AdminProtectedRoute>
  )
} 
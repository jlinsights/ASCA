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
  Grid, 
  List, 
  Eye, 
  Heart, 
  Camera,
  Star,
  Play
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

// 갤러리 아이템 타입 정의
interface GalleryItem {
  id: string
  title: string
  titleEn: string
  category: string
  type: 'image' | 'video'
  date: string
  location: string
  locationEn: string
  description: string
  descriptionEn: string
  imageUrl: string
  thumbnailUrl: string
  videoUrl?: string
  youtubeId?: string
  duration?: string
  tags: string[]
  photographer: string
  viewCount: number
  likes: number
}

// 갤러리 데이터 생성 함수
const generateGalleryItems = (): GalleryItem[] => {
  const items: GalleryItem[] = []
  
  // 현장휘호 심사대회 - 2025년 4월 26일 (69장)
  const contestTitles = [
    '대회 개막식', '참가자 등록', '개회사', '심사위원 소개', '대회 규칙 설명',
    '참가자 준비', '휘호 시작', '집중하는 참가자들', '붓글씨 작성', '진지한 표정',
    '작품 완성', '심사 준비', '심사위원 검토', '작품 평가', '점수 기록',
    '우수작 선별', '시상 준비', '시상식', '수상자 발표', '기념 촬영'
  ]
  
  for (let i = 1; i <= 69; i++) {
    const titleIndex = (i - 1) % contestTitles.length
    const titleSuffix = Math.floor((i - 1) / contestTitles.length) > 0 ? ` ${Math.floor((i - 1) / contestTitles.length) + 1}` : ''
    
    items.push({
      id: `contest_${i}`,
      title: `${contestTitles[titleIndex]}${titleSuffix}`,
      titleEn: `Competition Scene ${i}`,
      category: 'competition',
      type: 'image',
      date: '2025-04-26',
      location: '동양서예협회',
      locationEn: 'ASCA',
      description: `2025년 현장휘호 심사대회 - ${contestTitles[titleIndex]}${titleSuffix}`,
      descriptionEn: `2025 On-site Calligraphy Competition - Scene ${i}`,
      imageUrl: `/images/gallery/contest_2025-04-26/originals/contest${i}.jpg`,
      thumbnailUrl: `/images/gallery/contest_2025-04-26/thumbnails/contest${i}.jpg`,
      tags: ['현장휘호', '심사대회', '2025', contestTitles[titleIndex].split(' ')[0]],
      photographer: '동양서예협회',
      viewCount: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 100) + 10
    })
  }
  
  // 유튜브 동영상 추가
  items.push({
    id: 'contest_video',
    title: '현장휘호 심사대회 영상',
    titleEn: 'On-site Calligraphy Competition Video',
    category: 'competition',
    type: 'video',
    date: '2025-04-26',
    location: '동양서예협회',
    locationEn: 'ASCA',
    description: '2025년 현장휘호 심사대회의 생생한 현장을 담은 영상',
    descriptionEn: 'Video capturing the vivid moments of the 2025 on-site calligraphy competition',
    imageUrl: '/images/gallery/contest_2025-04-26/originals/contest1.jpg',
    thumbnailUrl: '/images/gallery/contest_2025-04-26/thumbnails/contest1.jpg',
    videoUrl: 'https://youtu.be/IivUMYTWkP8',
    youtubeId: 'IivUMYTWkP8',
    duration: '영상',
    tags: ['현장휘호', '심사대회', '영상', '유튜브'],
    photographer: '동양서예협회',
    viewCount: 1523,
    likes: 127
  })
  
  // 심사운영위원회 - 2025년 4월 19일 (73장)
  const committeeTitles = [
    '위원회 개회', '위원장 인사말', '회의 시작', '안건 발표', '심사 기준 논의',
    '운영 계획 검토', '예산 논의', '일정 조정', '위원 의견 교환', '활발한 토론',
    '세부 사항 검토', '규정 확인', '절차 논의', '최종 검토', '회의 마무리',
    '단체 사진', '기념 촬영', '회의록 작성', '다음 일정 논의', '폐회'
  ]
  
  for (let i = 1; i <= 73; i++) {
    const titleIndex = (i - 1) % committeeTitles.length
    const titleSuffix = Math.floor((i - 1) / committeeTitles.length) > 0 ? ` ${Math.floor((i - 1) / committeeTitles.length) + 1}` : ''
    
    items.push({
      id: `committee_${i}`,
      title: `${committeeTitles[titleIndex]}${titleSuffix}`,
      titleEn: `Committee Meeting Scene ${i}`,
      category: 'ceremony',
      type: 'image',
      date: '2025-04-19',
      location: '동양서예협회 회의실',
      locationEn: 'ASCA Conference Room',
      description: `2025년 심사운영위원회 - ${committeeTitles[titleIndex]}${titleSuffix}`,
      descriptionEn: `2025 Judging Committee Meeting - Scene ${i}`,
      imageUrl: `/images/gallery/committee_2025-04-19/originals/committee${i}.jpg`,
      thumbnailUrl: `/images/gallery/committee_2025-04-19/thumbnails/committee${i}.jpg`,
      tags: ['심사운영위원회', '회의', '2025', committeeTitles[titleIndex].split(' ')[0]],
      photographer: '협회 사무국',
      viewCount: Math.floor(Math.random() * 500) + 50,
      likes: Math.floor(Math.random() * 50) + 5
    })
  }
  
  return items
}

// 갤러리 데이터
const galleryItems: GalleryItem[] = generateGalleryItems()



const categories = [
  { value: 'all', label: { ko: '전체', en: 'All' }, icon: Grid },
  { value: 'competition', label: { ko: '현장휘호 심사대회', en: 'Calligraphy Competition' }, icon: Star },
  { value: 'ceremony', label: { ko: '심사운영위원회', en: 'Committee Meeting' }, icon: Heart }
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
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const filteredItems = galleryItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'popular':
          return b.viewCount - a.viewCount
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const toggleLike = (itemId: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev)
      if (newLiked.has(itemId)) {
        newLiked.delete(itemId)
      } else {
        newLiked.add(itemId)
      }
      return newLiked
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return language === 'ko' 
      ? date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {language === 'ko' ? '갤러리' : 'Gallery'}
            </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {language === 'ko' 
              ? '2025년 4월 19일 심사운영위원회(73장)와 4월 26일 현장휘호 심사대회(69장)의 생생한 현장을 사진으로 만나보세요.'
              : 'Experience the vivid moments of the Judging Committee Meeting on April 19, 2025 (73 photos) and the On-site Calligraphy Competition on April 26, 2025 (69 photos), through photos.'
            }
          </p>
        </div>

        {/* 갤러리 통계 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-6 bg-muted/50 rounded-lg px-6 py-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{galleryItems.filter(item => item.type === 'image').length}</div>
              <div className="text-sm text-muted-foreground">{language === 'ko' ? '총 사진' : 'Total Photos'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{galleryItems.filter(item => item.category === 'competition' && item.type === 'image').length}</div>
              <div className="text-sm text-muted-foreground">{language === 'ko' ? '심사대회' : 'Competition'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{galleryItems.filter(item => item.category === 'ceremony' && item.type === 'image').length}</div>
              <div className="text-sm text-muted-foreground">{language === 'ko' ? '위원회' : 'Committee'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{galleryItems.filter(item => item.type === 'video').length}</div>
              <div className="text-sm text-muted-foreground">{language === 'ko' ? '동영상' : 'Videos'}</div>
            </div>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon
            const categoryCount = category.value === 'all' 
              ? galleryItems.length 
              : galleryItems.filter(item => item.category === category.value).length
            
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.value)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {category.label[language as 'ko' | 'en']} ({categoryCount})
              </Button>
            )
          })}
        </div>

        {/* 검색 및 정렬 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={language === 'ko' ? '제목, 설명, 태그로 검색...' : 'Search by title, description, tags...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
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
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 검색 결과 표시 */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            {language === 'ko' 
              ? `총 ${filteredItems.length}개의 항목이 있습니다`
              : `Showing ${filteredItems.length} items`
            }
            {searchTerm && (
              <span className="ml-2">
                {language === 'ko' 
                  ? `"${searchTerm}" 검색 결과`
                  : `for "${searchTerm}"`
                }
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {language === 'ko' 
              ? `${sortOptions.find(opt => opt.value === sortBy)?.label.ko} 정렬`
              : `Sorted by ${sortOptions.find(opt => opt.value === sortBy)?.label.en}`
            }
          </div>
        </div>

        {/* 갤러리 그리드 */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Dialog key={item.id}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <DialogTrigger asChild>
                      <div className="relative aspect-square overflow-hidden rounded-t-lg cursor-pointer">
                <Image
                          src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                        
                        {/* 비디오 표시 */}
                        {item.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/50 rounded-full p-3">
                              <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                          </div>
                        )}
                        
                        {/* 오버레이 */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLike(item.id)
                              }}
                              className="mr-2"
                            >
                              <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            <div className="inline-flex">
                              <Button size="sm" variant="secondary">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                </div>
              </div>
                    </DialogTrigger>
                    
              <div className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(item.date)}</span>
                        <div className="flex items-center gap-2">
                          {item.type === 'video' && (
                            <>
                              <Play className="w-3 h-3" />
                              <span>{item.duration}</span>
                            </>
                          )}
                          <Eye className="w-3 h-3" />
                          <span>{item.viewCount}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>{item.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative aspect-video">
                      {item.type === 'video' && item.youtubeId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${item.youtubeId}`}
                          title={item.title}
                          className="w-full h-full rounded-lg"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-contain rounded-lg"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>{language === 'ko' ? '날짜' : 'Date'}:</strong> {formatDate(item.date)}</p>
                        <p><strong>{language === 'ko' ? '장소' : 'Location'}:</strong> {language === 'ko' ? item.location : item.locationEn}</p>
                        <p><strong>{language === 'ko' ? '촬영자' : 'Photographer'}:</strong> {item.photographer}</p>
                      </div>
                      <div>
                        <p><strong>{language === 'ko' ? '조회수' : 'Views'}:</strong> {item.viewCount.toLocaleString()}</p>
                        <p><strong>{language === 'ko' ? '좋아요' : 'Likes'}:</strong> {item.likes}</p>
                        {item.type === 'video' && item.videoUrl && (
                          <p><strong>{language === 'ko' ? '원본 영상' : 'Original Video'}:</strong> 
                            <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                              YouTube
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      {language === 'ko' ? item.description : item.descriptionEn}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          /* 리스트 뷰 */
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative w-32 h-24 flex-shrink-0 cursor-pointer">
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.title}
                            fill
                            className="object-cover rounded-lg hover:opacity-80 transition-opacity"
                          />
                          {item.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/50 rounded-full p-2">
                                <Play className="w-4 h-4 text-white fill-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>{item.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="relative aspect-video">
                            {item.type === 'video' && item.youtubeId ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${item.youtubeId}`}
                                title={item.title}
                                className="w-full h-full rounded-lg"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-contain rounded-lg"
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>{language === 'ko' ? '날짜' : 'Date'}:</strong> {formatDate(item.date)}</p>
                              <p><strong>{language === 'ko' ? '장소' : 'Location'}:</strong> {language === 'ko' ? item.location : item.locationEn}</p>
                              <p><strong>{language === 'ko' ? '촬영자' : 'Photographer'}:</strong> {item.photographer}</p>
                            </div>
                            <div>
                              <p><strong>{language === 'ko' ? '조회수' : 'Views'}:</strong> {item.viewCount.toLocaleString()}</p>
                              <p><strong>{language === 'ko' ? '좋아요' : 'Likes'}:</strong> {item.likes}</p>
                              {item.type === 'video' && item.videoUrl && (
                                <p><strong>{language === 'ko' ? '원본 영상' : 'Original Video'}:</strong> 
                                  <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                                    YouTube
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-muted-foreground">
                            {language === 'ko' ? item.description : item.descriptionEn}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                          <p className="text-muted-foreground text-sm mb-2">
                            {language === 'ko' ? item.description : item.descriptionEn}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatDate(item.date)}</span>
                            <span>{language === 'ko' ? item.location : item.locationEn}</span>
                            {item.type === 'video' && (
                              <span className="flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                {item.duration}
                              </span>
                            )}
                            <span>{language === 'ko' ? '촬영자' : 'Photographer'}: {item.photographer}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleLike(item.id)}
                          >
                            <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            {item.likes}
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

        {/* 결과 없음 */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === 'ko' ? '검색 결과가 없습니다' : 'No results found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ko' ? '다른 검색어나 카테고리를 시도해보세요.' : 'Try different search terms or categories.'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
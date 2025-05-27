'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Eye, 
  Download,
  ZoomIn,
  MessageCircle,
  Calendar,
  Palette,
  Ruler,
  User,
  MapPin,
  ShoppingCart,
  Award,
  Star,
  Info,
  ImageIcon
} from 'lucide-react'

// 서체 타입 정의
type HangeulFont = '궁채' | '판본체' | '고체' | '흘림체' | '민체'
type HanjaFont = '해서' | '행서' | '예서' | '전서' | '초서' | '행초서'

// 서예 작품 규격 타입 정의
type CalligraphySize = '반절지(35×135cm)' | '전지(70×135cm)' | '국전지(70×200cm)' | '기타'

// 작품 데이터 타입
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
  category: '한글서예' | '한자서예' | '문인화' | '수묵화' | '동양화' | '민화' | '현대서예' | '캘리그라피' | '전각' | '서각' | '사진' | '영상'
  style: '전통' | '현대'
  font?: HangeulFont | HanjaFont // 서체 (서예 작품에만 적용)
  paperSize?: CalligraphySize // 서예 작품 규격 (서예 작품에만 적용)
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
  artistBio?: string
  technique?: string
  provenance?: string
  exhibition?: string
  condition?: string
  certification?: boolean
  artistId?: string
  weight?: string
  materials?: string[]
  significance?: string
  collectionHistory?: string
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
    category: '수묵화',
    style: '전통',
    medium: '종이에 수묵',
    mediumEn: 'Ink on Paper',
    dimensions: '60 × 80 cm',
    year: 2023,
    price: 1200000,
    currency: 'KRW',
    description: '전통 산수화 기법으로 표현한 봄의 아름다운 풍경입니다. 작가는 자연의 생명력과 계절의 변화를 섬세한 붓터치로 담아냈습니다. 화면 전체에 흐르는 조화로운 구성과 깊이 있는 먹색의 농담 변화가 인상적입니다.',
    descriptionEn: 'Beautiful spring landscape expressed with traditional landscape painting techniques. The artist captured the vitality of nature and seasonal changes with delicate brushstrokes.',
    descriptionJa: '伝統的な山水画技法で表現した春の美しい風景です。作家は自然の生命力と季節の変化を繊細な筆のタッチで込めました。',
    descriptionZh: '用传统山水画技法表现的春天美丽风景。艺术家用细腻的笔触捕捉了自然的生命力和季节的变化。',
    imageUrl: '/placeholder.svg?height=600&width=400',
    images: [
      '/placeholder.svg?height=800&width=600',
      '/placeholder.svg?height=600&width=800',
      '/placeholder.svg?height=400&width=600'
    ],
    isAvailable: true,
    isFeatured: true,
    tags: ['봄', '산수', '전통', '수묵'],
    views: 156,
    likes: 23,
    artistBio: '김한수는 30년 경력의 전통 산수화 전문가로, 동양화 특유의 정신세계를 현대적 감각으로 재해석하는 작업을 지속하고 있습니다.',
    technique: '전통 수묵화법, 선염기법, 점묘법',
    provenance: '작가 작업실, 개인 컬렉션',
    exhibition: '2023 봄 풍경전, 서울 갤러리',
    condition: '최상급 (작가 보관)',
    certification: true,
    artistId: '1',
    weight: '0.5kg',
    materials: ['한지', '먹', '안료'],
    significance: '작가의 대표작 중 하나로, 전통 산수화의 현대적 해석을 보여주는 중요한 작품',
    collectionHistory: '2023년 작가 작업실에서 직접 구입'
  },
  {
    id: '2',
    title: '한자서예 - 묵향',
    titleEn: 'Chinese Calligraphy - Ink Fragrance',
    titleJa: '漢字書道 - 墨香',
    titleZh: '汉字书法 - 墨香',
    artist: '이정화',
    artistEn: 'Lee Jung-hwa',
    artistJa: 'イ・ジョンファ',
    artistZh: '李静华',
    category: '한자서예',
    style: '전통',
    font: '행서',
    paperSize: '반절지(35×135cm)',
    medium: '한지에 먹',
    mediumEn: 'Ink on Hanji',
    dimensions: '35 × 135 cm',
    year: 2024,
    price: 800000,
    currency: 'KRW',
    description: '현대적 감각으로 재해석한 전통 서예 작품입니다.',
    descriptionEn: 'Traditional calligraphy reinterpreted with modern sensibility.',
    descriptionJa: '現代的感覚で再解釈した伝統書道作品です。',
    descriptionZh: '用现代感觉重新诠释的传统书法作品。',
    imageUrl: '/placeholder.svg?height=540&width=140',
    images: ['/placeholder.svg?height=1080&width=280'],
    isAvailable: true,
    isFeatured: false,
    tags: ['서예', '현대', '먹향'],
    views: 89,
    likes: 12,
    artistBio: '이정화는 현대 서예의 새로운 지평을 열어가는 작가입니다.',
    technique: '현대 서예기법',
    condition: '우수',
    certification: false,
    artistId: '2'
  },
  {
    id: '3',
    title: '한글서예 - 사랑',
    titleEn: 'Korean Calligraphy - Love',
    titleJa: 'ハングル書道 - 愛',
    titleZh: '韩文书法 - 爱',
    artist: '박서예',
    artistEn: 'Park Seo-ye',
    artistJa: 'パク・ソイェ',
    artistZh: '朴书艺',
    category: '한글서예',
    style: '전통',
    font: '궁채',
    paperSize: '기타',
    medium: '한지에 먹',
    mediumEn: 'Ink on Hanji',
    dimensions: '50 × 70 cm',
    year: 2023,
    price: 600000,
    currency: 'KRW',
    description: '한글의 아름다움을 전통 서예 기법으로 표현한 작품입니다.',
    descriptionEn: 'A work expressing the beauty of Hangeul with traditional calligraphy techniques.',
    descriptionJa: 'ハングルの美しさを伝統書道技法で表現した作品です。',
    descriptionZh: '用传统书法技法表现韩文之美的作品。',
    imageUrl: '/placeholder.svg?height=700&width=500',
    images: ['/placeholder.svg?height=700&width=500'],
    isAvailable: true,
    isFeatured: false,
    tags: ['한글', '서예', '전통'],
    views: 78,
    likes: 15,
    condition: '최상급',
    certification: true,
    artistId: '3'
  },
  {
    id: '4',
    title: '민화 - 모란도',
    titleEn: 'Folk Painting - Peony',
    titleJa: '民画 - 牡丹図',
    titleZh: '民画 - 牡丹图',
    artist: '최민화',
    artistEn: 'Choi Min-hwa',
    artistJa: 'チェ・ミンファ',
    artistZh: '崔民画',
    category: '민화',
    style: '전통',
    medium: '비단에 채색',
    mediumEn: 'Color on Silk',
    dimensions: '40 × 60 cm',
    year: 2024,
    price: 900000,
    currency: 'KRW',
    description: '전통 민화 기법으로 그린 모란꽃 그림입니다. 부귀영화를 상징하는 모란의 화려함을 섬세하게 표현했습니다.',
    descriptionEn: 'A peony painting drawn with traditional folk painting techniques.',
    descriptionJa: '伝統民画技法で描いた牡丹の絵です。',
    descriptionZh: '用传统民画技法绘制的牡丹花画。',
    imageUrl: '/placeholder.svg?height=600&width=400',
    images: ['/placeholder.svg?height=600&width=400'],
    isAvailable: true,
    isFeatured: true,
    tags: ['민화', '모란', '전통', '채색'],
    views: 124,
    likes: 28,
    condition: '최상급',
    certification: true,
    artistId: '4'
  },
  {
    id: '5',
    title: '캘리그라피 - 희망',
    titleEn: 'Calligraphy - Hope',
    titleJa: 'カリグラフィー - 希望',
    titleZh: '书法艺术 - 希望',
    artist: '김현대',
    artistEn: 'Kim Hyun-dae',
    artistJa: 'キム・ヒョンデ',
    artistZh: '金现代',
    category: '캘리그라피',
    style: '현대',
    medium: '캔버스에 아크릴',
    mediumEn: 'Acrylic on Canvas',
    dimensions: '80 × 100 cm',
    year: 2024,
    price: 1500000,
    currency: 'KRW',
    description: '현대적 감각으로 재해석한 캘리그라피 작품입니다. 희망이라는 단어를 역동적이고 현대적인 표현으로 담아냈습니다.',
    descriptionEn: 'A calligraphy work reinterpreted with modern sensibility.',
    descriptionJa: '現代的感覚で再解釈したカリグラフィー作品です。',
    descriptionZh: '用现代感觉重新诠释的书法艺术作品。',
    imageUrl: '/placeholder.svg?height=800&width=640',
    images: ['/placeholder.svg?height=800&width=640'],
    isAvailable: true,
    isFeatured: false,
    tags: ['캘리그라피', '현대', '희망', '아크릴'],
    views: 95,
    likes: 18,
    condition: '최상급',
    certification: false,
    artistId: '5'
  },
  {
    id: '6',
    title: '한자서예 - 해서체',
    titleEn: 'Chinese Calligraphy - Regular Script',
    titleJa: '漢字書道 - 楷書',
    titleZh: '汉字书法 - 楷书',
    artist: '정해서',
    artistEn: 'Jung Hae-seo',
    artistJa: 'ジョン・ヘソ',
    artistZh: '郑楷书',
    category: '한자서예',
    style: '전통',
    font: '해서',
    paperSize: '기타',
    medium: '한지에 먹',
    mediumEn: 'Ink on Hanji',
    dimensions: '45 × 65 cm',
    year: 2023,
    price: 750000,
    currency: 'KRW',
    description: '정통 해서체로 쓴 한자 서예 작품입니다. 단정하고 균형 잡힌 글자 형태가 특징입니다.',
    descriptionEn: 'Chinese calligraphy written in authentic regular script.',
    descriptionJa: '正統楷書で書いた漢字書道作品です。',
    descriptionZh: '用正统楷书书写的汉字书法作品。',
    imageUrl: '/placeholder.svg?height=650&width=450',
    images: ['/placeholder.svg?height=650&width=450'],
    isAvailable: true,
    isFeatured: false,
    tags: ['한자서예', '해서', '전통'],
    views: 67,
    likes: 11,
    condition: '최상급',
    certification: true,
    artistId: '6'
  },
  {
    id: '7',
    title: '한글서예 - 흘림체',
    titleEn: 'Korean Calligraphy - Cursive Style',
    titleJa: 'ハングル書道 - 草書体',
    titleZh: '韩文书法 - 草书体',
    artist: '김흘림',
    artistEn: 'Kim Heul-lim',
    artistJa: 'キム・フルリム',
    artistZh: '金草书',
    category: '한글서예',
    style: '전통',
    font: '흘림체',
    paperSize: '기타',
    medium: '한지에 먹',
    mediumEn: 'Ink on Hanji',
    dimensions: '60 × 80 cm',
    year: 2024,
    price: 850000,
    currency: 'KRW',
    description: '한글 흘림체의 유려한 아름다움을 보여주는 작품입니다. 자연스러운 필획의 흐름이 인상적입니다.',
    descriptionEn: 'A work showing the graceful beauty of Korean cursive calligraphy.',
    descriptionJa: 'ハングル草書体の流麗な美しさを見せる作品です。',
    descriptionZh: '展现韩文草书体优美之美的作品。',
    imageUrl: '/placeholder.svg?height=800&width=600',
    images: ['/placeholder.svg?height=800&width=600'],
    isAvailable: true,
    isFeatured: true,
    tags: ['한글서예', '흘림체', '전통', '유려함'],
    views: 142,
    likes: 31,
    condition: '최상급',
    certification: true,
    artistId: '7'
  },
  {
    id: '8',
    title: '한자서예 - 전서체',
    titleEn: 'Chinese Calligraphy - Seal Script',
    titleJa: '漢字書道 - 篆書',
    titleZh: '汉字书法 - 篆书',
    artist: '이전서',
    artistEn: 'Lee Jeon-seo',
    artistJa: 'イ・ジョンソ',
    artistZh: '李篆书',
    category: '한자서예',
    style: '전통',
    font: '전서',
    paperSize: '전지(70×135cm)',
    medium: '한지에 먹',
    mediumEn: 'Ink on Hanji',
    dimensions: '70 × 135 cm',
    year: 2023,
    price: 950000,
    currency: 'KRW',
    description: '고대 전서체의 고풍스러운 멋을 현대에 재현한 작품입니다. 장중하고 위엄 있는 글자체가 특징입니다.',
    descriptionEn: 'A work that recreates the antique charm of ancient seal script in modern times.',
    descriptionJa: '古代篆書の古風な趣を現代に再現した作品です。',
    descriptionZh: '在现代重现古代篆书古朴韵味的作品。',
    imageUrl: '/placeholder.svg?height=700&width=500',
    images: ['/placeholder.svg?height=700&width=500'],
    isAvailable: true,
    isFeatured: false,
    tags: ['한자서예', '전서', '전통', '고풍'],
    views: 89,
    likes: 19,
    condition: '최상급',
    certification: true,
    artistId: '8'
  },
  {
    id: '9',
    title: '한자서예 - 초서체 (국전지)',
    titleEn: 'Chinese Calligraphy - Cursive Script (Exhibition Size 70×200cm)',
    titleJa: '漢字書道 - 草書 (国展紙 70×200cm)',
    titleZh: '汉字书法 - 草书 (国展纸 70×200cm)',
    artist: '박초서',
    artistEn: 'Park Cho-seo',
    artistJa: 'パク・チョソ',
    artistZh: '朴草书',
    category: '한자서예',
    style: '전통',
    font: '초서',
    paperSize: '국전지(70×200cm)',
    medium: '한지에 먹',
    mediumEn: 'Ink on Hanji',
    dimensions: '70 × 200 cm',
    year: 2024,
    price: 1200000,
    currency: 'KRW',
    description: '국전지 규격(70×200cm)의 대형 초서체 작품입니다. 역동적이고 자유로운 필획이 화면 전체에 펼쳐져 웅장한 기운을 자아냅니다.',
    descriptionEn: 'A large-scale cursive script work in exhibition paper size (70×200cm).',
    descriptionJa: '国展紙規格(70×200cm)の大型草書作品です。',
    descriptionZh: '国展纸规格(70×200cm)的大型草书作品。',
    imageUrl: '/placeholder.svg?height=900&width=600',
    images: ['/placeholder.svg?height=900&width=600'],
    isAvailable: true,
    isFeatured: true,
    tags: ['한자서예', '초서', '국전지', '대형작품'],
    views: 203,
    likes: 45,
    condition: '최상급',
    certification: true,
    artistId: '9'
  }
]

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadArtwork = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 실제로는 API 호출
        const foundArtwork = sampleArtworks.find(art => art.id === params.id)
        if (!foundArtwork) {
          notFound()
          return
        }
        setArtwork(foundArtwork)
      } catch (err) {
        console.error('Failed to load artwork:', err)
        setError('작품 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadArtwork()
  }, [params.id])

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString()}`
    }
    return `$${price.toLocaleString()}`
  }

  const getCategoryLabel = (category: string) => {
    // 이미 한국어로 되어 있으므로 그대로 반환
    return category
  }

  const getStyleLabel = (style: string) => {
    // 이미 한국어로 되어 있으므로 그대로 반환
    return style
  }

  // 서체가 해당 카테고리에 적합한지 확인하는 함수
  const isValidFont = (category: string, style: string, font?: string) => {
    if (!font) return true
    
    if (style === '전통') {
      if (category === '한글서예') {
        return ['궁채', '판본체', '고체', '흘림체', '민체'].includes(font)
      }
      if (category === '한자서예') {
        return ['해서', '행서', '예서', '전서', '초서', '행초서'].includes(font)
      }
    }
    
    return false
  }

  // 서예 작품 규격이 유효한지 확인하는 함수
  const isValidPaperSize = (category: string, paperSize?: string) => {
    if (!paperSize) return true
    
    const calligraphyCategories = ['한글서예', '한자서예', '현대서예']
    if (calligraphyCategories.includes(category)) {
      return ['반절지(35×135cm)', '전지(70×135cm)', '국전지(70×200cm)', '기타'].includes(paperSize)
    }
    
    return false
  }

  // 규격에 따른 설명을 반환하는 함수
  const getPaperSizeDescription = (paperSize: string) => {
    const descriptions = {
      '반절지(35×135cm)': '전통 서예에서 가장 많이 사용되는 기본 규격',
      '전지(70×135cm)': '반절지의 2배 크기로 대작에 사용되는 규격',
      '국전지(70×200cm)': '국전 및 대형 전시회에서 사용되는 특대 규격 (70×200cm)',
      '기타': '작가가 특별히 선택한 맞춤 규격'
    }
    return descriptions[paperSize as keyof typeof descriptions] || ''
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">작품 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !artwork) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-red-500">{error || '작품을 찾을 수 없습니다.'}</p>
          <Link href="/artworks">
            <Button className="mt-4">
              작품 목록으로 돌아가기
            </Button>
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const relatedArtworks = sampleArtworks.filter(art => 
    art.id !== artwork.id && 
    (art.artist === artwork.artist || art.category === artwork.category)
  ).slice(0, 3)

  return (
    <main className="min-h-screen">
      <Header />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link 
          href="/artworks"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          작품 목록으로 돌아가기
        </Link>
      </div>

      {/* Artwork Detail */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
              <Image
                src={artwork.images[currentImageIndex] || artwork.imageUrl}
                alt={artwork.title}
                fill
                className="object-cover"
              />
              
              {/* Image Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                      <Image
                        src={artwork.images[currentImageIndex] || artwork.imageUrl}
                        alt={artwork.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              {/* Image Navigation */}
              {artwork.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {artwork.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {artwork.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {artwork.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded border-2 transition-colors ${
                      index === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${artwork.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Artwork Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {artwork.isFeatured && (
                      <Badge className="bg-red-600 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        추천작품
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-blue-200 text-blue-800">
                      {getCategoryLabel(artwork.category)}
                    </Badge>
                    <Badge variant="outline" className="border-green-200 text-green-800">
                      {getStyleLabel(artwork.style)}
                    </Badge>
                    {artwork.font && (
                      <Badge variant="outline" className="border-purple-200 text-purple-800">
                        {artwork.font}
                      </Badge>
                    )}
                    {artwork.paperSize && (
                      <Badge variant="outline" className="border-orange-200 text-orange-800">
                        {artwork.paperSize}
                      </Badge>
                    )}
                    {!artwork.isAvailable && (
                      <Badge variant="secondary">판매완료</Badge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-normal mb-2">
                    {artwork.title}
                  </h1>
                  
                  <Link 
                    href={`/artists/${artwork.artistId || artwork.artist}`}
                    className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    by {artwork.artist}
                  </Link>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                    {artwork.likes + (isLiked ? 1 : 0)}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {artwork.year}년
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  {artwork.views} 조회
                </div>
                <div className="flex items-center">
                  <Ruler className="w-4 h-4 mr-2" />
                  {artwork.dimensions}
                </div>
              </div>
            </div>

            {/* Price Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold mb-1">
                    {formatPrice(artwork.price, artwork.currency)}
                  </div>
                  <p className="text-sm text-muted-foreground">작품 가격</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="lg" 
                    disabled={!artwork.isAvailable}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {artwork.isAvailable ? '구매 문의' : '판매완료'}
                  </Button>
                  <Button variant="outline" size="lg">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">재료</p>
                    <p className="text-sm font-medium">{artwork.medium}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">상태</p>
                    <p className="text-sm font-medium">{artwork.condition || '우수'}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {artwork.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">작품설명</TabsTrigger>
                <TabsTrigger value="details">세부정보</TabsTrigger>
                <TabsTrigger value="artist">작가정보</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="space-y-4 mt-6">
                <div className="prose prose-sm max-w-none">
                  <p className="leading-relaxed">{artwork.description}</p>
                  {artwork.significance && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">작품의 의미</h4>
                      <p className="text-sm text-muted-foreground">{artwork.significance}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4 mt-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-muted-foreground">카테고리</span>
                    <span className="font-medium">{getCategoryLabel(artwork.category)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-muted-foreground">스타일</span>
                    <span className="font-medium">{getStyleLabel(artwork.style)}</span>
                  </div>
                  {artwork.font && (
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">서체</span>
                      <span className="font-medium">{artwork.font}</span>
                    </div>
                  )}
                  {artwork.paperSize && (
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">규격</span>
                      <span className="font-medium">{artwork.paperSize}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-muted-foreground">제작기법</span>
                    <span className="font-medium">{artwork.technique || artwork.medium}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-muted-foreground">크기</span>
                    <span className="font-medium">{artwork.dimensions}</span>
                  </div>
                  {artwork.weight && (
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">무게</span>
                      <span className="font-medium">{artwork.weight}</span>
                    </div>
                  )}
                  {artwork.materials && artwork.materials.length > 0 && (
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">사용재료</span>
                      <span className="font-medium">{artwork.materials.join(', ')}</span>
                    </div>
                  )}
                  {artwork.certification && (
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-muted-foreground">진품보증</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Award className="w-3 h-3 mr-1" />
                        인증완료
                      </Badge>
                    </div>
                  )}
                  {artwork.exhibition && (
                    <div className="py-3 border-b">
                      <span className="text-muted-foreground block mb-1">전시이력</span>
                      <span className="text-sm">{artwork.exhibition}</span>
                    </div>
                  )}
                  {artwork.provenance && (
                    <div className="py-3 border-b">
                      <span className="text-muted-foreground block mb-1">소장이력</span>
                      <span className="text-sm">{artwork.provenance}</span>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="artist" className="space-y-4 mt-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{artwork.artist}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {artwork.artistBio || '작가 정보가 준비 중입니다.'}
                    </p>
                    <Link 
                      href={`/artists/${artwork.artistId || artwork.artist}`} 
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      작가 페이지 보기 →
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Related Artworks */}
      {relatedArtworks.length > 0 && (
        <section className="container mx-auto px-4 py-8 border-t">
          <h2 className="text-3xl font-normal uppercase mb-8">관련 작품</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArtworks.map((relatedArtwork) => (
              <Card key={relatedArtwork.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                <Link href={`/artworks/${relatedArtwork.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={relatedArtwork.imageUrl}
                      alt={relatedArtwork.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {relatedArtwork.isFeatured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-600 text-white">추천</Badge>
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm line-clamp-1 mb-1">{relatedArtwork.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{relatedArtwork.artist}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {formatPrice(relatedArtwork.price, relatedArtwork.currency)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {relatedArtwork.views}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
} 
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Calendar, Users, Award, BookOpen, MapPin, Phone, Mail, Camera, Palette, Sparkles } from 'lucide-react'
import galleryData from '@/lib/data/gallery-data.json'
import { GalleryData } from '@/types/gallery'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import '@/styles/gallery.css'

// 갤러리 컴포넌트 동적 임포트
const GalleryClient = dynamic(() => import('@/components/gallery/GalleryClient'), {
  loading: () => <GalleryLoadingSkeleton />
})

// 로딩 스켈레톤 컴포넌트
function GalleryLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="masonry-grid">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse loading-shimmer" />
        ))}
      </div>
    </div>
  )
}

// 갤러리 통계 컴포넌트
function GalleryStats({ data }: { data: GalleryData }) {
  const stats = [
    {
      icon: Camera,
      value: data.metadata.totalImages,
      label: '총 이미지',
      description: '작품부터 행사까지'
    },
    {
      icon: Palette,
      value: data.categories.length,
      label: '카테고리',
      description: '다양한 분류'
    },
    {
      icon: Sparkles,
      value: '95%',
      label: '품질',
      description: '최고 화질'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-6 text-center hover-scale smooth-transition"
          >
            <div className="flex justify-center mb-4">
              <IconComponent className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div className="text-3xl font-bold text-foreground mb-2">
              {stat.value}
            </div>
            
            <div className="text-sm font-medium text-foreground mb-1">
              {stat.label}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {stat.description}
            </div>
          </div>
        )}
      )}
    </div>
  )
}

export default function Page() {
  const data = galleryData as unknown as GalleryData
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section - 미니멀 모던 디자인 */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="text-center space-y-8">
            {/* 로고 */}
            <div className="flex justify-center mb-8">
              <Image
                src="/logo/Logo & Tagline_white BG.png"
                alt="동양서예협회 로고"
                width={400}
                height={160}
                className="h-24 md:h-32 w-auto object-contain"
                priority
              />
            </div>
            
            {/* 메인 타이틀 */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                동양서예 갤러리
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                正法의 계승, 創新의 조화
              </p>
              <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                전통 서예의 정법을 계승하고 현대적 창신을 통해 동양서예의 새로운 미래를 열어갑니다
              </p>
            </div>
            
            {/* 갤러리 통계 - 미니멀 스타일 */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground py-6">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span className="font-medium">{data.metadata.totalImages}</span>
                <span>이미지</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="font-medium">{data.categories.length}</span>
                <span>카테고리</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">HD</span>
                <span>품질</span>
              </div>
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild size="default" className="gap-2">
                <Link href="#gallery">
                  <Camera className="w-4 h-4" />
                  갤러리 보기
                </Link>
              </Button>
              <Button asChild variant="outline" size="default" className="gap-2">
                <Link href="/events">
                  <BookOpen className="w-4 h-4" />
                  행사 안내
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 갤러리 섹션 */}
      <section id="gallery" className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* 갤러리 통계 카드 */}
          <div className="relative z-10 mb-16">
            <GalleryStats data={data} />
          </div>

          {/* 갤러리 그리드 */}
          <Suspense fallback={<GalleryLoadingSkeleton />}>
            <GalleryClient data={data} />
          </Suspense>
        </div>
      </section>

      {/* 추가 서비스 섹션 */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              추가 서비스
            </h2>
            <p className="text-lg text-muted-foreground">
              동양서예협회에서 제공하는 다양한 서비스를 확인해보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover-scale smooth-transition border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">전시회</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  현재, 예정, 과거 전시회 정보를 확인하세요
                </p>
                <Button asChild variant="ghost" className="p-0 h-auto text-primary hover:text-primary">
                  <Link href="/exhibitions">
                    자세히 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="group hover-scale smooth-transition border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">작가 소개</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  협회 소속 작가들의 프로필을 확인하세요
                </p>
                <Button asChild variant="ghost" className="p-0 h-auto text-primary hover:text-primary">
                  <Link href="/artists">
                    자세히 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="group hover-scale smooth-transition border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8 text-muted-foreground" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">공모전</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  서예 공모전 정보와 참가 방법을 확인하세요
                </p>
                <Button asChild variant="ghost" className="p-0 h-auto text-primary hover:text-primary">
                  <Link href="/contests">
                    자세히 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="group hover-scale smooth-transition border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">뉴스</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  동양서예협회의 최신 소식을 확인하세요
                </p>
                <Button asChild variant="ghost" className="p-0 h-auto text-primary hover:text-primary">
                  <Link href="/news">
                    자세히 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              문의 및 연락처
            </h2>
            <p className="text-lg text-muted-foreground">
              동양서예협회에 대한 문의사항이 있으시면 언제든 연락주세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  주소
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  서울시 성북구 보문로 57-1,<br />
                  중앙빌딩 6층 (보문동7가)
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  연락처
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ☎ 0502-5550-8700<br />
                  FAX: 0504-256-6600
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  이메일
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  info@orientalcalligraphy.org
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>고유번호</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  209-82-11380
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SEO 및 메타데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "동양서예협회 갤러리",
            "description": "동양서예협회의 서예 작품, 전시회, 심사위원회, 휘호대회, 시상식 등 다양한 활동을 담은 종합 갤러리. 전통 서예의 정법을 계승하고 현대적 창신을 통해 동양서예의 새로운 미래를 열어갑니다.",
            "url": typeof window !== 'undefined' ? window.location.origin : '',
            "image": data.items.slice(0, 8).map(item => ({
              "@type": "ImageObject",
              "name": item.title,
              "description": item.description,
              "url": typeof window !== 'undefined' ? `${window.location.origin}${item.src}` : item.src,
              "thumbnailUrl": typeof window !== 'undefined' ? `${window.location.origin}${item.thumbnail}` : item.thumbnail
            })),
            "numberOfItems": data.metadata.totalImages,
            "dateModified": data.metadata.lastUpdated,
            "publisher": {
              "@type": "Organization",
              "name": "동양서예협회",
              "logo": {
                "@type": "ImageObject",
                "url": "/logo/Logo & Tagline_white BG.png"
              }
            }
          })
        }}
      />
      
      <Footer />
    </div>
  )
}

// 메타데이터 내보내기 (갤러리 전문 사이트)
export const metadata = {
  title: '동양서예 갤러리 | 사단법인 동양서예협회',
  description: `동양서예협회의 종합 활동 갤러리. ${galleryData.metadata.totalImages}개의 서예 작품, 전시회, 심사위원회, 휘호대회, 시상식 등 다양한 활동 사진을 감상하세요. 전통 서예의 정법 계승과 현대적 창신의 조화.`,
  keywords: ['동양서예', '서예갤러리', '서예작품', '전시회', '휘호대회', '심사위원회', '시상식', '전통서예', '서예협회', '서예전시', '한국서예', '동양문화'],
  openGraph: {
    title: '동양서예 갤러리 | 사단법인 동양서예협회',
    description: `${galleryData.metadata.totalImages}개의 서예 작품, 전시회, 심사위원회, 휘호대회, 시상식 등 종합 활동 기록. 전통과 현대가 조화를 이루는 동양서예의 새로운 패러다임.`,
    type: 'website',
    images: galleryData.items.slice(0, 6).map(item => ({
      url: item.thumbnail,
      alt: item.title,
      width: 800,
      height: 600
    }))
  },
  twitter: {
    card: 'summary_large_image',
    title: '동양서예 갤러리 | 동양서예협회',
    description: `${galleryData.metadata.totalImages}개의 서예 작품 및 협회 활동 종합 갤러리`,
    images: [galleryData.items[0]?.thumbnail]
  }
} 
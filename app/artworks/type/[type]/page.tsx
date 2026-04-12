import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye, Heart, Layers } from 'lucide-react'

const typeData: Record<
  string,
  {
    name: string
    nameEn: string
    description: string
  }
> = {
  traditional: {
    name: '전통',
    nameEn: 'Traditional',
    description:
      '수백 년의 正法을 계승한 전통 서예 작품입니다. 임서(臨書)와 창작을 통해 고전의 정수를 현대에 전합니다.',
  },
  contemporary: {
    name: '현대',
    nameEn: 'Contemporary',
    description: '전통의 정신을 바탕으로 현대적 조형감각과 새로운 매체를 접목한 서예 예술입니다.',
  },
  experimental: {
    name: '실험',
    nameEn: 'Experimental',
    description:
      '서예의 경계를 확장하는 실험적 작품입니다. 디지털, 설치, 퍼포먼스 등 다양한 형식을 탐구합니다.',
  },
}

const typeArtworks: Record<
  string,
  Array<{
    id: string
    title: string
    artist: string
    medium: string
    dimensions: string
    year: number
    genre: string
    imageUrl: string
    isFeatured: boolean
    views: number
    likes: number
    price: number
  }>
> = {
  traditional: [
    {
      id: 't1',
      title: '해서 천자문 전작',
      artist: '김영진',
      medium: '선지에 먹',
      dimensions: '70 × 200 cm',
      year: 2024,
      genre: '해서',
      imageUrl: '/placeholder.svg',
      isFeatured: true,
      views: 312,
      likes: 48,
      price: 2500000,
    },
    {
      id: 't2',
      title: '난정서 행서 임서',
      artist: '한정우',
      medium: '선지에 먹',
      dimensions: '50 × 100 cm',
      year: 2024,
      genre: '행서',
      imageUrl: '/placeholder.svg',
      isFeatured: true,
      views: 278,
      likes: 52,
      price: 1800000,
    },
    {
      id: 't3',
      title: '궁체 훈민정음 서문',
      artist: '윤서영',
      medium: '순지에 먹',
      dimensions: '50 × 100 cm',
      year: 2024,
      genre: '한글서예',
      imageUrl: '/placeholder.svg',
      isFeatured: false,
      views: 287,
      likes: 44,
      price: 1500000,
    },
    {
      id: 't4',
      title: '예서 조전비 임서',
      artist: '최영미',
      medium: '선지에 먹',
      dimensions: '65 × 130 cm',
      year: 2024,
      genre: '예서',
      imageUrl: '/placeholder.svg',
      isFeatured: false,
      views: 201,
      likes: 33,
      price: 1200000,
    },
    {
      id: 't5',
      title: '전서 산해경 발췌',
      artist: '박철민',
      medium: '화선지에 먹',
      dimensions: '55 × 110 cm',
      year: 2023,
      genre: '전서',
      imageUrl: '/placeholder.svg',
      isFeatured: true,
      views: 189,
      likes: 29,
      price: 1600000,
    },
    {
      id: 't6',
      title: '반야심경 해서',
      artist: '이한영',
      medium: '순지에 먹',
      dimensions: '60 × 120 cm',
      year: 2023,
      genre: '해서',
      imageUrl: '/placeholder.svg',
      isFeatured: false,
      views: 256,
      likes: 41,
      price: 2000000,
    },
  ],
  contemporary: [
    {
      id: 'ct1',
      title: '묵상 - 현대적 해석',
      artist: '최영미',
      medium: '한지에 먹, 아크릴',
      dimensions: '80 × 120 cm',
      year: 2024,
      genre: '현대서예',
      imageUrl: '/placeholder.svg',
      isFeatured: true,
      views: 367,
      likes: 72,
      price: 3200000,
    },
    {
      id: 'ct2',
      title: '서예와 공간',
      artist: '이정화',
      medium: '혼합매체',
      dimensions: '100 × 150 cm',
      year: 2024,
      genre: '현대서예',
      imageUrl: '/placeholder.svg',
      isFeatured: true,
      views: 245,
      likes: 48,
      price: 2800000,
    },
    {
      id: 'ct3',
      title: '자연의 문자',
      artist: '한정우',
      medium: '한지에 천연염료',
      dimensions: '90 × 90 cm',
      year: 2023,
      genre: '현대서예',
      imageUrl: '/placeholder.svg',
      isFeatured: false,
      views: 198,
      likes: 35,
      price: 2200000,
    },
    {
      id: 'ct4',
      title: '디지털 서예 - 흐름',
      artist: '정대호',
      medium: '디지털 프린트',
      dimensions: '90 × 90 cm',
      year: 2024,
      genre: '현대서예',
      imageUrl: '/placeholder.svg',
      isFeatured: false,
      views: 312,
      likes: 59,
      price: 1800000,
    },
  ],
  experimental: [
    {
      id: 'e1',
      title: '해체와 구성 Ⅱ',
      artist: '이정화',
      medium: '설치: 한지, 먹, LED',
      dimensions: '가변크기',
      year: 2024,
      genre: '실험서예',
      imageUrl: '/placeholder.svg',
      isFeatured: true,
      views: 456,
      likes: 89,
      price: 5000000,
    },
    {
      id: 'e2',
      title: '사운드 캘리그래피',
      artist: '정대호',
      medium: '영상, 사운드',
      dimensions: '영상 12분',
      year: 2024,
      genre: '실험서예',
      imageUrl: '/placeholder.svg',
      isFeatured: true,
      views: 334,
      likes: 67,
      price: 0,
    },
    {
      id: 'e3',
      title: '묵적(墨跡)의 재구성',
      artist: '최영미',
      medium: '한지, 먹, 혼합재료',
      dimensions: '200 × 300 cm',
      year: 2023,
      genre: '실험서예',
      imageUrl: '/placeholder.svg',
      isFeatured: false,
      views: 278,
      likes: 54,
      price: 4200000,
    },
  ],
}

const validTypes = Object.keys(typeData) as Array<keyof typeof typeData>

export function generateStaticParams() {
  return validTypes.map(type => ({ type }))
}

export function generateMetadata({ params }: { params: { type: string } }): Metadata {
  const type = typeData[params.type]
  if (!type) {
    return { title: '유형을 찾을 수 없습니다 | 동양서예협회' }
  }
  return {
    title: `${type.name}(${type.nameEn}) 작품 | 동양서예협회`,
    description: type.description,
    openGraph: {
      title: `${type.name} 작품 | 동양서예협회`,
      description: type.description,
    },
  }
}

function formatPrice(price: number): string {
  if (price === 0) return '비매품'
  return `₩${price.toLocaleString()}`
}

export default function TypePage({ params }: { params: { type: string } }) {
  const type = typeData[params.type]
  if (!type) return notFound()

  const artworks = typeArtworks[params.type] ?? []

  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4'>
            <Link href='/artworks' className='hover:text-foreground transition-colors'>
              작품
            </Link>
            <span>/</span>
            <span className='text-foreground'>유형별</span>
            <span>/</span>
            <span className='text-foreground'>{type.name}</span>
          </div>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            {type.nameEn}
          </p>
          <h1 className='text-3xl md:text-5xl font-bold mb-2'>{type.name} 작품</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-4'>
            {type.description}
          </p>
          <p className='text-sm text-muted-foreground mt-4'>총 {artworks.length}개 작품</p>
        </div>
      </section>

      <section className='border-b border-border bg-card'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/artworks'>
              <Button variant='outline' size='sm' className='flex items-center gap-2'>
                <ArrowLeft className='h-4 w-4' />
                전체 작품 보기
              </Button>
            </Link>
            <div className='flex items-center gap-2'>
              <Layers className='h-4 w-4 text-scholar-red' />
              <span className='text-sm font-medium'>{type.name}</span>
            </div>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        {artworks.length === 0 ? (
          <div className='text-center py-16'>
            <Layers className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
            <p className='text-lg font-medium mb-2'>등록된 작품이 없습니다</p>
            <p className='text-sm text-muted-foreground'>곧 새로운 작품이 등록될 예정입니다.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
            {artworks.map(artwork => (
              <Card
                key={artwork.id}
                className='group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300'
              >
                <Link href={`/artworks/${artwork.id}`}>
                  <div className='relative aspect-[3/4] overflow-hidden'>
                    <Image
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      fill
                      className='object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                    <div className='absolute top-3 left-3 flex flex-col gap-2'>
                      {artwork.isFeatured && (
                        <Badge className='bg-scholar-red text-white text-xs'>추천</Badge>
                      )}
                    </div>
                    <div className='absolute bottom-3 right-3 flex gap-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <span className='flex items-center gap-1'>
                        <Eye className='h-3 w-3' />
                        {artwork.views}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Heart className='h-3 w-3' />
                        {artwork.likes}
                      </span>
                    </div>
                  </div>
                </Link>
                <CardContent className='p-4'>
                  <h3 className='font-medium text-sm line-clamp-1'>{artwork.title}</h3>
                  <p className='text-xs text-muted-foreground mt-1'>{artwork.artist}</p>
                  <div className='flex items-center justify-between text-xs text-muted-foreground mt-2'>
                    <span className='line-clamp-1'>{artwork.medium}</span>
                    <span>{artwork.year}</span>
                  </div>
                  <div className='flex items-center gap-1.5 mt-2'>
                    <Badge variant='outline' className='text-xs px-2 py-0'>
                      {artwork.genre}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className='px-4 pb-4 pt-0'>
                  <div className='flex items-center justify-between w-full'>
                    <span className='font-semibold text-sm'>{formatPrice(artwork.price)}</span>
                    <span className='text-xs text-muted-foreground'>{artwork.dimensions}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className='bg-muted/30 border-t border-border'>
        <div className='container mx-auto px-4 py-8 md:py-12'>
          <h2 className='text-lg md:text-xl font-semibold mb-6 text-center'>다른 유형 둘러보기</h2>
          <div className='grid grid-cols-3 gap-3 md:gap-4 max-w-lg mx-auto'>
            {validTypes.map(key => {
              const t = typeData[key]
              return (
                <Link
                  key={key}
                  href={`/artworks/type/${key}`}
                  className={`p-3 md:p-4 text-center rounded-lg border transition-all hover:shadow-md ${
                    key === params.type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-muted'
                  }`}
                >
                  <h3 className='font-medium text-sm'>{t.name}</h3>
                  <p className='text-xs opacity-80 mt-1'>{t.nameEn}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Brush } from 'lucide-react'
import { genreData, genreArtworks, validGenres } from './_data/genres'
import { GenreArtworkCard } from './_components/genre-artwork-card'
import { GenreNavGrid } from './_components/genre-nav-grid'

export function generateStaticParams() {
  return validGenres.map(genre => ({ genre }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>
}): Promise<Metadata> {
  const { genre } = await params
  const genreInfo = genreData[genre]
  if (!genreInfo) {
    return { title: '서체를 찾을 수 없습니다 | 동양서예협회' }
  }
  return {
    title: `${genreInfo.name}(${genreInfo.chinese}) 작품 | 동양서예협회`,
    description: genreInfo.description,
    openGraph: {
      title: `${genreInfo.name}(${genreInfo.chinese}) 작품 | 동양서예협회`,
      description: genreInfo.description,
    },
  }
}

export default async function GenrePage({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params
  const genreInfo = genreData[genre]
  if (!genreInfo) return notFound()

  const artworks = genreArtworks[genre] ?? []

  return (
    <div className='min-h-screen bg-transparent'>
      <PageHero
        {...PAGE_HERO_MARKS.artworks}
        tier='band'
        tc={genreInfo.chinese}
        title={genreInfo.name}
        lede={genreInfo.description}
        crumbs={[{ label: '작품', href: '/artworks' }, { label: genreInfo.name }]}
      >
        <HeroFacts facts={[{ label: '총 작품', value: `${artworks.length}개` }]} />
      </PageHero>

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
              <Brush className='h-4 w-4 text-scholar-red' />
              <span className='text-sm font-medium'>{genreInfo.name}</span>
            </div>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-10 md:py-16'>
        {artworks.length === 0 ? (
          <div className='text-center py-16'>
            <Brush className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
            <p className='text-lg font-medium mb-2'>등록된 작품이 없습니다</p>
            <p className='text-sm text-muted-foreground'>곧 새로운 작품이 등록될 예정입니다.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
            {artworks.map(artwork => (
              <GenreArtworkCard key={artwork.id} artwork={artwork} genreName={genreInfo.name} />
            ))}
          </div>
        )}
      </section>

      <GenreNavGrid currentGenre={genre} />

      <LayoutFooter />
    </div>
  )
}

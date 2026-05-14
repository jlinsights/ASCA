import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
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
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4'>
            <Link href='/artworks' className='hover:text-foreground transition-colors'>
              작품
            </Link>
            <span>/</span>
            <span className='text-foreground'>서체별</span>
            <span>/</span>
            <span className='text-foreground'>{genreInfo.name}</span>
          </div>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            {genreInfo.nameEn}
          </p>
          <h1 className='text-3xl md:text-5xl font-bold mb-2'>
            {genreInfo.name}
            <span className='text-xl md:text-3xl text-muted-foreground ml-3'>
              {genreInfo.chinese}
            </span>
          </h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-4'>
            {genreInfo.description}
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
              <Brush className='h-4 w-4 text-scholar-red' />
              <span className='text-sm font-medium'>{genreInfo.name}</span>
            </div>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
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

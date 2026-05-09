import Link from 'next/link'
import { genreData, validGenres } from '../_data/genres'

interface GenreNavGridProps {
  currentGenre: string
}

export function GenreNavGrid({ currentGenre }: GenreNavGridProps) {
  return (
    <section className='bg-muted/30 border-t border-border'>
      <div className='container mx-auto px-4 py-8 md:py-12'>
        <h2 className='text-lg md:text-xl font-semibold mb-6 text-center'>다른 서체 둘러보기</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4'>
          {validGenres.map(key => {
            const g = genreData[key]!
            return (
              <Link
                key={key}
                href={`/artworks/genre/${key}`}
                className={`p-3 md:p-4 text-center rounded-lg border transition-all hover:shadow-md ${
                  key === currentGenre
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-muted'
                }`}
              >
                <h3 className='font-medium text-sm'>{g.name}</h3>
                <p className='text-xs opacity-80 mt-1'>{g.chinese}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

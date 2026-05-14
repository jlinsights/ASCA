import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Heart } from 'lucide-react'
import type { GenreArtwork } from '../_data/genres'

interface GenreArtworkCardProps {
  artwork: GenreArtwork
  genreName: string
}

/**
 * Card displaying a single genre artwork with hover overlay (views/likes) and a genre badge.
 */
export function GenreArtworkCard({ artwork, genreName }: GenreArtworkCardProps) {
  return (
    <Card className='group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300'>
      <Link href={`/artworks/${artwork.id}`}>
        <div className='relative aspect-[3/4] overflow-hidden'>
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
            className='object-cover transition-transform duration-300 group-hover:scale-105'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          {artwork.isFeatured && (
            <div className='absolute top-3 left-3'>
              <Badge className='bg-scholar-red text-white text-xs'>추천</Badge>
            </div>
          )}
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
      </CardContent>
      <CardFooter className='px-4 pb-4 pt-0'>
        <div className='flex items-center justify-between w-full'>
          <Badge variant='outline' className='text-xs'>
            {genreName}
          </Badge>
          <span className='text-xs text-muted-foreground'>{artwork.dimensions}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

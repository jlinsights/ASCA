'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Artwork } from './artwork-types'
import { formatPrice } from './artwork-utils'

interface ArtworkRelatedProps {
  artworks: Artwork[]
}

export function ArtworkRelated({ artworks }: ArtworkRelatedProps) {
  if (artworks.length === 0) return null

  return (
    <section className='container mx-auto px-4 py-8 border-t'>
      <h2 className='text-3xl font-normal uppercase mb-8'>관련 작품</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
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
                {artwork.isFeatured && (
                  <div className='absolute top-2 right-2'>
                    <Badge className='bg-red-600 text-white'>추천</Badge>
                  </div>
                )}
              </div>
            </Link>
            <CardContent className='p-4'>
              <h3 className='font-medium text-sm line-clamp-1 mb-1'>{artwork.title}</h3>
              <p className='text-xs text-muted-foreground mb-2'>{artwork.artist}</p>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-semibold'>
                  {formatPrice(artwork.price, artwork.currency)}
                </p>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <Eye className='w-3 h-3' />
                  {artwork.views}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

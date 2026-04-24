'use client'

import Image from 'next/image'
import { Download, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import type { Artwork } from './artwork-types'

interface ArtworkGalleryProps {
  artwork: Artwork
  currentImageIndex: number
  onImageSelect: (index: number) => void
}

export function ArtworkGallery({
  artwork,
  currentImageIndex,
  onImageSelect,
}: ArtworkGalleryProps) {
  const currentImage = artwork.images[currentImageIndex] || artwork.imageUrl

  return (
    <div className='space-y-4'>
      {/* Main Image */}
      <div className='relative aspect-[4/5] overflow-hidden rounded-lg bg-muted'>
        <Image src={currentImage} alt={artwork.title} fill className='object-cover' />

        {/* Image Controls */}
        <div className='absolute top-4 right-4 flex gap-2'>
          <Dialog>
            <DialogTrigger asChild>
              <Button size='sm' variant='secondary' className='h-8 w-8 p-0'>
                <ZoomIn className='h-4 w-4' />
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-4xl'>
              <div className='relative aspect-[4/5] overflow-hidden rounded-lg'>
                <Image
                  src={currentImage}
                  alt={artwork.title}
                  fill
                  className='object-contain'
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button size='sm' variant='secondary' className='h-8 w-8 p-0'>
            <Download className='h-4 w-4' />
          </Button>
        </div>

        {/* Image Navigation dots */}
        {artwork.images.length > 1 && (
          <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2'>
            {artwork.images.map((_, index) => (
              <button
                key={index}
                onClick={() => onImageSelect(index)}
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
        <div className='grid grid-cols-4 gap-2'>
          {artwork.images.map((image, index) => (
            <button
              key={index}
              onClick={() => onImageSelect(index)}
              className={`relative aspect-square overflow-hidden rounded border-2 transition-colors ${
                index === currentImageIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Image
                src={image}
                alt={`${artwork.title} ${index + 1}`}
                fill
                className='object-cover'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

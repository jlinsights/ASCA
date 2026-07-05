'use client'

import type { MouseEvent } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Exhibition, ExhibitionArtwork } from './types'

interface GalleryViewProps {
  exhibition: Exhibition
  zoom: number
  position: { x: number; y: number }
  wallColor: string
  lightingEffect: string
  onMouseDown: (e: MouseEvent) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: () => void
  onSelectArtwork: (artwork: ExhibitionArtwork) => void
}

export function GalleryView({
  exhibition,
  zoom,
  position,
  wallColor,
  lightingEffect,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onSelectArtwork,
}: GalleryViewProps) {
  return (
    <div
      role='application'
      aria-label={`Virtual gallery: ${exhibition.title}. Drag to pan the view.`}
      className={cn('relative w-full h-full overflow-hidden cursor-move', wallColor)}
      style={{
        filter: lightingEffect,
        transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Gallery Floor */}
      <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ink-black/10 to-transparent' />

      {/* Artworks positioned on walls */}
      {exhibition.artworks.map(artwork => (
        <div
          key={artwork.id}
          role='button'
          tabIndex={0}
          aria-label={`View artwork: ${artwork.title.english}`}
          className='absolute group cursor-pointer transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-temple-gold focus-visible:outline-none'
          style={{
            left: `${artwork.position.x}%`,
            top: `${artwork.position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => onSelectArtwork(artwork)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelectArtwork(artwork)
            }
          }}
        >
          {/* Artwork Frame */}
          <div className='relative'>
            <div className='p-4 bg-temple-gold/20 rounded-sm shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <div className='relative w-48 h-48'>
                <Image
                  src={artwork.image.url}
                  alt={artwork.title.english}
                  fill
                  className='object-contain'
                  sizes='192px'
                />
              </div>
            </div>

            {/* Artwork Label */}
            <div className='absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <div className='bg-ink-black/80 text-rice-paper px-3 py-1 rounded text-xs font-serif whitespace-nowrap'>
                {artwork.title.original}
              </div>
            </div>

            {/* Gallery Lighting Effect */}
            <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gradient-to-b from-temple-gold/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </div>
        </div>
      ))}

      {/* Gallery Information Placard */}
      <div className='absolute top-8 left-8 bg-ink-black/80 text-rice-paper p-4 rounded-lg max-w-md'>
        <h3 className='font-calligraphy text-lg font-bold mb-2'>{exhibition.title}</h3>
        <p className='font-serif text-sm mb-2'>{exhibition.description}</p>
        <div className='text-xs opacity-80'>
          <p>Curator: {exhibition.curator}</p>
          <p>Theme: {exhibition.theme}</p>
          <p>Period: {exhibition.period}</p>
        </div>
      </div>
    </div>
  )
}

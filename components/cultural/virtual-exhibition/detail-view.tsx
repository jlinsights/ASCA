'use client'

import type { RefObject } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ZoomIn, ZoomOut, RotateCcw, Volume2, Camera, Download, Share2 } from 'lucide-react'
import type { ExhibitionArtwork } from './types'

interface DetailViewProps {
  selectedArtwork: ExhibitionArtwork | null
  zoom: number
  onZoom: (delta: number) => void
  onResetView: () => void
  audioRef: RefObject<HTMLAudioElement | null>
}

export function DetailView({
  selectedArtwork,
  zoom,
  onZoom,
  onResetView,
  audioRef,
}: DetailViewProps) {
  if (!selectedArtwork) return null

  return (
    <div className='relative w-full h-full bg-lacquer-black text-rice-paper overflow-auto'>
      <div className='grid grid-cols-1 lg:grid-cols-2 h-full'>
        {/* Artwork Image */}
        <div className='relative flex items-center justify-center p-8 bg-gradient-to-br from-ink-black to-lacquer-black'>
          <div className='relative w-full h-full max-w-2xl max-h-[80vh]'>
            <Image
              src={selectedArtwork.image.highRes}
              alt={selectedArtwork.title.english}
              fill
              className='object-contain shadow-2xl rounded-lg'
              sizes='(max-width: 1024px) 100vw, 50vw'
              style={{
                filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))',
                transform: `scale(${zoom})`,
              }}
            />

            {/* Zoom Controls */}
            <div className='absolute top-4 right-4 flex gap-2'>
              <Button
                size='sm'
                variant='secondary'
                onClick={() => onZoom(0.2)}
                className='bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30'
              >
                <ZoomIn className='w-4 h-4' />
              </Button>
              <Button
                size='sm'
                variant='secondary'
                onClick={() => onZoom(-0.2)}
                className='bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30'
              >
                <ZoomOut className='w-4 h-4' />
              </Button>
              <Button
                size='sm'
                variant='secondary'
                onClick={onResetView}
                className='bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30'
              >
                <RotateCcw className='w-4 h-4' />
              </Button>
            </div>

            {/* Detail Markers */}
            {selectedArtwork.image.details.map((detail, index) => (
              <div
                key={index}
                className='absolute w-3 h-3 bg-temple-gold rounded-full border-2 border-rice-paper cursor-pointer hover:scale-150 transition-transform duration-200'
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + index * 10}%`,
                }}
                title={detail}
              />
            ))}
          </div>
        </div>

        {/* Artwork Information */}
        <div className='p-8 overflow-y-auto'>
          <div className='space-y-6'>
            {/* Title Section */}
            <div>
              <h2 className='font-calligraphy text-3xl font-bold mb-2'>
                {selectedArtwork.title.original}
              </h2>
              <p className='font-english text-xl text-rice-paper/80 mb-1'>
                {selectedArtwork.title.romanized}
              </p>
              <p className='font-english text-lg text-rice-paper/60 italic'>
                "{selectedArtwork.title.english}"
              </p>
            </div>

            {/* Artist Information */}
            <div className='border-l-2 border-temple-gold pl-4'>
              <h3 className='font-serif text-lg font-semibold'>{selectedArtwork.artist.name}</h3>
              <p className='text-rice-paper/70'>{selectedArtwork.artist.period}</p>
              <Badge variant='outline' className='mt-2 border-temple-gold text-temple-gold'>
                {selectedArtwork.artist.school}
              </Badge>
            </div>

            {/* Technical Details */}
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <h4 className='font-semibold text-temple-gold mb-2'>Technical Details</h4>
                <p className='text-rice-paper/80'>
                  <span className='font-medium'>Medium:</span> {selectedArtwork.medium}
                </p>
                <p className='text-rice-paper/80'>
                  <span className='font-medium'>Dimensions:</span>{' '}
                  {selectedArtwork.dimensions.width} × {selectedArtwork.dimensions.height}{' '}
                  {selectedArtwork.dimensions.unit}
                </p>
                <p className='text-rice-paper/80'>
                  <span className='font-medium'>Year:</span> {selectedArtwork.year}
                </p>
              </div>
              <div>
                <h4 className='font-semibold text-temple-gold mb-2'>Provenance</h4>
                <p className='text-rice-paper/80 text-sm leading-relaxed'>
                  {selectedArtwork.provenance}
                </p>
              </div>
            </div>

            {/* Descriptions */}
            <div className='space-y-4'>
              <div>
                <h4 className='font-semibold text-temple-gold mb-2'>Cultural Significance</h4>
                <p className='text-rice-paper/80 leading-relaxed'>
                  {selectedArtwork.description.cultural}
                </p>
              </div>

              <div>
                <h4 className='font-semibold text-temple-gold mb-2'>Artistic Analysis</h4>
                <p className='text-rice-paper/80 leading-relaxed'>
                  {selectedArtwork.description.technical}
                </p>
              </div>

              <div>
                <h4 className='font-semibold text-temple-gold mb-2'>Historical Context</h4>
                <p className='text-rice-paper/80 leading-relaxed'>
                  {selectedArtwork.description.historical}
                </p>
              </div>
            </div>

            {/* Audio Guide */}
            {selectedArtwork.audio && (
              <div className='bg-temple-gold/10 rounded-lg p-4 border border-temple-gold/20'>
                <h4 className='font-semibold text-temple-gold mb-2 flex items-center gap-2'>
                  <Volume2 className='w-4 h-4' />
                  Audio Guide
                </h4>
                <audio
                  ref={audioRef}
                  src={selectedArtwork.audio.url}
                  controls
                  className='w-full mb-2'
                />
                <p className='text-rice-paper/70 text-sm leading-relaxed'>
                  {selectedArtwork.audio.transcript}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex gap-3 pt-4'>
              <Button className='flex-1 bg-temple-gold text-ink-black hover:bg-temple-gold/80'>
                <Camera className='w-4 h-4 mr-2' />
                Save to Collection
              </Button>
              <Button
                variant='outline'
                className='border-rice-paper/30 text-rice-paper hover:bg-rice-paper/10'
              >
                <Download className='w-4 h-4' />
              </Button>
              <Button
                variant='outline'
                className='border-rice-paper/30 text-rice-paper hover:bg-rice-paper/10'
              >
                <Share2 className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

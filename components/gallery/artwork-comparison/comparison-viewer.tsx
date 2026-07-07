'use client'

import type { KeyboardEvent, MouseEvent, WheelEvent, MutableRefObject } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeftRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Artwork } from '@/lib/types/gallery'
import type { ComparisonMode, ViewerState } from './types'

interface ComparisonViewProps {
  selectedArtworks: Artwork[]
  comparisonMode: ComparisonMode
  viewerStates: ViewerState[]
  imageRefs: MutableRefObject<(HTMLImageElement | null)[]>
  onMouseDown: (index: number, e: MouseEvent) => void
  onMouseMove: (index: number, e: MouseEvent) => void
  onMouseUp: (index: number) => void
  onWheel: (index: number, e: WheelEvent) => void
  onZoom: (index: number, delta: number, centerX?: number, centerY?: number) => void
  onPan: (index: number, deltaX: number, deltaY: number) => void
  onResetView: (index?: number) => void
}

export function ComparisonView({
  selectedArtworks,
  comparisonMode,
  viewerStates,
  imageRefs,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onZoom,
  onPan,
  onResetView,
}: ComparisonViewProps) {
  const handleViewerKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    const panStep = 20
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        onPan(index, panStep, 0)
        break
      case 'ArrowRight':
        e.preventDefault()
        onPan(index, -panStep, 0)
        break
      case 'ArrowUp':
        e.preventDefault()
        onPan(index, 0, panStep)
        break
      case 'ArrowDown':
        e.preventDefault()
        onPan(index, 0, -panStep)
        break
      case '+':
      case '=':
        e.preventDefault()
        onZoom(index, 0.2)
        break
      case '-':
        e.preventDefault()
        onZoom(index, -0.2)
        break
      default:
        break
    }
  }

  const renderImageViewer = (artwork: Artwork, index: number) => {
    const viewerState = viewerStates[index]
    const primaryImage = artwork.images.find(img => img.type === 'primary') || artwork.images[0]

    if (!primaryImage || !viewerState) return null

    return (
      <div
        role='application'
        tabIndex={0}
        aria-label={`Artwork viewer: ${artwork.title.english}. Use arrow keys to pan, plus and minus to zoom.`}
        className='relative bg-ink-black/5 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-celadon-green focus-visible:outline-none'
        style={{ height: '400px' }}
        onMouseDown={e => onMouseDown(index, e)}
        onMouseMove={e => onMouseMove(index, e)}
        onMouseUp={() => onMouseUp(index)}
        onMouseLeave={() => onMouseUp(index)}
        onWheel={e => onWheel(index, e)}
        onKeyDown={e => handleViewerKeyDown(index, e)}
      >
        <div
          className='relative w-full h-full flex items-center justify-center'
          style={{
            transform: `scale(${viewerState.scale}) translate(${viewerState.offsetX}px, ${viewerState.offsetY}px)`,
            transition: viewerState.isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          <div className='relative w-full h-full max-w-2xl max-h-[80vh]'>
            <Image
              ref={(el: HTMLImageElement | null) => {
                imageRefs.current[index] = el
              }}
              src={primaryImage.urls.large}
              alt={artwork.title.english}
              fill
              className='object-contain select-none'
              sizes='(max-width: 1024px) 100vw, 50vw'
              draggable={false}
            />
          </div>

          {/* Regions Overlay */}
          {comparisonMode.showRegions && primaryImage.regions && (
            <div className='absolute inset-0'>
              {primaryImage.regions.map(region => (
                <div
                  key={region.id}
                  className='absolute border-2 border-celadon-green bg-celadon-green/20 hover:bg-celadon-green/30 transition-colors'
                  style={{
                    left: `${region.coordinates.x}%`,
                    top: `${region.coordinates.y}%`,
                    width: `${region.coordinates.width}%`,
                    height: `${region.coordinates.height}%`,
                  }}
                  title={region.description}
                />
              ))}
            </div>
          )}

          {/* Annotations Overlay */}
          {comparisonMode.showAnnotations && primaryImage.annotations && (
            <div className='absolute inset-0'>
              {primaryImage.annotations.map(annotation => (
                <div
                  key={annotation.id}
                  className='absolute w-4 h-4 bg-temple-gold border-2 border-ink-black rounded-full cursor-pointer hover:scale-125 transition-transform'
                  style={{
                    left: `${annotation.position.x}%`,
                    top: `${annotation.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={annotation.title}
                />
              ))}
            </div>
          )}
        </div>

        {/* Image Info */}
        <div className='absolute top-4 left-4 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-3 max-w-xs'>
          <h4 className='font-calligraphy font-semibold text-ink-black mb-1'>
            {artwork.title.original}
          </h4>
          <p className='text-sm text-ink-black/70'>{artwork.title.english}</p>
          <p className='text-xs text-ink-black/60 mt-1'>{artwork.artist.name}</p>
          {artwork.historical_context.creation_date.period && (
            <p className='text-xs text-ink-black/60'>
              {artwork.historical_context.creation_date.period}
            </p>
          )}
        </div>

        {/* Zoom Controls */}
        <div className='absolute top-4 right-4 flex flex-col gap-1 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-1'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onZoom(index, 0.2)}
            className='h-8 w-8 p-0'
            aria-label='Zoom in'
          >
            <ZoomIn className='w-4 h-4' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onZoom(index, -0.2)}
            className='h-8 w-8 p-0'
            aria-label='Zoom out'
          >
            <ZoomOut className='w-4 h-4' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onResetView(index)}
            className='h-8 w-8 p-0'
            aria-label='Reset view'
          >
            <RotateCcw className='w-4 h-4' />
          </Button>
        </div>

        {/* Zoom Level Indicator */}
        <div className='absolute bottom-4 left-4 bg-silk-cream/90 backdrop-blur-sm rounded-lg px-3 py-1'>
          <span className='text-sm font-medium text-ink-black'>
            {(viewerState.scale * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    )
  }

  if (selectedArtworks.length === 0) {
    return (
      <Card className='text-center py-12'>
        <CardContent>
          <ArrowLeftRight className='w-12 h-12 text-ink-black/20 mx-auto mb-4' />
          <h3 className='font-calligraphy text-lg font-semibold text-ink-black mb-2'>
            No Artworks Selected
          </h3>
          <p className='text-ink-black/60'>
            Select at least one artwork from the gallery above to begin comparison.
          </p>
        </CardContent>
      </Card>
    )
  }

  switch (comparisonMode.type) {
    case 'side-by-side':
      return (
        <div
          className={cn(
            'grid gap-6',
            selectedArtworks.length === 1 && 'grid-cols-1',
            selectedArtworks.length === 2 && 'grid-cols-1 lg:grid-cols-2',
            selectedArtworks.length === 3 && 'grid-cols-1 lg:grid-cols-3',
            selectedArtworks.length >= 4 && 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4'
          )}
        >
          {selectedArtworks.map((artwork, index) => (
            <div key={artwork.id} className='space-y-2'>
              {renderImageViewer(artwork, index)}
            </div>
          ))}
        </div>
      )

    case 'overlay':
      if (selectedArtworks.length < 2) {
        const firstArtwork = selectedArtworks[0]
        if (!firstArtwork) return null
        return renderImageViewer(firstArtwork, 0)
      }
      // TODO: Implement overlay mode
      return (
        <Card className='text-center py-12'>
          <CardContent>
            <p className='text-ink-black/60'>Overlay mode is under development. Coming soon!</p>
          </CardContent>
        </Card>
      )

    case 'split-view':
      // TODO: Implement split view mode
      return (
        <Card className='text-center py-12'>
          <CardContent>
            <p className='text-ink-black/60'>Split view mode is under development. Coming soon!</p>
          </CardContent>
        </Card>
      )

    case 'grid':
      // TODO: Implement grid mode
      return (
        <Card className='text-center py-12'>
          <CardContent>
            <p className='text-ink-black/60'>Grid mode is under development. Coming soon!</p>
          </CardContent>
        </Card>
      )

    default:
      return null
  }
}

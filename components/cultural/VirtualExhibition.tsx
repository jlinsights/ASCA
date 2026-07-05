'use client'

import { Button } from '@/components/ui/button'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Navigation,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VirtualExhibitionProps } from './virtual-exhibition/types'
import { useVirtualExhibition } from './virtual-exhibition/use-virtual-exhibition'
import { GalleryView } from './virtual-exhibition/gallery-view'
import { DetailView } from './virtual-exhibition/detail-view'

// ===============================
// Main Component (shell)
// ===============================

function VirtualExhibition({ exhibition, className }: VirtualExhibitionProps) {
  const {
    selectedArtwork,
    setSelectedArtwork,
    zoom,
    position,
    isFullscreen,
    audioEnabled,
    currentView,
    setCurrentView,
    galleryRef,
    audioRef,
    handleZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
    toggleFullscreen,
    toggleAudio,
    getWallColor,
    getLightingEffect,
  } = useVirtualExhibition({ exhibition })

  return (
    <div ref={galleryRef} className={cn('relative w-full h-screen bg-ink-black', className)}>
      {/* Navigation Controls */}
      <div className='absolute top-4 left-4 z-10 flex gap-2'>
        <Button
          variant={currentView === 'gallery' ? 'default' : 'secondary'}
          size='sm'
          onClick={() => setCurrentView('gallery')}
          className={cn(
            currentView === 'gallery'
              ? 'bg-temple-gold text-ink-black'
              : 'bg-silk-cream/20 text-rice-paper'
          )}
        >
          <Navigation className='w-4 h-4 mr-2' />
          Gallery
        </Button>
        {selectedArtwork && (
          <Button
            variant={currentView === 'detail' ? 'default' : 'secondary'}
            size='sm'
            onClick={() => setCurrentView('detail')}
            className={cn(
              currentView === 'detail'
                ? 'bg-temple-gold text-ink-black'
                : 'bg-silk-cream/20 text-rice-paper'
            )}
          >
            <Eye className='w-4 h-4 mr-2' />
            Detail
          </Button>
        )}
      </div>

      {/* View Controls */}
      <div className='absolute top-4 right-4 z-10 flex gap-2'>
        {currentView === 'gallery' && (
          <>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => handleZoom(0.2)}
              className='bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30'
            >
              <ZoomIn className='w-4 h-4' />
            </Button>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => handleZoom(-0.2)}
              className='bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30'
            >
              <ZoomOut className='w-4 h-4' />
            </Button>
            <Button
              variant='secondary'
              size='sm'
              onClick={resetView}
              className='bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30'
            >
              <RotateCcw className='w-4 h-4' />
            </Button>
          </>
        )}

        {exhibition.ambiance.music && (
          <Button
            variant='secondary'
            size='sm'
            onClick={toggleAudio}
            className='bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30'
          >
            {audioEnabled ? <Volume2 className='w-4 h-4' /> : <VolumeX className='w-4 h-4' />}
          </Button>
        )}

        <Button
          variant='secondary'
          size='sm'
          onClick={toggleFullscreen}
          className='bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30'
        >
          {isFullscreen ? <Minimize className='w-4 h-4' /> : <Maximize className='w-4 h-4' />}
        </Button>
      </div>

      {/* Back Button (Detail View) */}
      {currentView === 'detail' && (
        <Button
          variant='secondary'
          size='sm'
          onClick={() => setCurrentView('gallery')}
          className='absolute top-4 left-20 z-10 bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30'
        >
          ← Back to Gallery
        </Button>
      )}

      {/* Main Content */}
      <div className='w-full h-full'>
        {currentView === 'gallery' && (
          <GalleryView
            exhibition={exhibition}
            zoom={zoom}
            position={position}
            wallColor={getWallColor()}
            lightingEffect={getLightingEffect()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onSelectArtwork={artwork => {
              setSelectedArtwork(artwork)
              setCurrentView('detail')
            }}
          />
        )}
        {currentView === 'detail' && (
          <DetailView
            selectedArtwork={selectedArtwork}
            zoom={zoom}
            onZoom={handleZoom}
            onResetView={resetView}
            audioRef={audioRef}
          />
        )}
      </div>

      {/* Background Audio */}
      {exhibition.ambiance.soundscape && (
        <audio ref={audioRef} src={exhibition.ambiance.soundscape} loop preload='auto' />
      )}

      {/* Accessibility Instructions */}
      <div className='sr-only'>
        <p>
          Virtual exhibition space. Use arrow keys to navigate, space to select artworks, and escape
          to return to gallery view.
        </p>
        <p>
          Current exhibition: {exhibition.title} curated by {exhibition.curator}
        </p>
        <p>
          This exhibition contains {exhibition.artworks.length} artworks focusing on{' '}
          {exhibition.theme}
        </p>
      </div>
    </div>
  )
}

export default VirtualExhibition

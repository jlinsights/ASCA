'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeftRight,
  RotateCcw,
  ZoomIn,
  Maximize,
  Minimize,
  Grid3X3,
  BookOpen,
  Square,
  Move,
  MousePointer,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ArtworkComparisonProps } from './artwork-comparison/types'
import { useArtworkComparison } from './artwork-comparison/use-artwork-comparison'
import { ComparisonView } from './artwork-comparison/comparison-viewer'
import { AnalysisPanel } from './artwork-comparison/analysis-panel'

// ===============================
// Main Component (shell)
// ===============================

function ArtworkComparison({
  artworks,
  initialMode = {
    type: 'side-by-side',
    syncZoom: true,
    syncPan: true,
    showAnnotations: false,
    showRegions: true,
  },
  maxArtworks = 4,
  onAnalysisRequest,
  className,
}: ArtworkComparisonProps) {
  const {
    selectedArtworks,
    comparisonMode,
    setComparisonMode,
    viewerStates,
    analysis,
    isAnalyzing,
    isFullscreen,
    setIsFullscreen,
    showAnalysis,
    setShowAnalysis,
    imageRefs,
    addArtwork,
    removeArtwork,
    handleZoom,
    handlePan,
    resetView,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    requestAnalysis,
  } = useArtworkComparison({ artworks, initialMode, maxArtworks, onAnalysisRequest })

  // ===============================
  // Render Functions
  // ===============================

  const renderArtworkSelector = () => (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='font-calligraphy text-lg'>Select Artworks to Compare</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {artworks.map(artwork => {
            const isSelected = selectedArtworks.find(a => a.id === artwork.id)
            const primaryImage =
              artwork.images.find(img => img.type === 'primary') || artwork.images[0]

            return (
              <div
                key={artwork.id}
                className={cn(
                  'relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all',
                  isSelected
                    ? 'border-celadon-green shadow-lg'
                    : 'border-transparent hover:border-celadon-green/50'
                )}
                onClick={() => {
                  if (isSelected) {
                    removeArtwork(artwork.id)
                  } else if (selectedArtworks.length < maxArtworks) {
                    addArtwork(artwork)
                  }
                }}
              >
                <div className='relative aspect-square'>
                  <Image
                    src={primaryImage?.urls.small || '/placeholder-artwork.jpg'}
                    alt={artwork.title.english}
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 50vw, 25vw'
                  />
                </div>

                <div className='absolute inset-0 bg-gradient-to-t from-ink-black/80 to-transparent flex items-end'>
                  <div className='p-3 text-rice-paper'>
                    <h4 className='font-calligraphy font-semibold text-sm line-clamp-1'>
                      {artwork.title.original}
                    </h4>
                    <p className='text-xs opacity-80'>{artwork.artist.name}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className='absolute top-2 right-2 bg-celadon-green text-ink-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'>
                    ✓
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  const renderToolbar = () => (
    <div className='flex items-center justify-between mb-6 p-4 bg-silk-cream/50 rounded-lg'>
      <div className='flex items-center gap-2'>
        {/* Comparison Mode */}
        <div className='flex gap-1 bg-rice-paper rounded-md p-1'>
          {[
            { type: 'side-by-side', icon: ArrowLeftRight, label: 'Side by Side' },
            { type: 'overlay', icon: Square, label: 'Overlay' },
            { type: 'split-view', icon: Grid3X3, label: 'Split View' },
          ].map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              size='sm'
              variant={comparisonMode.type === type ? 'default' : 'ghost'}
              onClick={() => setComparisonMode(prev => ({ ...prev, type: type as any }))}
              title={label}
              className='h-8 w-8 p-0'
            >
              <Icon className='w-4 h-4' />
            </Button>
          ))}
        </div>

        {/* Sync Options */}
        <div className='flex gap-1 bg-rice-paper rounded-md p-1 ml-2'>
          <Button
            size='sm'
            variant={comparisonMode.syncZoom ? 'default' : 'ghost'}
            onClick={() => setComparisonMode(prev => ({ ...prev, syncZoom: !prev.syncZoom }))}
            title='Sync Zoom'
            className='h-8 w-8 p-0'
          >
            <ZoomIn className='w-4 h-4' />
          </Button>
          <Button
            size='sm'
            variant={comparisonMode.syncPan ? 'default' : 'ghost'}
            onClick={() => setComparisonMode(prev => ({ ...prev, syncPan: !prev.syncPan }))}
            title='Sync Pan'
            className='h-8 w-8 p-0'
          >
            <Move className='w-4 h-4' />
          </Button>
        </div>

        {/* Display Options */}
        <div className='flex gap-1 bg-rice-paper rounded-md p-1 ml-2'>
          <Button
            size='sm'
            variant={comparisonMode.showRegions ? 'default' : 'ghost'}
            onClick={() => setComparisonMode(prev => ({ ...prev, showRegions: !prev.showRegions }))}
            title='Show Regions'
            className='h-8 w-8 p-0'
          >
            <Square className='w-4 h-4' />
          </Button>
          <Button
            size='sm'
            variant={comparisonMode.showAnnotations ? 'default' : 'ghost'}
            onClick={() =>
              setComparisonMode(prev => ({ ...prev, showAnnotations: !prev.showAnnotations }))
            }
            title='Show Annotations'
            className='h-8 w-8 p-0'
          >
            <MousePointer className='w-4 h-4' />
          </Button>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        {/* Reset View */}
        <Button
          size='sm'
          variant='outline'
          onClick={() => resetView()}
          title='Reset All Views'
          className='border-ink-black/20'
        >
          <RotateCcw className='w-4 h-4 mr-1' />
          Reset
        </Button>

        {/* Analysis */}
        {onAnalysisRequest && selectedArtworks.length >= 2 && (
          <Button
            size='sm'
            variant='outline'
            onClick={requestAnalysis}
            disabled={isAnalyzing}
            className='border-celadon-green text-celadon-green hover:bg-celadon-green hover:text-ink-black'
          >
            <BookOpen className='w-4 h-4 mr-1' />
            {isAnalyzing ? 'Analyzing…' : 'Analyze'}
          </Button>
        )}

        {/* Fullscreen */}
        <Button
          size='sm'
          variant='outline'
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className='border-ink-black/20'
        >
          {isFullscreen ? <Minimize className='w-4 h-4' /> : <Maximize className='w-4 h-4' />}
        </Button>
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'space-y-6',
        isFullscreen && 'fixed inset-0 z-50 bg-rice-paper p-6 overflow-auto',
        className
      )}
    >
      {/* Header */}
      <div className='text-center'>
        <h1 className='font-calligraphy text-2xl font-bold text-ink-black mb-2'>
          Artwork Comparison Tool
        </h1>
        <p className='text-ink-black/70'>
          Compare artworks side by side to analyze techniques, styles, and cultural elements
        </p>
      </div>

      {/* Artwork Selector */}
      {renderArtworkSelector()}

      {/* Toolbar */}
      {selectedArtworks.length > 0 && renderToolbar()}

      {/* Comparison View */}
      <ComparisonView
        selectedArtworks={selectedArtworks}
        comparisonMode={comparisonMode}
        viewerStates={viewerStates}
        imageRefs={imageRefs}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onZoom={handleZoom}
        onPan={handlePan}
        onResetView={resetView}
      />

      {/* Analysis Panel */}
      <AnalysisPanel
        showAnalysis={showAnalysis}
        analysis={analysis}
        onClose={() => setShowAnalysis(false)}
      />
    </div>
  )
}

export default ArtworkComparison

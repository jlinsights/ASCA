'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ZoomableImageViewerProps } from './zoomable-image-viewer/types'
import { useImageZoom } from './zoomable-image-viewer/use-image-zoom'
import { ViewerToolbar } from './zoomable-image-viewer/viewer-toolbar'
import { InfoPanel } from './zoomable-image-viewer/info-panel'

// ===============================
// Main Component (shell)
// ===============================

function ZoomableImageViewer({
  image,
  className,
  onRegionSelect,
  onAnnotationClick,
  showRegions = true,
  showAnnotations = true,
  showMeasurements = false,
  enableFullscreen = true,
  enableDeepZoom = true,
  maxZoom = 10,
  minZoom = 0.1,
  zoomStep = 0.2,
  onZoomChange,
}: ZoomableImageViewerProps) {
  const {
    viewerState,
    isFullscreen,
    currentImageUrl,
    isLoading,
    setIsLoading,
    showInfo,
    setShowInfo,
    activeTool,
    setActiveTool,
    activeRegion,
    setActiveRegion,
    containerRef,
    imageRef,
    canvasRef,
    handleImageLoad,
    handleZoom,
    resetView,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleDoubleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    toggleFullscreen,
    handleRegionClick,
  } = useImageZoom({
    image,
    enableDeepZoom,
    maxZoom,
    minZoom,
    zoomStep,
    enableFullscreen,
    onZoomChange,
    onRegionSelect,
  })

  // ===============================
  // Render Functions
  // ===============================

  const renderRegions = () => {
    if (!showRegions || !image.regions) return null

    return image.regions.map(region => {
      const style = {
        position: 'absolute' as const,
        left: `${region.coordinates.x}%`,
        top: `${region.coordinates.y}%`,
        width: `${region.coordinates.width}%`,
        height: `${region.coordinates.height}%`,
        border: `2px solid ${region.type === 'character' ? '#f59e0b' : '#ef4444'}`,
        backgroundColor: `${region.type === 'character' ? '#f59e0b' : '#ef4444'}20`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }

      const isActive = activeRegion === region.id

      return (
        <div
          key={region.id}
          style={{
            ...style,
            borderWidth: isActive ? '3px' : '2px',
            zIndex: isActive ? 20 : 10,
          }}
          onClick={() => handleRegionClick(region)}
          onMouseEnter={() => setActiveRegion(region.id)}
          onMouseLeave={() => setActiveRegion(null)}
          title={region.description}
        >
          {isActive && (
            <div className='absolute -top-8 left-0 bg-ink-black text-rice-paper px-2 py-1 rounded text-xs whitespace-nowrap'>
              {region.name}
            </div>
          )}
        </div>
      )
    })
  }

  const renderAnnotations = () => {
    if (!showAnnotations || !image.annotations) return null

    return image.annotations.map(annotation => (
      <div
        key={annotation.id}
        className='absolute w-4 h-4 bg-temple-gold border-2 border-ink-black rounded-full cursor-pointer hover:scale-125 transition-transform duration-200 z-30'
        style={{
          left: `${annotation.position.x}%`,
          top: `${annotation.position.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={() => onAnnotationClick?.(annotation)}
        title={annotation.title}
      >
        <div className='absolute w-2 h-2 bg-ink-black rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
      </div>
    ))
  }

  const renderLoadingIndicator = () => {
    if (!isLoading) return null

    return (
      <div className='absolute inset-0 flex items-center justify-center bg-ink-black/20 backdrop-blur-sm z-50'>
        <div className='bg-silk-cream rounded-lg p-4 flex items-center gap-3'>
          <div className='w-6 h-6 border-2 border-celadon-green border-t-transparent rounded-full animate-spin' />
          <span className='text-ink-black'>Loading high resolution...</span>
        </div>
      </div>
    )
  }

  // ===============================
  // Main Render
  // ===============================

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden bg-ink-black/5 rounded-lg cursor-grab active:cursor-grabbing',
        isFullscreen && 'fixed inset-0 z-50 bg-ink-black',
        viewerState.isDragging && 'cursor-grabbing',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Image */}
      <div
        className='relative w-full h-full flex items-center justify-center'
        style={{
          transform: `scale(${viewerState.scale}) translate(${viewerState.offsetX}px, ${viewerState.offsetY}px) rotate(${viewerState.rotation}deg)`,
          transformOrigin: 'center',
          transition: viewerState.isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <Image
          ref={imageRef}
          src={currentImageUrl}
          alt={image.metadata.filename}
          width={800}
          height={600}
          className='max-w-full max-h-full object-contain select-none'
          onLoad={handleImageLoad}
          onError={() => setIsLoading(false)}
          draggable={false}
          priority
          quality={90}
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw'
        />

        {/* Regions and Annotations Overlay */}
        <div className='absolute inset-0'>
          {renderRegions()}
          {renderAnnotations()}
        </div>
      </div>

      {/* UI Overlays */}
      <ViewerToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        isFullscreen={isFullscreen}
        enableFullscreen={enableFullscreen}
        zoomStep={zoomStep}
        originalUrl={image.urls.original}
        onZoom={handleZoom}
        onResetView={resetView}
        onToggleFullscreen={toggleFullscreen}
      />
      <InfoPanel showInfo={showInfo} image={image} scale={viewerState.scale} />
      {renderLoadingIndicator()}

      {/* Zoom Level Indicator */}
      <div className='absolute bottom-4 left-4 bg-silk-cream/90 backdrop-blur-sm rounded-lg px-3 py-1 z-40'>
        <span className='text-sm font-medium text-ink-black'>
          {(viewerState.scale * 100).toFixed(0)}%
        </span>
      </div>

      {/* Canvas for Drawing Measurements (if needed) */}
      {showMeasurements && (
        <canvas
          ref={canvasRef}
          className='absolute inset-0 pointer-events-none z-30'
          width={containerRef.current?.clientWidth || 0}
          height={containerRef.current?.clientHeight || 0}
        />
      )}
    </div>
  )
}

export default ZoomableImageViewer

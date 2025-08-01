'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/utils/logger';
import { 
  ArrowLeftRight, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize,
  Eye,
  EyeOff,
  Link,
  Unlink,
  Grid3X3,
  MoreHorizontal,
  Download,
  Share2,
  BookOpen,
  Info,
  ChevronLeft,
  ChevronRight,
  Square,
  Circle,
  Ruler,
  Palette,
  Move,
  MousePointer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Artwork, ArtworkImage, ImageRegion } from '@/lib/types/gallery';

// ===============================
// Types and Interfaces
// ===============================

interface ComparisonMode {
  type: 'side-by-side' | 'overlay' | 'split-view' | 'grid';
  syncZoom: boolean;
  syncPan: boolean;
  showAnnotations: boolean;
  showRegions: boolean;
  overlayOpacity?: number;
}

interface ComparisonAnalysis {
  similarities: string[];
  differences: string[];
  techniques: {
    brushwork: string;
    composition: string;
    style: string;
  };
  cultural_context: string;
  educational_notes: string[];
}

interface ArtworkComparisonProps {
  artworks: Artwork[];
  initialMode?: ComparisonMode;
  maxArtworks?: number;
  onAnalysisRequest?: (artworkIds: string[]) => Promise<ComparisonAnalysis>;
  className?: string;
}

interface ViewerState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  dragStart: { x: number; y: number };
}

// ===============================
// Main Component
// ===============================

const ArtworkComparison: React.FC<ArtworkComparisonProps> = ({
  artworks,
  initialMode = {
    type: 'side-by-side',
    syncZoom: true,
    syncPan: true,
    showAnnotations: false,
    showRegions: true
  },
  maxArtworks = 4,
  onAnalysisRequest,
  className
}) => {
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>(
    artworks.slice(0, Math.min(2, artworks.length))
  );
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>(initialMode);
  const [viewerStates, setViewerStates] = useState<ViewerState[]>([
    { scale: 1, offsetX: 0, offsetY: 0, isDragging: false, dragStart: { x: 0, y: 0 } },
    { scale: 1, offsetX: 0, offsetY: 0, isDragging: false, dragStart: { x: 0, y: 0 } }
  ]);
  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeImage, setActiveImage] = useState<{ artworkIndex: number; imageIndex: number }>({
    artworkIndex: 0,
    imageIndex: 0
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // Initialize viewer states when artworks change
  useEffect(() => {
    const states = selectedArtworks.map(() => ({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      dragStart: { x: 0, y: 0 }
    }));
    setViewerStates(states);
  }, [selectedArtworks]);

  // ===============================
  // Artwork Selection Management
  // ===============================

  const addArtwork = (artwork: Artwork) => {
    if (selectedArtworks.length < maxArtworks && !selectedArtworks.find(a => a.id === artwork.id)) {
      setSelectedArtworks(prev => [...prev, artwork]);
    }
  };

  const removeArtwork = (artworkId: string) => {
    setSelectedArtworks(prev => prev.filter(a => a.id !== artworkId));
  };

  const replaceArtwork = (index: number, artwork: Artwork) => {
    setSelectedArtworks(prev => {
      const newArtworks = [...prev];
      newArtworks[index] = artwork;
      return newArtworks;
    });
  };

  // ===============================
  // Zoom and Pan Management
  // ===============================

  const updateViewerState = useCallback((index: number, updates: Partial<ViewerState>) => {
    setViewerStates(prev => {
      const newStates = [...prev];
      newStates[index] = { ...newStates[index], ...updates };
      
      // Sync with other viewers if enabled
      if ((comparisonMode.syncZoom && (updates.scale !== undefined)) ||
          (comparisonMode.syncPan && (updates.offsetX !== undefined || updates.offsetY !== undefined))) {
        for (let i = 0; i < newStates.length; i++) {
          if (i !== index) {
            if (comparisonMode.syncZoom && updates.scale !== undefined) {
              newStates[i].scale = updates.scale;
            }
            if (comparisonMode.syncPan) {
              if (updates.offsetX !== undefined) newStates[i].offsetX = updates.offsetX;
              if (updates.offsetY !== undefined) newStates[i].offsetY = updates.offsetY;
            }
          }
        }
      }
      
      return newStates;
    });
  }, [comparisonMode.syncZoom, comparisonMode.syncPan]);

  const handleZoom = useCallback((index: number, delta: number, centerX?: number, centerY?: number) => {
    const currentState = viewerStates[index];
    const newScale = Math.max(0.1, Math.min(5, currentState.scale + delta));
    
    if (centerX !== undefined && centerY !== undefined) {
      const scaleRatio = newScale / currentState.scale;
      const newOffsetX = centerX - (centerX - currentState.offsetX) * scaleRatio;
      const newOffsetY = centerY - (centerY - currentState.offsetY) * scaleRatio;
      
      updateViewerState(index, {
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      });
    } else {
      updateViewerState(index, { scale: newScale });
    }
  }, [viewerStates, updateViewerState]);

  const handlePan = useCallback((index: number, deltaX: number, deltaY: number) => {
    const currentState = viewerStates[index];
    updateViewerState(index, {
      offsetX: currentState.offsetX + deltaX,
      offsetY: currentState.offsetY + deltaY
    });
  }, [viewerStates, updateViewerState]);

  const resetView = useCallback((index?: number) => {
    if (index !== undefined) {
      updateViewerState(index, {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        isDragging: false,
        dragStart: { x: 0, y: 0 }
      });
    } else {
      // Reset all viewers
      const resetStates = viewerStates.map(() => ({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        isDragging: false,
        dragStart: { x: 0, y: 0 }
      }));
      setViewerStates(resetStates);
    }
  }, [viewerStates, updateViewerState]);

  // ===============================
  // Event Handlers
  // ===============================

  const handleMouseDown = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    updateViewerState(index, {
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY }
    });
  }, [updateViewerState]);

  const handleMouseMove = useCallback((index: number, e: React.MouseEvent) => {
    const currentState = viewerStates[index];
    if (!currentState.isDragging) return;
    
    const deltaX = e.clientX - currentState.dragStart.x;
    const deltaY = e.clientY - currentState.dragStart.y;
    
    handlePan(index, deltaX, deltaY);
    
    updateViewerState(index, {
      dragStart: { x: e.clientX, y: e.clientY }
    });
  }, [viewerStates, handlePan, updateViewerState]);

  const handleMouseUp = useCallback((index: number) => {
    updateViewerState(index, { isDragging: false });
  }, [updateViewerState]);

  const handleWheel = useCallback((index: number, e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(index, delta);
  }, [handleZoom]);

  // ===============================
  // Analysis Functions
  // ===============================

  const requestAnalysis = async () => {
    if (!onAnalysisRequest || selectedArtworks.length < 2) return;
    
    try {
      const artworkIds = selectedArtworks.map(artwork => artwork.id);
      const analysisResult = await onAnalysisRequest(artworkIds);
      setAnalysis(analysisResult);
      setShowAnalysis(true);
    } catch (error) {
      logger.error('Failed to get comparison analysis', error instanceof Error ? error : new Error(String(error)));
    }
  };

  // ===============================
  // Render Functions
  // ===============================

  const renderArtworkSelector = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="font-calligraphy text-lg">Select Artworks to Compare</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {artworks.map((artwork) => {
            const isSelected = selectedArtworks.find(a => a.id === artwork.id);
            const primaryImage = artwork.images.find(img => img.type === 'primary') || artwork.images[0];
            
            return (
              <div
                key={artwork.id}
                className={cn(
                  "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                  isSelected ? "border-celadon-green shadow-lg" : "border-transparent hover:border-celadon-green/50"
                )}
                onClick={() => {
                  if (isSelected) {
                    removeArtwork(artwork.id);
                  } else if (selectedArtworks.length < maxArtworks) {
                    addArtwork(artwork);
                  }
                }}
              >
                <div className="relative aspect-square">
                  <Image
                    src={primaryImage?.urls.small || '/placeholder-artwork.jpg'}
                    alt={artwork.title.english}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 to-transparent flex items-end">
                  <div className="p-3 text-rice-paper">
                    <h4 className="font-calligraphy font-semibold text-sm line-clamp-1">
                      {artwork.title.original}
                    </h4>
                    <p className="text-xs opacity-80">{artwork.artist.name}</p>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-celadon-green text-ink-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderToolbar = () => (
    <div className="flex items-center justify-between mb-6 p-4 bg-silk-cream/50 rounded-lg">
      <div className="flex items-center gap-2">
        {/* Comparison Mode */}
        <div className="flex gap-1 bg-rice-paper rounded-md p-1">
          {[
            { type: 'side-by-side', icon: ArrowLeftRight, label: 'Side by Side' },
            { type: 'overlay', icon: Square, label: 'Overlay' },
            { type: 'split-view', icon: Grid3X3, label: 'Split View' }
          ].map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              size="sm"
              variant={comparisonMode.type === type ? "default" : "ghost"}
              onClick={() => setComparisonMode(prev => ({ ...prev, type: type as any }))}
              title={label}
              className="h-8 w-8 p-0"
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Sync Options */}
        <div className="flex gap-1 bg-rice-paper rounded-md p-1 ml-2">
          <Button
            size="sm"
            variant={comparisonMode.syncZoom ? "default" : "ghost"}
            onClick={() => setComparisonMode(prev => ({ ...prev, syncZoom: !prev.syncZoom }))}
            title="Sync Zoom"
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={comparisonMode.syncPan ? "default" : "ghost"}
            onClick={() => setComparisonMode(prev => ({ ...prev, syncPan: !prev.syncPan }))}
            title="Sync Pan"
            className="h-8 w-8 p-0"
          >
            <Move className="w-4 h-4" />
          </Button>
        </div>

        {/* Display Options */}
        <div className="flex gap-1 bg-rice-paper rounded-md p-1 ml-2">
          <Button
            size="sm"
            variant={comparisonMode.showRegions ? "default" : "ghost"}
            onClick={() => setComparisonMode(prev => ({ ...prev, showRegions: !prev.showRegions }))}
            title="Show Regions"
            className="h-8 w-8 p-0"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={comparisonMode.showAnnotations ? "default" : "ghost"}
            onClick={() => setComparisonMode(prev => ({ ...prev, showAnnotations: !prev.showAnnotations }))}
            title="Show Annotations"
            className="h-8 w-8 p-0"
          >
            <MousePointer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Reset View */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => resetView()}
          title="Reset All Views"
          className="border-ink-black/20"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>

        {/* Analysis */}
        {onAnalysisRequest && selectedArtworks.length >= 2 && (
          <Button
            size="sm"
            variant="outline"
            onClick={requestAnalysis}
            className="border-celadon-green text-celadon-green hover:bg-celadon-green hover:text-ink-black"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Analyze
          </Button>
        )}

        {/* Fullscreen */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="border-ink-black/20"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );

  const renderImageViewer = (artwork: Artwork, index: number) => {
    const viewerState = viewerStates[index];
    const primaryImage = artwork.images.find(img => img.type === 'primary') || artwork.images[0];
    
    if (!primaryImage) return null;

    return (
      <div
        className="relative bg-ink-black/5 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: '400px' }}
        onMouseDown={(e) => handleMouseDown(index, e)}
        onMouseMove={(e) => handleMouseMove(index, e)}
        onMouseUp={() => handleMouseUp(index)}
        onMouseLeave={() => handleMouseUp(index)}
        onWheel={(e) => handleWheel(index, e)}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transform: `scale(${viewerState.scale}) translate(${viewerState.offsetX}px, ${viewerState.offsetY}px)`,
            transition: viewerState.isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <div className="relative w-full h-full max-w-2xl max-h-[80vh]">
            <Image
              ref={(el: HTMLImageElement | null) => { if (el) imageRefs.current[index] = el }}
              src={primaryImage.urls.large}
              alt={artwork.title.english}
              fill
              className="object-contain select-none"
              sizes="(max-width: 1024px) 100vw, 50vw"
              draggable={false}
            />
          </div>

          {/* Regions Overlay */}
          {comparisonMode.showRegions && primaryImage.regions && (
            <div className="absolute inset-0">
              {primaryImage.regions.map((region) => (
                <div
                  key={region.id}
                  className="absolute border-2 border-celadon-green bg-celadon-green/20 hover:bg-celadon-green/30 transition-colors"
                  style={{
                    left: `${region.coordinates.x}%`,
                    top: `${region.coordinates.y}%`,
                    width: `${region.coordinates.width}%`,
                    height: `${region.coordinates.height}%`
                  }}
                  title={region.description}
                />
              ))}
            </div>
          )}

          {/* Annotations Overlay */}
          {comparisonMode.showAnnotations && primaryImage.annotations && (
            <div className="absolute inset-0">
              {primaryImage.annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute w-4 h-4 bg-temple-gold border-2 border-ink-black rounded-full cursor-pointer hover:scale-125 transition-transform"
                  style={{
                    left: `${annotation.position.x}%`,
                    top: `${annotation.position.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={annotation.title}
                />
              ))}
            </div>
          )}
        </div>

        {/* Image Info */}
        <div className="absolute top-4 left-4 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-3 max-w-xs">
          <h4 className="font-calligraphy font-semibold text-ink-black mb-1">
            {artwork.title.original}
          </h4>
          <p className="text-sm text-ink-black/70">{artwork.title.english}</p>
          <p className="text-xs text-ink-black/60 mt-1">{artwork.artist.name}</p>
          {artwork.historical_context.creation_date.period && (
            <p className="text-xs text-ink-black/60">
              {artwork.historical_context.creation_date.period}
            </p>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleZoom(index, 0.2)}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleZoom(index, -0.2)}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => resetView(index)}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute bottom-4 left-4 bg-silk-cream/90 backdrop-blur-sm rounded-lg px-3 py-1">
          <span className="text-sm font-medium text-ink-black">
            {(viewerState.scale * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    );
  };

  const renderComparisonView = () => {
    if (selectedArtworks.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <ArrowLeftRight className="w-12 h-12 text-ink-black/20 mx-auto mb-4" />
            <h3 className="font-calligraphy text-lg font-semibold text-ink-black mb-2">
              No Artworks Selected
            </h3>
            <p className="text-ink-black/60">
              Select at least one artwork from the gallery above to begin comparison.
            </p>
          </CardContent>
        </Card>
      );
    }

    switch (comparisonMode.type) {
      case 'side-by-side':
        return (
          <div className={cn(
            "grid gap-6",
            selectedArtworks.length === 1 && "grid-cols-1",
            selectedArtworks.length === 2 && "grid-cols-1 lg:grid-cols-2",
            selectedArtworks.length === 3 && "grid-cols-1 lg:grid-cols-3",
            selectedArtworks.length >= 4 && "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"
          )}>
            {selectedArtworks.map((artwork, index) => (
              <div key={artwork.id} className="space-y-2">
                {renderImageViewer(artwork, index)}
              </div>
            ))}
          </div>
        );

      case 'overlay':
        if (selectedArtworks.length < 2) {
          return renderImageViewer(selectedArtworks[0], 0);
        }
        // TODO: Implement overlay mode
        return (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-ink-black/60">
                Overlay mode is under development. Coming soon!
              </p>
            </CardContent>
          </Card>
        );

      case 'split-view':
        // TODO: Implement split view mode
        return (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-ink-black/60">
                Split view mode is under development. Coming soon!
              </p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderAnalysisPanel = () => {
    if (!showAnalysis || !analysis) return null;

    return (
      <Card className="mt-6 border-temple-gold/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-calligraphy text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-temple-gold" />
              Comparative Analysis
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAnalysis(false)}
              className="border-ink-black/20"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Similarities */}
          <div>
            <h4 className="font-semibold text-ink-black mb-3">Similarities</h4>
            <ul className="space-y-2">
              {analysis.similarities.map((similarity, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-summer-jade rounded-full mt-2 flex-shrink-0" />
                  <span className="text-ink-black/80">{similarity}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Differences */}
          <div>
            <h4 className="font-semibold text-ink-black mb-3">Key Differences</h4>
            <ul className="space-y-2">
              {analysis.differences.map((difference, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-vermillion rounded-full mt-2 flex-shrink-0" />
                  <span className="text-ink-black/80">{difference}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Analysis */}
          <div>
            <h4 className="font-semibold text-ink-black mb-3">Technical Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-celadon-green/10 rounded-lg p-3">
                <h5 className="font-medium text-ink-black mb-2">Brushwork</h5>
                <p className="text-sm text-ink-black/80">{analysis.techniques.brushwork}</p>
              </div>
              <div className="bg-temple-gold/10 rounded-lg p-3">
                <h5 className="font-medium text-ink-black mb-2">Composition</h5>
                <p className="text-sm text-ink-black/80">{analysis.techniques.composition}</p>
              </div>
              <div className="bg-autumn-gold/10 rounded-lg p-3">
                <h5 className="font-medium text-ink-black mb-2">Style</h5>
                <p className="text-sm text-ink-black/80">{analysis.techniques.style}</p>
              </div>
            </div>
          </div>

          {/* Cultural Context */}
          <div className="bg-silk-cream/50 rounded-lg p-4">
            <h4 className="font-semibold text-ink-black mb-3">Cultural Context</h4>
            <p className="text-sm text-ink-black/80 leading-relaxed">{analysis.cultural_context}</p>
          </div>

          {/* Educational Notes */}
          {analysis.educational_notes.length > 0 && (
            <div>
              <h4 className="font-semibold text-ink-black mb-3">Educational Notes</h4>
              <div className="space-y-2">
                {analysis.educational_notes.map((note, index) => (
                  <div key={index} className="bg-temple-gold/10 rounded-md p-3">
                    <p className="text-sm text-ink-black/80">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn(
      "space-y-6",
      isFullscreen && "fixed inset-0 z-50 bg-rice-paper p-6 overflow-auto",
      className
    )}>
      {/* Header */}
      <div className="text-center">
        <h1 className="font-calligraphy text-2xl font-bold text-ink-black mb-2">
          Artwork Comparison Tool
        </h1>
        <p className="text-ink-black/70">
          Compare artworks side by side to analyze techniques, styles, and cultural elements
        </p>
      </div>

      {/* Artwork Selector */}
      {renderArtworkSelector()}

      {/* Toolbar */}
      {selectedArtworks.length > 0 && renderToolbar()}

      {/* Comparison View */}
      {renderComparisonView()}

      {/* Analysis Panel */}
      {renderAnalysisPanel()}
    </div>
  );
};

export default ArtworkComparison;
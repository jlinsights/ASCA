'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize, 
  Minimize, 
  Download,
  Info,
  Ruler,
  Eye,
  Navigation,
  Target,
  MousePointer,
  Move,
  Square,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArtworkImage, ImageRegion, ImageAnnotation } from '@/lib/types/gallery';

// ===============================
// Types and Interfaces
// ===============================

interface ViewerState {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  isDragging: boolean;
  dragStart: { x: number; y: number };
  lastPinchDistance?: number;
}

interface ZoomableImageViewerProps {
  image: ArtworkImage;
  className?: string;
  onRegionSelect?: (region: ImageRegion) => void;
  onAnnotationClick?: (annotation: ImageAnnotation) => void;
  showRegions?: boolean;
  showAnnotations?: boolean;
  showMeasurements?: boolean;
  enableFullscreen?: boolean;
  enableDeepZoom?: boolean;
  maxZoom?: number;
  minZoom?: number;
  zoomStep?: number;
  onZoomChange?: (scale: number) => void;
}

interface MeasurementTool {
  id: string;
  type: 'line' | 'rectangle' | 'circle';
  start: { x: number; y: number };
  end: { x: number; y: number };
  measurements: {
    length?: number;
    area?: number;
    perimeter?: number;
  };
  unit: 'px' | 'cm' | 'mm' | 'in';
}

// ===============================
// Main Component
// ===============================

const ZoomableImageViewer: React.FC<ZoomableImageViewerProps> = ({
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
  onZoomChange
}) => {
  // State management
  const [viewerState, setViewerState] = useState<ViewerState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    isDragging: false,
    dragStart: { x: 0, y: 0 }
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(image.urls.medium);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [activeTool, setActiveTool] = useState<'pan' | 'zoom' | 'measure' | 'annotate'>('pan');
  const [measurements, setMeasurements] = useState<MeasurementTool[]>([]);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate optimal image URL based on zoom level
  const getOptimalImageUrl = useCallback((scale: number) => {
    if (!enableDeepZoom) return image.urls.large || image.urls.medium;
    
    if (scale >= 4) return image.urls.original;
    if (scale >= 2) return image.urls.large || image.urls.medium;
    if (scale >= 1) return image.urls.medium || image.urls.small;
    return image.urls.small || image.urls.thumbnail;
  }, [image.urls, enableDeepZoom]);

  // Load appropriate image based on zoom level
  useEffect(() => {
    const optimalUrl = getOptimalImageUrl(viewerState.scale);
    if (optimalUrl !== currentImageUrl) {
      setIsLoading(true);
      setCurrentImageUrl(optimalUrl);
    }
  }, [viewerState.scale, getOptimalImageUrl, currentImageUrl]);

  // Handle image load completion
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    onZoomChange?.(viewerState.scale);
  }, [viewerState.scale, onZoomChange]);

  // ===============================
  // Zoom and Pan Functions
  // ===============================

  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    setViewerState(prev => {
      const newScale = Math.max(minZoom, Math.min(maxZoom, prev.scale + delta));
      
      if (centerX !== undefined && centerY !== undefined) {
        // Zoom towards specific point
        const scaleRatio = newScale / prev.scale;
        const newOffsetX = centerX - (centerX - prev.offsetX) * scaleRatio;
        const newOffsetY = centerY - (centerY - prev.offsetY) * scaleRatio;
        
        return {
          ...prev,
          scale: newScale,
          offsetX: newOffsetX,
          offsetY: newOffsetY
        };
      }
      
      return { ...prev, scale: newScale };
    });
  }, [minZoom, maxZoom]);

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setViewerState(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY
    }));
  }, []);

  const resetView = useCallback(() => {
    setViewerState({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      isDragging: false,
      dragStart: { x: 0, y: 0 }
    });
  }, []);

  // ===============================
  // Event Handlers
  // ===============================

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'pan') return;
    
    e.preventDefault();
    setViewerState(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY }
    }));
  }, [activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!viewerState.isDragging || activeTool !== 'pan') return;
    
    const deltaX = e.clientX - viewerState.dragStart.x;
    const deltaY = e.clientY - viewerState.dragStart.y;
    
    handlePan(deltaX, deltaY);
    
    setViewerState(prev => ({
      ...prev,
      dragStart: { x: e.clientX, y: e.clientY }
    }));
  }, [viewerState.isDragging, viewerState.dragStart, activeTool, handlePan]);

  const handleMouseUp = useCallback(() => {
    setViewerState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    if (activeTool === 'zoom' || e.ctrlKey) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = e.clientX - rect.left;
        const centerY = e.clientY - rect.top;
        const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
        handleZoom(delta, centerX, centerY);
      }
    }
  }, [activeTool, zoomStep, handleZoom]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;
      const delta = viewerState.scale >= 2 ? -viewerState.scale + 1 : zoomStep * 2;
      handleZoom(delta, centerX, centerY);
    }
  }, [viewerState.scale, zoomStep, handleZoom]);

  // Touch events for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && activeTool === 'pan') {
      const touch = e.touches[0];
      setViewerState(prev => ({
        ...prev,
        isDragging: true,
        dragStart: { x: touch.clientX, y: touch.clientY }
      }));
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setViewerState(prev => ({ ...prev, lastPinchDistance: distance }));
    }
  }, [activeTool]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && viewerState.isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - viewerState.dragStart.x;
      const deltaY = touch.clientY - viewerState.dragStart.y;
      
      handlePan(deltaX, deltaY);
      
      setViewerState(prev => ({
        ...prev,
        dragStart: { x: touch.clientX, y: touch.clientY }
      }));
    } else if (e.touches.length === 2 && viewerState.lastPinchDistance) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const localCenterX = centerX - rect.left;
        const localCenterY = centerY - rect.top;
        const delta = (distance - viewerState.lastPinchDistance) * 0.01;
        handleZoom(delta, localCenterX, localCenterY);
      }
      
      setViewerState(prev => ({ ...prev, lastPinchDistance: distance }));
    }
  }, [viewerState.isDragging, viewerState.dragStart, viewerState.lastPinchDistance, handlePan, handleZoom]);

  const handleTouchEnd = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      isDragging: false,
      lastPinchDistance: undefined
    }));
  }, []);

  // ===============================
  // Fullscreen Management
  // ===============================

  const toggleFullscreen = useCallback(() => {
    if (!enableFullscreen) return;
    
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [isFullscreen, enableFullscreen]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ===============================
  // Region and Annotation Rendering
  // ===============================

  const getImageCoordinates = useCallback((x: number, y: number) => {
    if (!imageRef.current || !containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const imgRect = imageRef.current.getBoundingClientRect();
    
    const relativeX = (x - imgRect.left) / (imgRect.width * viewerState.scale);
    const relativeY = (y - imgRect.top) / (imgRect.height * viewerState.scale);
    
    return { x: relativeX, y: relativeY };
  }, [viewerState.scale]);

  const handleRegionClick = useCallback((region: ImageRegion) => {
    setActiveRegion(region.id);
    onRegionSelect?.(region);
  }, [onRegionSelect]);

  // ===============================
  // Render Functions
  // ===============================

  const renderRegions = () => {
    if (!showRegions || !image.regions) return null;
    
    return image.regions.map((region) => {
      const style = {
        position: 'absolute' as const,
        left: `${region.coordinates.x}%`,
        top: `${region.coordinates.y}%`,
        width: `${region.coordinates.width}%`,
        height: `${region.coordinates.height}%`,
        border: `2px solid ${region.type === 'character' ? '#f59e0b' : '#ef4444'}`,
        backgroundColor: `${region.type === 'character' ? '#f59e0b' : '#ef4444'}20`,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      };
      
      const isActive = activeRegion === region.id;
      
      return (
        <div
          key={region.id}
          style={{
            ...style,
            borderWidth: isActive ? '3px' : '2px',
            zIndex: isActive ? 20 : 10
          }}
          onClick={() => handleRegionClick(region)}
          onMouseEnter={() => setActiveRegion(region.id)}
          onMouseLeave={() => setActiveRegion(null)}
          title={region.description}
        >
          {isActive && (
            <div className="absolute -top-8 left-0 bg-ink-black text-rice-paper px-2 py-1 rounded text-xs whitespace-nowrap">
              {region.name}
            </div>
          )}
        </div>
      );
    });
  };

  const renderAnnotations = () => {
    if (!showAnnotations || !image.annotations) return null;
    
    return image.annotations.map((annotation) => (
      <div
        key={annotation.id}
        className="absolute w-4 h-4 bg-temple-gold border-2 border-ink-black rounded-full cursor-pointer hover:scale-125 transition-transform duration-200 z-30"
        style={{
          left: `${annotation.position.x}%`,
          top: `${annotation.position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => onAnnotationClick?.(annotation)}
        title={annotation.title}
      >
        <div className="absolute w-2 h-2 bg-ink-black rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    ));
  };

  const renderToolbar = () => (
    <div className="absolute top-4 left-4 flex gap-2 z-40">
      {/* Zoom Controls */}
      <div className="flex gap-1 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleZoom(zoomStep)}
          className="h-8 w-8 p-0"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleZoom(-zoomStep)}
          className="h-8 w-8 p-0"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={resetView}
          className="h-8 w-8 p-0"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tool Selection */}
      <div className="flex gap-1 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-1">
        {[
          { tool: 'pan', icon: Move, title: 'Pan' },
          { tool: 'zoom', icon: Target, title: 'Zoom' },
          { tool: 'measure', icon: Ruler, title: 'Measure' },
          { tool: 'annotate', icon: MousePointer, title: 'Annotate' }
        ].map(({ tool, icon: Icon, title }) => (
          <Button
            key={tool}
            size="sm"
            variant={activeTool === tool ? "default" : "ghost"}
            onClick={() => setActiveTool(tool as any)}
            className="h-8 w-8 p-0"
            title={title}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Additional Controls */}
      <div className="flex gap-1 bg-silk-cream/90 backdrop-blur-sm rounded-lg p-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowInfo(!showInfo)}
          className="h-8 w-8 p-0"
          title="Image Info"
        >
          <Info className="w-4 h-4" />
        </Button>
        {enableFullscreen && (
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => window.open(image.urls.original, '_blank')}
          className="h-8 w-8 p-0"
          title="Download Original"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderInfoPanel = () => {
    if (!showInfo) return null;
    
    return (
      <Card className="absolute top-4 right-4 w-80 max-h-96 overflow-auto bg-silk-cream/95 backdrop-blur-sm z-40">
        <CardContent className="p-4">
          <h3 className="font-calligraphy font-semibold text-ink-black mb-3">Image Information</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-black/70">Dimensions:</span>
              <span className="text-ink-black">
                {image.metadata.dimensions.width} × {image.metadata.dimensions.height}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-ink-black/70">Format:</span>
              <span className="text-ink-black uppercase">{image.metadata.format}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-ink-black/70">File Size:</span>
              <span className="text-ink-black">
                {(image.metadata.file_size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-ink-black/70">DPI:</span>
              <span className="text-ink-black">{image.metadata.dpi}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-ink-black/70">Zoom Level:</span>
              <span className="text-ink-black">{(viewerState.scale * 100).toFixed(0)}%</span>
            </div>
            
            {image.metadata.camera_info && (
              <div className="pt-2 border-t border-ink-black/20">
                <div className="text-ink-black/70 mb-1">Camera Information:</div>
                <div className="text-xs space-y-1">
                  <div>{image.metadata.camera_info.make} {image.metadata.camera_info.model}</div>
                  <div>Lens: {image.metadata.camera_info.lens}</div>
                  <div>
                    {image.metadata.camera_info.focal_length}mm, 
                    f/{image.metadata.camera_info.aperture}, 
                    {image.metadata.camera_info.shutter_speed}s, 
                    ISO {image.metadata.camera_info.iso}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLoadingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-ink-black/20 backdrop-blur-sm z-50">
        <div className="bg-silk-cream rounded-lg p-4 flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-celadon-green border-t-transparent rounded-full animate-spin" />
          <span className="text-ink-black">Loading high resolution...</span>
        </div>
      </div>
    );
  };

  // ===============================
  // Main Render
  // ===============================

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-ink-black/5 rounded-lg cursor-grab active:cursor-grabbing",
        isFullscreen && "fixed inset-0 z-50 bg-ink-black",
        viewerState.isDragging && "cursor-grabbing",
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
        className="relative w-full h-full flex items-center justify-center"
        style={{
          transform: `scale(${viewerState.scale}) translate(${viewerState.offsetX}px, ${viewerState.offsetY}px) rotate(${viewerState.rotation}deg)`,
          transformOrigin: 'center',
          transition: viewerState.isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        <Image
          ref={imageRef}
          src={currentImageUrl}
          alt={image.metadata.filename}
          width={800}
          height={600}
          className="max-w-full max-h-full object-contain select-none"
          onLoad={handleImageLoad}
          onError={() => setIsLoading(false)}
          draggable={false}
          priority
          quality={90}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
        
        {/* Regions and Annotations Overlay */}
        <div className="absolute inset-0">
          {renderRegions()}
          {renderAnnotations()}
        </div>
      </div>

      {/* UI Overlays */}
      {renderToolbar()}
      {renderInfoPanel()}
      {renderLoadingIndicator()}

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 bg-silk-cream/90 backdrop-blur-sm rounded-lg px-3 py-1 z-40">
        <span className="text-sm font-medium text-ink-black">
          {(viewerState.scale * 100).toFixed(0)}%
        </span>
      </div>

      {/* Canvas for Drawing Measurements (if needed) */}
      {showMeasurements && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-30"
          width={containerRef.current?.clientWidth || 0}
          height={containerRef.current?.clientHeight || 0}
        />
      )}
    </div>
  );
};

export default ZoomableImageViewer;
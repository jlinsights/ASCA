'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  Info, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  Navigation,
  Eye,
  Camera,
  Download,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for virtual exhibition
interface ExhibitionArtwork {
  id: string;
  title: {
    original: string;
    romanized: string;
    english: string;
  };
  artist: {
    name: string;
    period: string;
    school: string;
  };
  image: {
    url: string;
    highRes: string;
    details: string[];
  };
  audio?: {
    url: string;
    transcript: string;
  };
  description: {
    cultural: string;
    technical: string;
    historical: string;
  };
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  year: string;
  medium: string;
  provenance: string;
  position: {
    x: number;
    y: number;
    wall: 'north' | 'south' | 'east' | 'west';
  };
}

interface Exhibition {
  id: string;
  title: string;
  description: string;
  curator: string;
  theme: string;
  period: string;
  artworks: ExhibitionArtwork[];
  galleryLayout: {
    width: number;
    height: number;
    style: 'traditional' | 'modern' | 'minimalist';
  };
  ambiance: {
    lighting: 'warm' | 'neutral' | 'cool';
    music: boolean;
    soundscape?: string;
  };
}

interface VirtualExhibitionProps {
  exhibition: Exhibition;
  className?: string;
}

const VirtualExhibition: React.FC<VirtualExhibitionProps> = ({
  exhibition,
  className
}) => {
  const [selectedArtwork, setSelectedArtwork] = useState<ExhibitionArtwork | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentView, setCurrentView] = useState<'gallery' | 'detail' | '3d'>('gallery');
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle zoom
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Handle pan/drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentView !== 'gallery') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      galleryRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Audio controls
  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioEnabled) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioEnabled(!audioEnabled);
    }
  };

  // Get wall color based on style
  const getWallColor = () => {
    switch (exhibition.galleryLayout.style) {
      case 'traditional': return 'rice-paper';
      case 'modern': return 'west-metal';
      case 'minimalist': return 'winter-snow';
      default: return 'rice-paper';
    }
  };

  // Get lighting effect
  const getLightingEffect = () => {
    switch (exhibition.ambiance.lighting) {
      case 'warm': return 'sepia(0.1) brightness(1.1)';
      case 'cool': return 'brightness(0.9) hue-rotate(10deg)';
      case 'neutral': return 'none';
      default: return 'none';
    }
  };

  // Gallery View Component
  const GalleryView = () => (
    <div 
      className={cn(
        "relative w-full h-full overflow-hidden cursor-move",
        `bg-${getWallColor()}`
      )}
      style={{ 
        filter: getLightingEffect(),
        transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Gallery Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ink-black/10 to-transparent" />
      
      {/* Artworks positioned on walls */}
      {exhibition.artworks.map((artwork) => (
        <div
          key={artwork.id}
          className="absolute group cursor-pointer transition-all duration-300 hover:scale-105"
          style={{
            left: `${artwork.position.x}%`,
            top: `${artwork.position.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={() => {
            setSelectedArtwork(artwork);
            setCurrentView('detail');
          }}
        >
          {/* Artwork Frame */}
          <div className="relative">
            <div className="p-4 bg-temple-gold/20 rounded-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-48 h-48">
                <Image
                  src={artwork.image.url}
                  alt={artwork.title.english}
                  fill
                  className="object-contain"
                  sizes="192px"
                />
              </div>
            </div>
            
            {/* Artwork Label */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-ink-black/80 text-rice-paper px-3 py-1 rounded text-xs font-serif whitespace-nowrap">
                {artwork.title.original}
              </div>
            </div>
            
            {/* Gallery Lighting Effect */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gradient-to-b from-temple-gold/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      ))}
      
      {/* Gallery Information Placard */}
      <div className="absolute top-8 left-8 bg-ink-black/80 text-rice-paper p-4 rounded-lg max-w-md">
        <h3 className="font-calligraphy text-lg font-bold mb-2">{exhibition.title}</h3>
        <p className="font-serif text-sm mb-2">{exhibition.description}</p>
        <div className="text-xs opacity-80">
          <p>Curator: {exhibition.curator}</p>
          <p>Theme: {exhibition.theme}</p>
          <p>Period: {exhibition.period}</p>
        </div>
      </div>
    </div>
  );

  // Detail View Component
  const DetailView = () => {
    if (!selectedArtwork) return null;

    return (
      <div className="relative w-full h-full bg-lacquer-black text-rice-paper overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Artwork Image */}
          <div className="relative flex items-center justify-center p-8 bg-gradient-to-br from-ink-black to-lacquer-black">
            <div className="relative w-full h-full max-w-2xl max-h-[80vh]">
              <Image
                src={selectedArtwork.image.highRes}
                alt={selectedArtwork.title.english}
                fill
                className="object-contain shadow-2xl rounded-lg"
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ 
                  filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))',
                  transform: `scale(${zoom})`
                }}
              />
              
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleZoom(0.2)}
                  className="bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleZoom(-0.2)}
                  className="bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={resetView}
                  className="bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Detail Markers */}
              {selectedArtwork.image.details.map((detail, index) => (
                <div
                  key={index}
                  className="absolute w-3 h-3 bg-temple-gold rounded-full border-2 border-rice-paper cursor-pointer hover:scale-150 transition-transform duration-200"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${30 + index * 10}%`
                  }}
                  title={detail}
                />
              ))}
            </div>
          </div>

          {/* Artwork Information */}
          <div className="p-8 overflow-y-auto">
            <div className="space-y-6">
              {/* Title Section */}
              <div>
                <h2 className="font-calligraphy text-3xl font-bold mb-2">
                  {selectedArtwork.title.original}
                </h2>
                <p className="font-english text-xl text-rice-paper/80 mb-1">
                  {selectedArtwork.title.romanized}
                </p>
                <p className="font-english text-lg text-rice-paper/60 italic">
                  "{selectedArtwork.title.english}"
                </p>
              </div>

              {/* Artist Information */}
              <div className="border-l-2 border-temple-gold pl-4">
                <h3 className="font-serif text-lg font-semibold">{selectedArtwork.artist.name}</h3>
                <p className="text-rice-paper/70">{selectedArtwork.artist.period}</p>
                <Badge variant="outline" className="mt-2 border-temple-gold text-temple-gold">
                  {selectedArtwork.artist.school}
                </Badge>
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-temple-gold mb-2">Technical Details</h4>
                  <p className="text-rice-paper/80">
                    <span className="font-medium">Medium:</span> {selectedArtwork.medium}
                  </p>
                  <p className="text-rice-paper/80">
                    <span className="font-medium">Dimensions:</span> {selectedArtwork.dimensions.width} × {selectedArtwork.dimensions.height} {selectedArtwork.dimensions.unit}
                  </p>
                  <p className="text-rice-paper/80">
                    <span className="font-medium">Year:</span> {selectedArtwork.year}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-temple-gold mb-2">Provenance</h4>
                  <p className="text-rice-paper/80 text-sm leading-relaxed">
                    {selectedArtwork.provenance}
                  </p>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-temple-gold mb-2">Cultural Significance</h4>
                  <p className="text-rice-paper/80 leading-relaxed">
                    {selectedArtwork.description.cultural}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-temple-gold mb-2">Artistic Analysis</h4>
                  <p className="text-rice-paper/80 leading-relaxed">
                    {selectedArtwork.description.technical}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-temple-gold mb-2">Historical Context</h4>
                  <p className="text-rice-paper/80 leading-relaxed">
                    {selectedArtwork.description.historical}
                  </p>
                </div>
              </div>

              {/* Audio Guide */}
              {selectedArtwork.audio && (
                <div className="bg-temple-gold/10 rounded-lg p-4 border border-temple-gold/20">
                  <h4 className="font-semibold text-temple-gold mb-2 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Audio Guide
                  </h4>
                  <audio
                    ref={audioRef}
                    src={selectedArtwork.audio.url}
                    controls
                    className="w-full mb-2"
                  />
                  <p className="text-rice-paper/70 text-sm leading-relaxed">
                    {selectedArtwork.audio.transcript}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-temple-gold text-ink-black hover:bg-temple-gold/80">
                  <Camera className="w-4 h-4 mr-2" />
                  Save to Collection
                </Button>
                <Button variant="outline" className="border-rice-paper/30 text-rice-paper hover:bg-rice-paper/10">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="border-rice-paper/30 text-rice-paper hover:bg-rice-paper/10">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={galleryRef} className={cn("relative w-full h-screen bg-ink-black", className)}>
      {/* Navigation Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant={currentView === 'gallery' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setCurrentView('gallery')}
          className={cn(
            currentView === 'gallery' ? 'bg-temple-gold text-ink-black' : 'bg-silk-cream/20 text-rice-paper'
          )}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Gallery
        </Button>
        {selectedArtwork && (
          <Button
            variant={currentView === 'detail' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCurrentView('detail')}
            className={cn(
              currentView === 'detail' ? 'bg-temple-gold text-ink-black' : 'bg-silk-cream/20 text-rice-paper'
            )}
          >
            <Eye className="w-4 h-4 mr-2" />
            Detail
          </Button>
        )}
      </div>

      {/* View Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {currentView === 'gallery' && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleZoom(0.2)}
              className="bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleZoom(-0.2)}
              className="bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetView}
              className="bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        )}
        
        {exhibition.ambiance.music && (
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleAudio}
            className="bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        )}
        
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </div>

      {/* Back Button (Detail View) */}
      {currentView === 'detail' && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentView('gallery')}
          className="absolute top-4 left-20 z-10 bg-silk-cream/20 text-rice-paper hover:bg-silk-cream/30"
        >
          ← Back to Gallery
        </Button>
      )}

      {/* Main Content */}
      <div className="w-full h-full">
        {currentView === 'gallery' && <GalleryView />}
        {currentView === 'detail' && <DetailView />}
      </div>

      {/* Background Audio */}
      {exhibition.ambiance.soundscape && (
        <audio
          ref={audioRef}
          src={exhibition.ambiance.soundscape}
          loop
          preload="auto"
        />
      )}

      {/* Accessibility Instructions */}
      <div className="sr-only">
        <p>Virtual exhibition space. Use arrow keys to navigate, space to select artworks, and escape to return to gallery view.</p>
        <p>Current exhibition: {exhibition.title} curated by {exhibition.curator}</p>
        <p>This exhibition contains {exhibition.artworks.length} artworks focusing on {exhibition.theme}</p>
      </div>
    </div>
  );
};

export default VirtualExhibition;
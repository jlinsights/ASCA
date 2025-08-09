'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for cultural calligraphy showcase
interface CalligraphyArtwork {
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
  description: {
    cultural: string;
    artistic: string;
    historical: string;
  };
  image: {
    url: string;
    alt: string;
    details: string;
  };
  audio?: {
    url: string;
    description: string;
  };
  tags: string[];
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  element?: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
}

interface CalligraphyHeroProps {
  artworks: CalligraphyArtwork[];
  autoPlay?: boolean;
  showSeasonalThemes?: boolean;
  className?: string;
}

const CalligraphyHero: React.FC<CalligraphyHeroProps> = ({
  artworks,
  autoPlay = true,
  showSeasonalThemes = true,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentArtwork = artworks[currentIndex];

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying || artworks.length <= 1) return undefined;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artworks.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, artworks.length]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % artworks.length);
  };

  const getSeasonalAccent = (season?: string) => {
    switch (season) {
      case 'spring': return 'spring-blossom';
      case 'summer': return 'summer-jade';
      case 'autumn': return 'autumn-gold';
      case 'winter': return 'winter-snow';
      default: return 'celadon-green';
    }
  };

  const getElementColor = (element?: string) => {
    switch (element) {
      case 'wood': return 'east-wood';
      case 'fire': return 'south-fire';
      case 'earth': return 'center-earth';
      case 'metal': return 'west-metal';
      case 'water': return 'north-water';
      default: return 'ink-black';
    }
  };

  if (!artworks.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-rice-paper text-ink-black">
        <p className="font-calligraphy text-lg">No artworks available</p>
      </div>
    );
  }

  return (
    <section className={cn(
      "relative h-screen w-full overflow-hidden bg-gradient-to-br from-rice-paper via-silk-cream to-center-earth",
      className
    )}>
      {/* Traditional Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0zm0 6L6 30l24 24 24-24L30 6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative h-full flex items-center">
        {/* Artwork Display */}
        <div className="flex-1 h-full relative">
          {/* Image Container */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative max-w-4xl max-h-full">
              {isLoading ? (
                <div className="w-96 h-96 bg-gradient-to-br from-silk-cream to-rice-paper rounded-lg animate-pulse shadow-2xl" />
              ) : (
                <div className="relative group w-full max-w-4xl aspect-[4/3]">
                  <Image
                    src={currentArtwork?.image.url || ''}
                    alt={currentArtwork?.image.alt || ''}
                    fill
                    className="object-contain rounded-lg shadow-2xl transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    style={{
                      filter: 'drop-shadow(0 25px 50px rgba(26, 26, 26, 0.2))'
                    }}
                  />
                  
                  {/* Artwork Info Overlay */}
                  <div className={cn(
                    "absolute bottom-4 left-4 right-4 bg-silk-cream/90 backdrop-blur-md rounded-lg p-4 transition-opacity duration-300",
                    showInfo ? "opacity-100" : "opacity-0"
                  )}>
                    <h3 className="font-calligraphy text-lg font-semibold text-ink-black mb-2">
                      {currentArtwork?.title.original}
                    </h3>
                    <p className="font-english text-sm text-ink-black/80 mb-1">
                      {currentArtwork?.title.english}
                    </p>
                    <p className="font-serif text-xs text-ink-black/60">
                      {currentArtwork?.artist.name} • {currentArtwork?.artist.period}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-silk-cream/80 hover:bg-silk-cream rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            aria-label="Previous artwork"
          >
            <ChevronLeft className="w-6 h-6 text-ink-black" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-silk-cream/80 hover:bg-silk-cream rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            aria-label="Next artwork"
          >
            <ChevronRight className="w-6 h-6 text-ink-black" />
          </button>
        </div>

        {/* Content Panel */}
        <div className="w-96 h-full bg-gradient-to-b from-ink-black via-lacquer-black to-ink-black text-rice-paper p-8 flex flex-col justify-center relative overflow-y-auto">
          {/* Decorative Element */}
          <div className="absolute top-8 right-8 w-16 h-16 border-2 border-temple-gold/20 rounded-full"></div>
          
          {/* Content */}
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border-temple-gold text-temple-gold font-english text-xs tracking-wider",
                    `bg-${getSeasonalAccent(currentArtwork?.season || 'spring')}/10`
                  )}
                >
                  {currentArtwork?.artist.school}
                </Badge>
                {currentArtwork?.season && showSeasonalThemes && (
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-xs capitalize",
                      `border-${getSeasonalAccent(currentArtwork?.season || 'spring')}`,
                      `text-${getSeasonalAccent(currentArtwork?.season || 'spring')}`
                    )}
                  >
                    {currentArtwork?.season}
                  </Badge>
                )}
              </div>

              <h1 className="font-calligraphy text-4xl font-bold mb-2 leading-tight">
                {currentArtwork?.title.original}
              </h1>
              
              <p className="font-english text-xl text-rice-paper/80 mb-1">
                {currentArtwork?.title.romanized}
              </p>
              
              <p className="font-english text-lg text-rice-paper/60">
                "{currentArtwork?.title.english}"
              </p>
            </div>

            {/* Artist Information */}
            <div className="border-l-2 border-temple-gold/30 pl-4">
              <p className="font-serif text-lg font-semibold text-rice-paper">
                {currentArtwork?.artist.name}
              </p>
              <p className="font-english text-sm text-rice-paper/60">
                {currentArtwork?.artist.period}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <p className="font-serif text-sm leading-relaxed text-rice-paper/80">
                {currentArtwork?.description.cultural}
              </p>
              
              <p className="font-english text-sm leading-relaxed text-rice-paper/70 italic">
                {currentArtwork?.description.artistic}
              </p>
            </div>

            {/* Tags */}
            {currentArtwork?.tags.length && currentArtwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentArtwork?.tags.map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="text-xs bg-rice-paper/10 text-rice-paper/80 border-rice-paper/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                size="sm"
                className={cn(
                  "flex-1 font-english font-medium transition-all duration-300",
                  `bg-${getSeasonalAccent(currentArtwork?.season || 'spring')} text-ink-black`,
                  `hover:bg-${getSeasonalAccent(currentArtwork?.season || 'spring')}/80`
                )}
              >
                Explore Collection
              </Button>
              
              {currentArtwork?.audio && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-rice-paper/30 text-rice-paper hover:bg-rice-paper/10"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="outline"
                className="border-rice-paper/30 text-rice-paper hover:bg-rice-paper/10"
                onClick={() => setShowInfo(!showInfo)}
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Slideshow Controls */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 bg-rice-paper/10 hover:bg-rice-paper/20 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-rice-paper" />
                ) : (
                  <Play className="w-4 h-4 text-rice-paper ml-0.5" />
                )}
              </button>
              
              <span className="font-english text-xs text-rice-paper/60">
                {currentIndex + 1} / {artworks.length}
              </span>
            </div>

            {/* Progress Indicators */}
            <div className="flex gap-2">
              {artworks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    index === currentIndex 
                      ? `bg-${getSeasonalAccent(currentArtwork?.season || 'spring')} w-8` 
                      : "bg-rice-paper/20 w-4 hover:bg-rice-paper/40"
                  )}
                  aria-label={`Go to artwork ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="sr-only">
        <h2>Featured Calligraphy Artwork</h2>
        <p>
          Currently displaying "{currentArtwork?.title.english}" by {currentArtwork?.artist.name}, 
          created during the {currentArtwork?.artist.period} period in the {currentArtwork?.artist.school} style.
        </p>
        <p>{currentArtwork?.description.cultural}</p>
      </div>
    </section>
  );
};

export default CalligraphyHero;
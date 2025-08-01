'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Calendar, 
  MapPin, 
  Award,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for artist portfolio
interface Artist {
  id: string;
  name: {
    original: string;
    romanized: string;
    english?: string;
  };
  bio: {
    short: string;
    full: string;
  };
  avatar: string;
  coverImage?: string;
  specialty: string[];
  school: string;
  period: string;
  location: string;
  achievements: string[];
  artworks: {
    id: string;
    title: string;
    image: string;
    year: string;
    dimensions: string;
    medium: string;
    featured?: boolean;
  }[];
  stats: {
    totalWorks: number;
    exhibitions: number;
    awards: number;
    followers: number;
  };
  status: 'active' | 'historical' | 'featured';
  tags: string[];
  culturalSignificance: string;
}

interface FilterOptions {
  school?: string;
  period?: string;
  specialty?: string;
  status?: string;
}

interface ArtistPortfolioGridProps {
  artists: Artist[];
  layout?: 'masonry' | 'grid' | 'list';
  showFilters?: boolean;
  showSearch?: boolean;
  itemsPerPage?: number;
  className?: string;
}

const ArtistPortfolioGrid: React.FC<ArtistPortfolioGridProps> = ({
  artists,
  layout = 'masonry',
  showFilters = true,
  showSearch = true,
  itemsPerPage = 12,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [currentLayout, setCurrentLayout] = useState<'masonry' | 'grid' | 'list'>(layout);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Filter and search logic
  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      const matchesSearch = !searchTerm || 
        artist.name.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.name.romanized.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.bio.short.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        switch (key) {
          case 'school': return artist.school === value;
          case 'period': return artist.period === value;
          case 'specialty': return artist.specialty.includes(value);
          case 'status': return artist.status === value;
          default: return true;
        }
      });

      return matchesSearch && matchesFilters;
    });
  }, [artists, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredArtists.length / itemsPerPage);
  const paginatedArtists = filteredArtists.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique filter options
  const filterOptions = useMemo(() => ({
    schools: [...new Set(artists.map(a => a.school))],
    periods: [...new Set(artists.map(a => a.period))],
    specialties: [...new Set(artists.flatMap(a => a.specialty))],
    statuses: [...new Set(artists.map(a => a.status))]
  }), [artists]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'featured': return 'temple-gold';
      case 'active': return 'summer-jade';
      case 'historical': return 'autumn-gold';
      default: return 'celadon-green';
    }
  };

  const getCardHeight = (index: number) => {
    if (currentLayout !== 'masonry') return 'auto';
    // Create varied heights for masonry effect
    const heights = ['h-96', 'h-80', 'h-[28rem]', 'h-72', 'h-[22rem]'];
    return heights[index % heights.length];
  };

  const ArtistCard: React.FC<{ artist: Artist; index: number }> = ({ artist, index }) => (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-xl",
      "bg-gradient-to-br from-silk-cream/80 to-rice-paper/90 backdrop-blur-sm",
      "border-celadon-green/20 hover:border-celadon-green/40",
      currentLayout === 'masonry' ? getCardHeight(index) : 'h-auto',
      currentLayout === 'list' ? 'flex flex-row' : 'flex flex-col'
    )}>
      {/* Cover Image or Featured Artwork */}
      <div className={cn(
        "relative overflow-hidden",
        currentLayout === 'list' ? 'w-48 flex-shrink-0' : 'aspect-[4/3]'
      )}>
        <Image
          src={artist.coverImage || artist.artworks[0]?.image || '/placeholder-art.jpg'}
          alt={`${artist.name.original} cover`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-lacquer-black/0 group-hover:bg-lacquer-black/20 transition-colors duration-300">
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-silk-cream/90">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-silk-cream/90">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="sm" className="bg-silk-cream text-ink-black hover:bg-rice-paper">
              <Eye className="w-4 h-4 mr-2" />
              View Portfolio
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <Badge 
          className={cn(
            "absolute top-3 left-3 text-xs font-medium",
            `bg-${getStatusColor(artist.status)} text-ink-black border-${getStatusColor(artist.status)}`
          )}
        >
          {artist.status}
        </Badge>
      </div>

      <CardContent className={cn(
        "p-4 flex-1",
        currentLayout === 'list' ? 'flex flex-col justify-center' : ''
      )}>
        {/* Artist Name */}
        <div className="mb-3">
          <h3 className="font-calligraphy text-lg font-semibold text-ink-black mb-1 line-clamp-1">
            {artist.name.original}
          </h3>
          <p className="font-english text-sm text-ink-black/70">
            {artist.name.romanized}
          </p>
        </div>

        {/* School and Period */}
        <div className="flex items-center gap-2 mb-3 text-xs text-ink-black/60">
          <span className="font-serif">{artist.school}</span>
          <span>•</span>
          <span className="font-english">{artist.period}</span>
          {artist.location && (
            <>
              <MapPin className="w-3 h-3 ml-1" />
              <span>{artist.location}</span>
            </>
          )}
        </div>

        {/* Bio */}
        <p className="font-serif text-sm text-ink-black/80 mb-3 leading-relaxed line-clamp-2">
          {artist.bio.short}
        </p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {artist.specialty.slice(0, 3).map((spec, index) => (
            <Badge 
              key={index}
              variant="outline"
              className="text-xs border-celadon-green/30 text-celadon-green bg-celadon-green/5"
            >
              {spec}
            </Badge>
          ))}
          {artist.specialty.length > 3 && (
            <Badge variant="outline" className="text-xs border-ink-black/20 text-ink-black/60">
              +{artist.specialty.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1 text-ink-black/60">
            <Grid className="w-3 h-3" />
            <span>{artist.stats.totalWorks} works</span>
          </div>
          <div className="flex items-center gap-1 text-ink-black/60">
            <Award className="w-3 h-3" />
            <span>{artist.stats.awards} awards</span>
          </div>
          <div className="flex items-center gap-1 text-ink-black/60">
            <Calendar className="w-3 h-3" />
            <span>{artist.stats.exhibitions} exhibitions</span>
          </div>
          <div className="flex items-center gap-1 text-ink-black/60">
            <Star className="w-3 h-3" />
            <span>{artist.stats.followers} followers</span>
          </div>
        </div>

        {/* Cultural Significance */}
        {artist.culturalSignificance && currentLayout !== 'list' && (
          <div className="mt-3 p-2 bg-temple-gold/10 rounded-md border border-temple-gold/20">
            <p className="font-serif text-xs text-ink-black/70 leading-relaxed line-clamp-2">
              {artist.culturalSignificance}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-1 gap-3 items-center">
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-black/40" />
              <Input
                placeholder="Search artists, schools, or specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-silk-cream/50 border-celadon-green/20 focus:border-celadon-green"
              />
            </div>
          )}
          
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="border-celadon-green/30 text-ink-black hover:bg-celadon-green/10"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
        </div>

        {/* Layout Controls */}
        <div className="flex gap-1 bg-silk-cream/50 rounded-lg p-1">
          {(['masonry', 'grid', 'list'] as const).map((layoutType) => (
            <Button
              key={layoutType}
              variant={currentLayout === layoutType ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentLayout(layoutType)}
              className={cn(
                "h-8 w-8 p-0",
                currentLayout === layoutType && "bg-celadon-green text-ink-black"
              )}
            >
              {layoutType === 'list' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && (
        <Card className="p-4 bg-silk-cream/30 border-celadon-green/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-ink-black mb-2 capitalize">
                  {key.slice(0, -1)}
                </label>
                <select
                  value={filters[key as keyof FilterOptions] || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value || undefined }))}
                  className="w-full p-2 rounded-md border border-celadon-green/20 bg-silk-cream text-sm"
                >
                  <option value="">All {key}</option>
                  {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({})}
              className="border-ink-black/20 text-ink-black hover:bg-ink-black/5"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-ink-black/60">
        <span>
          Showing {paginatedArtists.length} of {filteredArtists.length} artists
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Artist Grid */}
      <div className={cn(
        "gap-6",
        currentLayout === 'masonry' && "columns-1 md:columns-2 lg:columns-3 xl:columns-4 space-y-6",
        currentLayout === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        currentLayout === 'list' && "flex flex-col space-y-4"
      )}>
        {paginatedArtists.map((artist, index) => (
          <div
            key={artist.id}
            className={currentLayout === 'masonry' ? "break-inside-avoid" : ""}
          >
            <ArtistCard artist={artist} index={index} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="border-celadon-green/30"
          >
            Previous
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8",
                    currentPage === page 
                      ? "bg-celadon-green text-ink-black" 
                      : "border-celadon-green/30"
                  )}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="border-celadon-green/30"
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredArtists.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-celadon-green/10 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-celadon-green/40" />
          </div>
          <h3 className="font-calligraphy text-lg font-semibold text-ink-black mb-2">
            No artists found
          </h3>
          <p className="font-serif text-ink-black/60 mb-4">
            Try adjusting your search terms or filters to find more artists.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilters({});
            }}
            className="border-celadon-green/30 text-ink-black hover:bg-celadon-green/10"
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArtistPortfolioGrid;
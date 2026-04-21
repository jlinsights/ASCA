'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BasicSearch, PeriodSearch, StyleSearch, TechnicalSearch, PhysicalSearch, CulturalSearch, CollectionSearch, FilterSectionWrapper } from './search/GalleryFilterSections';
import ArtworkCard from './search/ArtworkCard';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { logger } from '@/lib/utils/logger';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  Calendar,
  Ruler,
  User,
  Palette,
  Tag,
  Globe,
  Eye,
  RotateCcw,
  SlidersHorizontal,
  Grid3X3,
  List,
  Star,
  Clock,
  MapPin,
  Book,
  Image as ImageIcon,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  SearchFilters, 
  SearchResult, 
  SearchFacets,
  Artwork,
  PeriodRange,
  DimensionFilter 
} from '@/lib/types/gallery';

// ===============================
// Types and Interfaces
// ===============================

interface AdvancedGallerySearchProps {
  onSearch: (filters: SearchFilters) => Promise<SearchResult>;
  initialFilters?: Partial<SearchFilters>;
  availableFilters?: {
    artists: { id: string; name: string }[];
    styles: string[];
    techniques: string[];
    mediums: string[];
    dynasties: string[];
    regions: string[];
    collections: { id: string; name: string }[];
  };
  className?: string;
}

interface FilterSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  created_date: Date;
  result_count?: number;
}

// ===============================
// Main Component
// ===============================

const AdvancedGallerySearch: React.FC<AdvancedGallerySearchProps> = ({
  onSearch,
  initialFilters = {},
  availableFilters = {
    artists: [],
    styles: [],
    techniques: [],
    mediums: [],
    dynasties: [],
    regions: [],
    collections: []
  },
  className
}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'period', 'style'])
  );

  // Filter sections configuration
  const filterSections: FilterSection[] = [
    { id: 'basic', title: 'Basic Search', icon: Search, isExpanded: true },
    { id: 'period', title: 'Historical Period', icon: Calendar, isExpanded: true },
    { id: 'style', title: 'Artistic Style', icon: Palette, isExpanded: true },
    { id: 'technical', title: 'Technical Details', icon: Settings, isExpanded: false },
    { id: 'physical', title: 'Physical Properties', icon: Ruler, isExpanded: false },
    { id: 'cultural', title: 'Cultural Context', icon: Globe, isExpanded: false },
    { id: 'collection', title: 'Collections & Exhibitions', icon: Book, isExpanded: false },
    { id: 'metadata', title: 'Metadata & Quality', icon: ImageIcon, isExpanded: false }
  ];

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await onSearch(filters);
      setSearchResult(result);
    } catch (error) {
      logger.error('Search failed', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, [filters, onSearch]);

  // Perform search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = () => {
    setFilters({});
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const saveCurrentSearch = () => {
    if (!searchName.trim()) return;
    
    const newSearch: SavedSearch = {
      id: `search_${Date.now()}`,
      name: searchName.trim(),
      filters: { ...filters },
      created_date: new Date(),
      result_count: searchResult?.total_count
    };
    
    setSavedSearches(prev => [...prev, newSearch]);
    setSearchName('');
    setShowSaveDialog(false);
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
  };

  // ===============================
  // Filter Render Functions
  // ===============================

  const renderActiveFilters = () => {
    const activeFilters: { key: string; value: string; remove: () => void }[] = [];

    // Add active filters
    if (filters.text_search) {
      activeFilters.push({
        key: 'Search',
        value: filters.text_search,
        remove: () => updateFilter('text_search', undefined)
      });
    }

    if (filters.artist_ids?.length) {
      filters.artist_ids.forEach(artistId => {
        const artist = availableFilters.artists.find(a => a.id === artistId);
        if (artist) {
          activeFilters.push({
            key: 'Artist',
            value: artist.name,
            remove: () => updateFilter('artist_ids', filters.artist_ids?.filter(id => id !== artistId))
          });
        }
      });
    }

    if (filters.styles?.length) {
      filters.styles.forEach(style => {
        activeFilters.push({
          key: 'Style',
          value: style,
          remove: () => updateFilter('styles', filters.styles?.filter(s => s !== style))
        });
      });
    }

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {activeFilters.map((filter, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            <span className="text-xs font-medium">{filter.key}:</span>
            <span className="text-xs">{filter.value}</span>
            <button
              onClick={filter.remove}
              className="ml-1 hover:bg-ink-black/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={clearFilters}
          className="h-6 px-2 text-xs"
        >
          Clear All
        </Button>
      </div>
    );
  };

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-celadon-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-black/60">Searching...</p>
        </div>
      );
    }

    if (!searchResult) return null;

    if (searchResult.total_count === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 text-ink-black/20 mx-auto mb-4" />
            <h3 className="font-calligraphy text-lg font-semibold text-ink-black mb-2">
              No Results Found
            </h3>
            <p className="text-ink-black/60 mb-4">
              Try adjusting your search criteria or removing some filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-calligraphy text-lg font-semibold text-ink-black">
              Search Results
            </h3>
            <p className="text-sm text-ink-black/60">
              Found {searchResult.total_count} artworks in {searchResult.execution_time}ms
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSaveDialog(true)}
              className="border-celadon-green text-celadon-green hover:bg-celadon-green hover:text-ink-black"
            >
              <Star className="w-3 h-3 mr-1" />
              Save Search
            </Button>

            <div className="flex gap-1 bg-rice-paper rounded-md p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? "default" : "ghost"}
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? "default" : "ghost"}
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Grid/List */}
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        )}>
          {searchResult.artworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} viewMode={viewMode} />
          ))}
        </div>

        {/* Pagination would go here */}
      </div>
    );
  };

  const renderSavedSearches = () => {
    if (savedSearches.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-temple-gold" />
            Saved Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {savedSearches.slice(0, 3).map((savedSearch) => (
              <div
                key={savedSearch.id}
                className="flex items-center justify-between p-2 hover:bg-silk-cream/50 rounded-md cursor-pointer"
                onClick={() => loadSavedSearch(savedSearch)}
              >
                <div>
                  <h4 className="font-medium text-sm text-ink-black">{savedSearch.name}</h4>
                  <p className="text-xs text-ink-black/60">
                    {savedSearch.result_count} results • {savedSearch.created_date.toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-black/40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="font-calligraphy text-2xl font-bold text-ink-black mb-2">
          Gallery Search
        </h1>
        <p className="text-ink-black/70">
          Discover artworks through advanced filtering and search capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Saved Searches */}
          {renderSavedSearches()}

          {/* Filter Sections */}
          <div className="space-y-4">
            {filterSections.map((section) => <FilterSectionWrapper key={section.id} section={section} expandedSections={expandedSections} toggleSection={toggleSection} filters={filters} updateFilter={updateFilter} availableFilters={availableFilters} />)}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Active Filters */}
          {renderActiveFilters()}

          {/* Search Results */}
          {renderSearchResults()}
        </div>
      </div>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-ink-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-full mx-4">
            <CardHeader>
              <CardTitle className="text-lg">Save Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-black mb-2">
                  Search Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter a name for this search..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={saveCurrentSearch}
                  disabled={!searchName.trim()}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ===============================
// Artwork Card Component
// ===============================



export default AdvancedGallerySearch;
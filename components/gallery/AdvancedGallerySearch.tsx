'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  const renderBasicSearch = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Search Text</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-black/40" />
          <Input
            type="text"
            placeholder="Search by title, artist, description..."
            value={filters.text_search || ''}
            onChange={(e) => updateFilter('text_search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Artists</label>
        <select
          multiple
          value={filters.artist_ids || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('artist_ids', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-24"
        >
          {availableFilters.artists.map(artist => (
            <option key={artist.id} value={artist.id}>
              {artist.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-ink-black/60 mt-1">Hold Ctrl/Cmd to select multiple</p>
      </div>
    </div>
  );

  const renderPeriodSearch = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-black mb-2">Start Year</label>
          <Input
            type="number"
            placeholder="e.g., 1000"
            value={filters.creation_date?.start_date ? new Date(filters.creation_date.start_date).getFullYear() : ''}
            onChange={(e) => {
              const year = parseInt(e.target.value);
              if (!isNaN(year)) {
                updateFilter('creation_date', {
                  ...filters.creation_date,
                  start_date: new Date(year, 0, 1)
                });
              }
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-black mb-2">End Year</label>
          <Input
            type="number"
            placeholder="e.g., 1500"
            value={filters.creation_date?.end_date ? new Date(filters.creation_date.end_date).getFullYear() : ''}
            onChange={(e) => {
              const year = parseInt(e.target.value);
              if (!isNaN(year)) {
                updateFilter('creation_date', {
                  ...filters.creation_date,
                  end_date: new Date(year, 11, 31)
                });
              }
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Dynasty</label>
        <select
          multiple
          value={filters.dynasty || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('dynasty', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          {availableFilters.dynasties.map(dynasty => (
            <option key={dynasty} value={dynasty}>
              {dynasty}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Region</label>
        <select
          multiple
          value={filters.region || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('region', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          {availableFilters.regions.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStyleSearch = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Calligraphy Styles</label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {availableFilters.styles.map(style => (
            <label key={style} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.styles?.includes(style) || false}
                onChange={(e) => {
                  const currentStyles = filters.styles || [];
                  if (e.target.checked) {
                    updateFilter('styles', [...currentStyles, style]);
                  } else {
                    updateFilter('styles', currentStyles.filter(s => s !== style));
                  }
                }}
                className="rounded border-celadon-green/30"
              />
              <span className="text-sm text-ink-black">{style}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Techniques</label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {availableFilters.techniques.map(technique => (
            <label key={technique} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.techniques?.includes(technique) || false}
                onChange={(e) => {
                  const currentTechniques = filters.techniques || [];
                  if (e.target.checked) {
                    updateFilter('techniques', [...currentTechniques, technique]);
                  } else {
                    updateFilter('techniques', currentTechniques.filter(t => t !== technique));
                  }
                }}
                className="rounded border-celadon-green/30"
              />
              <span className="text-sm text-ink-black">{technique}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Medium</label>
        <select
          multiple
          value={filters.mediums || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('mediums', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          {availableFilters.mediums.map(medium => (
            <option key={medium} value={medium}>
              {medium}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderTechnicalSearch = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Image Quality</label>
        <select
          value={filters.image_quality || ''}
          onChange={(e) => updateFilter('image_quality', e.target.value || undefined)}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
        >
          <option value="">Any Quality</option>
          <option value="thumbnail">Thumbnail</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="original">Original Resolution</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.has_annotations || false}
            onChange={(e) => updateFilter('has_annotations', e.target.checked)}
            className="rounded border-celadon-green/30"
          />
          <span className="text-sm text-ink-black">Has Annotations</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.has_stroke_analysis || false}
            onChange={(e) => updateFilter('has_stroke_analysis', e.target.checked)}
            className="rounded border-celadon-green/30"
          />
          <span className="text-sm text-ink-black">Has Stroke Analysis</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.has_educational_content || false}
            onChange={(e) => updateFilter('has_educational_content', e.target.checked)}
            className="rounded border-celadon-green/30"
          />
          <span className="text-sm text-ink-black">Has Educational Content</span>
        </label>
      </div>
    </div>
  );

  const renderPhysicalSearch = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Dimensions (cm)</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              placeholder="Min Width"
              value={filters.dimensions?.min_width || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateFilter('dimensions', {
                  ...filters.dimensions,
                  min_width: isNaN(value) ? undefined : value
                });
              }}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max Width"
              value={filters.dimensions?.max_width || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateFilter('dimensions', {
                  ...filters.dimensions,
                  max_width: isNaN(value) ? undefined : value
                });
              }}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Min Height"
              value={filters.dimensions?.min_height || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateFilter('dimensions', {
                  ...filters.dimensions,
                  min_height: isNaN(value) ? undefined : value
                });
              }}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max Height"
              value={filters.dimensions?.max_height || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                updateFilter('dimensions', {
                  ...filters.dimensions,
                  max_height: isNaN(value) ? undefined : value
                });
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Condition</label>
        <select
          multiple
          value={filters.condition || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('condition', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          <option value="excellent">Excellent</option>
          <option value="very_good">Very Good</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.provenance_verified || false}
            onChange={(e) => updateFilter('provenance_verified', e.target.checked)}
            className="rounded border-celadon-green/30"
          />
          <span className="text-sm text-ink-black">Verified Provenance</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.exhibition_history || false}
            onChange={(e) => updateFilter('exhibition_history', e.target.checked)}
            className="rounded border-celadon-green/30"
          />
          <span className="text-sm text-ink-black">Has Exhibition History</span>
        </label>
      </div>
    </div>
  );

  const renderCulturalSearch = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">School/Lineage</label>
        <select
          multiple
          value={filters.school || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('school', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          <option value="imperial">Imperial Court</option>
          <option value="scholar">Scholar Tradition</option>
          <option value="monk">Monastery</option>
          <option value="folk">Folk Tradition</option>
          <option value="modern">Modern School</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Lineage</label>
        <select
          multiple
          value={filters.lineage || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('lineage', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          <option value="wang_xizhi">Wang Xizhi Lineage</option>
          <option value="yan_zhenqing">Yan Zhenqing Lineage</option>
          <option value="zhao_mengfu">Zhao Mengfu Lineage</option>
          <option value="dong_qichang">Dong Qichang School</option>
        </select>
      </div>
    </div>
  );

  const renderCollectionSearch = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Collections</label>
        <select
          multiple
          value={filters.collection_ids || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('collection_ids', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-24"
        >
          {availableFilters.collections.map(collection => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Exhibition History</label>
        <select
          multiple
          value={filters.exhibition_ids || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('exhibition_ids', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          <option value="palace_museum_2023">Palace Museum 2023</option>
          <option value="met_masters_2022">Metropolitan Museum Masters 2022</option>
          <option value="national_gallery_2021">National Gallery 2021</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">Curator Selections</label>
        <select
          multiple
          value={filters.curator_selections || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            updateFilter('curator_selections', values);
          }}
          className="w-full p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm h-20"
        >
          <option value="masterpieces">Masterpieces</option>
          <option value="educational">Educational Highlights</option>
          <option value="rare_finds">Rare Discoveries</option>
          <option value="contemporary">Contemporary Masters</option>
        </select>
      </div>
    </div>
  );

  const renderFilterSection = (section: FilterSection) => {
    const isExpanded = expandedSections.has(section.id);
    const Icon = section.icon;

    return (
      <Card key={section.id} className="border-celadon-green/20">
        <CardHeader 
          className="pb-3 cursor-pointer hover:bg-silk-cream/30 transition-colors"
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Icon className="w-4 h-4 text-celadon-green" />
              {section.title}
            </CardTitle>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-ink-black/60" />
            ) : (
              <ChevronDown className="w-4 h-4 text-ink-black/60" />
            )}
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            {section.id === 'basic' && renderBasicSearch()}
            {section.id === 'period' && renderPeriodSearch()}
            {section.id === 'style' && renderStyleSearch()}
            {section.id === 'technical' && renderTechnicalSearch()}
            {section.id === 'physical' && renderPhysicalSearch()}
            {section.id === 'cultural' && renderCulturalSearch()}
            {section.id === 'collection' && renderCollectionSearch()}
          </CardContent>
        )}
      </Card>
    );
  };

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
            {filterSections.map(renderFilterSection)}
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

const ArtworkCard: React.FC<{ 
  artwork: Artwork; 
  viewMode: 'grid' | 'list' 
}> = ({ artwork, viewMode }) => {
  const primaryImage = artwork.images.find(img => img.type === 'primary') || artwork.images[0];

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <div className="flex">
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={primaryImage?.urls.small || '/placeholder-artwork.jpg'}
              alt={artwork.title.english}
              fill
              sizes="96px"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-calligraphy font-semibold text-ink-black mb-1">
                  {artwork.title.original}
                </h3>
                <p className="text-sm text-ink-black/70 mb-1">{artwork.title.english}</p>
                <p className="text-sm text-ink-black/60">{artwork.artist.name}</p>
                {artwork.historical_context.creation_date.period && (
                  <p className="text-xs text-ink-black/50">
                    {artwork.historical_context.creation_date.period}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className="text-xs">{artwork.artistic_analysis.style.name.english}</Badge>
                <div className="flex items-center gap-1 text-xs text-ink-black/60">
                  <Clock className="w-3 h-3" />
                  <span>{artwork.physical_details.dimensions.width} × {artwork.physical_details.dimensions.height} cm</span>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={primaryImage?.urls.medium || '/placeholder-artwork.jpg'}
          alt={artwork.title.english}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-calligraphy font-semibold text-ink-black mb-2 line-clamp-1">
          {artwork.title.original}
        </h3>
        <p className="text-sm text-ink-black/70 mb-1 line-clamp-1">{artwork.title.english}</p>
        <p className="text-sm text-ink-black/60 mb-3">{artwork.artist.name}</p>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {artwork.artistic_analysis.style.name.english}
          </Badge>
          <div className="text-xs text-ink-black/60">
            {artwork.physical_details.dimensions.width} × {artwork.physical_details.dimensions.height} cm
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedGallerySearch;
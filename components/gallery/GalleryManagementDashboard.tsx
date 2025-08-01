'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { logger } from '@/lib/utils/logger';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Upload,
  Download,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Check,
  X,
  AlertTriangle,
  Clock,
  Users,
  Image as ImageIcon,
  FileText,
  Star,
  Archive,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Calendar,
  MapPin,
  Palette,
  Brush,
  Globe,
  Shield,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  Artwork, 
  Collection, 
  VirtualExhibition,
  ArtworkAnalytics,
  BulkOperationResult 
} from '@/lib/types/gallery';

// ===============================
// Types and Interfaces
// ===============================

interface GalleryStats {
  total_artworks: number;
  published_artworks: number;
  draft_artworks: number;
  pending_review: number;
  total_collections: number;
  active_exhibitions: number;
  total_views: number;
  monthly_growth: number;
  storage_used: number;
  storage_limit: number;
}

interface ManagementFilters {
  status?: 'all' | 'published' | 'draft' | 'review' | 'archived';
  visibility?: 'all' | 'public' | 'members' | 'private';
  artist?: string;
  collection?: string;
  date_range?: { start: Date; end: Date };
  search?: string;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (items: string[]) => Promise<BulkOperationResult>;
  requiresConfirmation: boolean;
  destructive?: boolean;
}

interface GalleryManagementDashboardProps {
  artworks: Artwork[];
  collections: Collection[];
  exhibitions: VirtualExhibition[];
  analytics: ArtworkAnalytics[];
  onArtworkUpdate: (artwork: Artwork) => Promise<void>;
  onArtworkDelete: (artworkId: string) => Promise<void>;
  onBulkAction: (action: string, items: string[]) => Promise<BulkOperationResult>;
  className?: string;
}

// ===============================
// Main Component
// ===============================

const GalleryManagementDashboard: React.FC<GalleryManagementDashboardProps> = ({
  artworks,
  collections,
  exhibitions,
  analytics,
  onArtworkUpdate,
  onArtworkDelete,
  onBulkAction,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'artworks' | 'collections' | 'exhibitions' | 'analytics'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState<ManagementFilters>({ status: 'all', visibility: 'all' });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['recent', 'stats']));

  // Calculate gallery statistics
  const galleryStats: GalleryStats = React.useMemo(() => {
    const published = artworks.filter(a => a.metadata.status === 'published').length;
    const draft = artworks.filter(a => a.metadata.status === 'draft').length;
    const review = artworks.filter(a => a.metadata.status === 'review').length;
    const activeExhibitions = exhibitions.filter(e => 
      new Date(e.schedule.opening_date) <= new Date() && 
      (!e.schedule.closing_date || new Date(e.schedule.closing_date) >= new Date())
    ).length;

    const totalViews = analytics.reduce((sum, a) => sum + a.metrics.total_views, 0);
    
    return {
      total_artworks: artworks.length,
      published_artworks: published,
      draft_artworks: draft,
      pending_review: review,
      total_collections: collections.length,
      active_exhibitions: activeExhibitions,
      total_views: totalViews,
      monthly_growth: 12.5, // This would come from time-series analytics
      storage_used: 2.4, // GB
      storage_limit: 10 // GB
    };
  }, [artworks, collections, exhibitions, analytics]);

  // Filter artworks based on current filters
  const filteredArtworks = React.useMemo(() => {
    return artworks.filter(artwork => {
      if (filters.status !== 'all' && artwork.metadata.status !== filters.status) return false;
      if (filters.visibility !== 'all' && artwork.metadata.visibility !== filters.visibility) return false;
      if (filters.artist && !artwork.artist.name.toLowerCase().includes(filters.artist.toLowerCase())) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          artwork.title.original.toLowerCase().includes(searchTerm) ||
          artwork.title.english.toLowerCase().includes(searchTerm) ||
          artwork.artist.name.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });
  }, [artworks, filters]);

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      id: 'publish',
      label: 'Publish',
      icon: Eye,
      action: (items) => onBulkAction('publish', items),
      requiresConfirmation: false
    },
    {
      id: 'unpublish',
      label: 'Unpublish',
      icon: EyeOff,
      action: (items) => onBulkAction('unpublish', items),
      requiresConfirmation: true
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      action: (items) => onBulkAction('archive', items),
      requiresConfirmation: true
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      action: (items) => onBulkAction('delete', items),
      requiresConfirmation: true,
      destructive: true
    }
  ];

  const handleSelectAll = () => {
    if (selectedItems.size === filteredArtworks.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredArtworks.map(a => a.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const executeBulkAction = async (actionId: string) => {
    if (selectedItems.size === 0) return;

    setIsLoading(true);
    try {
      const action = bulkActions.find(a => a.id === actionId);
      if (action) {
        const result = await action.action(Array.from(selectedItems));
        // Handle result (show toast, update UI, etc.)
        logger.info('Bulk action completed', { actionId, itemCount: Array.from(selectedItems).length });
        setSelectedItems(new Set());
        setShowBulkActions(false);
      }
    } catch (error) {
      logger.error('Bulk action failed', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
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

  // ===============================
  // Render Functions
  // ===============================

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-celadon-green/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-black/70">Total Artworks</p>
                <p className="text-2xl font-bold text-ink-black">{galleryStats.total_artworks}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-celadon-green" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {galleryStats.published_artworks} published
              </Badge>
              <Badge variant="outline" className="text-xs">
                {galleryStats.draft_artworks} drafts
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-temple-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-black/70">Collections</p>
                <p className="text-2xl font-bold text-ink-black">{galleryStats.total_collections}</p>
              </div>
              <FileText className="w-8 h-8 text-temple-gold" />
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                {galleryStats.active_exhibitions} active exhibitions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-summer-jade/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-black/70">Total Views</p>
                <p className="text-2xl font-bold text-ink-black">{galleryStats.total_views.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-summer-jade" />
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-summer-jade">
              <TrendingUp className="w-3 h-3" />
              <span>+{galleryStats.monthly_growth}% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-autumn-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-black/70">Storage Used</p>
                <p className="text-2xl font-bold text-ink-black">
                  {galleryStats.storage_used}GB
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-autumn-gold" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-ink-black/10 rounded-full h-2">
                <div 
                  className="bg-autumn-gold h-2 rounded-full" 
                  style={{ width: `${(galleryStats.storage_used / galleryStats.storage_limit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-ink-black/60 mt-1">
                {galleryStats.storage_limit - galleryStats.storage_used}GB remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('recent')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            {expandedSections.has('recent') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {expandedSections.has('recent') && (
          <CardContent>
            <div className="space-y-4">
              {artworks.slice(0, 5).map((artwork) => (
                <div key={artwork.id} className="flex items-center gap-4 p-3 bg-silk-cream/30 rounded-lg">
                  <div className="w-12 h-12 bg-celadon-green/20 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-celadon-green" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-ink-black">{artwork.title.original}</h4>
                    <p className="text-sm text-ink-black/70">{artwork.artist.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {artwork.metadata.status}
                    </Badge>
                    <p className="text-xs text-ink-black/60 mt-1">
                      {new Date(artwork.metadata.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col gap-2 bg-celadon-green text-ink-black hover:bg-celadon-green/80">
              <Plus className="w-6 h-6" />
              <span>Add Artwork</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 border-temple-gold text-temple-gold hover:bg-temple-gold hover:text-ink-black">
              <FileText className="w-6 h-6" />
              <span>Create Collection</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 border-autumn-gold text-autumn-gold hover:bg-autumn-gold hover:text-ink-black">
              <Globe className="w-6 h-6" />
              <span>New Exhibition</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderArtworksTab = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card className="bg-silk-cream/30 border-celadon-green/20">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-black/40" />
                <Input
                  type="text"
                  placeholder="Search artworks..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={filters.visibility}
                onChange={(e) => setFilters(prev => ({ ...prev, visibility: e.target.value as any }))}
                className="p-2 border border-celadon-green/20 rounded-md bg-rice-paper text-sm"
              >
                <option value="all">All Visibility</option>
                <option value="public">Public</option>
                <option value="members">Members</option>
                <option value="private">Private</option>
              </select>

              <div className="flex gap-1 bg-rice-paper rounded-md p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="mt-4 p-3 bg-temple-gold/10 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-ink-black">
                {selectedItems.size} items selected
              </span>
              <div className="flex gap-2">
                {bulkActions.map((action) => (
                  <Button
                    key={action.id}
                    size="sm"
                    variant={action.destructive ? "destructive" : "outline"}
                    onClick={() => executeBulkAction(action.id)}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <action.icon className="w-3 h-3" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Artworks List/Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Artworks ({filteredArtworks.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                className="border-ink-black/20"
              >
                {selectedItems.size === filteredArtworks.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button size="sm" className="bg-celadon-green text-ink-black hover:bg-celadon-green/80">
                <Plus className="w-4 h-4 mr-1" />
                Add Artwork
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'list' ? renderArtworksList() : renderArtworksGrid()}
        </CardContent>
      </Card>
    </div>
  );

  const renderArtworksList = () => (
    <div className="space-y-2">
      {filteredArtworks.map((artwork) => {
        const primaryImage = artwork.images.find(img => img.type === 'primary') || artwork.images[0];
        const isSelected = selectedItems.has(artwork.id);

        return (
          <div
            key={artwork.id}
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer",
              isSelected ? "bg-celadon-green/10 border-celadon-green/30" : "hover:bg-silk-cream/50 border-transparent"
            )}
            onClick={() => handleSelectItem(artwork.id)}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleSelectItem(artwork.id)}
              className="rounded border-celadon-green/30"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="relative w-16 h-16 bg-celadon-green/20 rounded-lg overflow-hidden flex-shrink-0">
              {primaryImage && (
                <Image
                  src={primaryImage.urls.thumbnail}
                  alt={artwork.title.english}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-ink-black truncate">{artwork.title.original}</h4>
              <p className="text-sm text-ink-black/70 truncate">{artwork.title.english}</p>
              <p className="text-sm text-ink-black/60">{artwork.artist.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                {artwork.metadata.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {artwork.metadata.visibility}
              </Badge>
              <div className="text-xs text-ink-black/60">
                {new Date(artwork.metadata.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderArtworksGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredArtworks.map((artwork) => {
        const primaryImage = artwork.images.find(img => img.type === 'primary') || artwork.images[0];
        const isSelected = selectedItems.has(artwork.id);

        return (
          <Card
            key={artwork.id}
            className={cn(
              "group hover:shadow-lg transition-all duration-300 cursor-pointer",
              isSelected && "ring-2 ring-celadon-green bg-celadon-green/5"
            )}
            onClick={() => handleSelectItem(artwork.id)}
          >
            <div className="relative aspect-square overflow-hidden rounded-t-lg">
              {primaryImage && (
                <Image
                  src={primaryImage.urls.medium}
                  alt={artwork.title.english}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectItem(artwork.id)}
                  className="rounded border-celadon-green/30 bg-silk-cream/90"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-silk-cream/90">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-silk-cream/90">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <h4 className="font-medium text-ink-black mb-1 line-clamp-1">
                {artwork.title.original}
              </h4>
              <p className="text-sm text-ink-black/70 mb-2 line-clamp-1">
                {artwork.title.english}
              </p>
              <p className="text-sm text-ink-black/60 mb-3">{artwork.artist.name}</p>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {artwork.metadata.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {artwork.metadata.visibility}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderCollectionsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Collections ({collections.length})</CardTitle>
            <Button size="sm" className="bg-temple-gold text-ink-black hover:bg-temple-gold/80">
              <Plus className="w-4 h-4 mr-1" />
              Create Collection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-calligraphy font-semibold text-ink-black mb-2">
                        {collection.title}
                      </h4>
                      <p className="text-sm text-ink-black/70 line-clamp-2">
                        {collection.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {collection.metadata.visibility}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-black/70">Artworks:</span>
                      <span className="font-medium">{collection.artworks.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-black/70">Views:</span>
                      <span className="font-medium">{collection.metadata.view_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-black/70">Curator:</span>
                      <span className="font-medium">{collection.curator.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExhibitionsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Virtual Exhibitions ({exhibitions.length})</CardTitle>
            <Button size="sm" className="bg-autumn-gold text-ink-black hover:bg-autumn-gold/80">
              <Plus className="w-4 h-4 mr-1" />
              Create Exhibition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exhibitions.map((exhibition) => {
              const isActive = new Date(exhibition.schedule.opening_date) <= new Date() && 
                             (!exhibition.schedule.closing_date || new Date(exhibition.schedule.closing_date) >= new Date());
              const isUpcoming = new Date(exhibition.schedule.opening_date) > new Date();

              return (
                <Card key={exhibition.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-calligraphy font-semibold text-ink-black">
                            {exhibition.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              isActive && "bg-summer-jade/20 text-summer-jade border-summer-jade",
                              isUpcoming && "bg-temple-gold/20 text-temple-gold border-temple-gold"
                            )}
                          >
                            {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Ended'}
                          </Badge>
                        </div>
                        {exhibition.subtitle && (
                          <p className="text-sm text-ink-black/70 mb-2">{exhibition.subtitle}</p>
                        )}
                        <p className="text-sm text-ink-black/80 line-clamp-2 mb-4">
                          {exhibition.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-ink-black/70">Curator:</span>
                            <span className="ml-2 font-medium">{exhibition.curation.chief_curator}</span>
                          </div>
                          <div>
                            <span className="text-ink-black/70">Sections:</span>
                            <span className="ml-2 font-medium">{exhibition.layout.sections.length}</span>
                          </div>
                          <div>
                            <span className="text-ink-black/70">Opening:</span>
                            <span className="ml-2 font-medium">
                              {new Date(exhibition.schedule.opening_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-ink-black/70">Layout:</span>
                            <span className="ml-2 font-medium capitalize">{exhibition.layout.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Visit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Artworks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Artworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.slice(0, 5).map((item, index) => {
                const artwork = artworks.find(a => a.id === item.artwork_id);
                if (!artwork) return null;

                return (
                  <div key={item.artwork_id} className="flex items-center gap-4 p-3 bg-silk-cream/30 rounded-lg">
                    <div className="w-8 h-8 bg-temple-gold text-ink-black rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-ink-black">{artwork.title.original}</h4>
                      <p className="text-sm text-ink-black/70">{artwork.artist.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-ink-black">{item.metrics.total_views.toLocaleString()}</p>
                      <p className="text-xs text-ink-black/60">views</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analytics Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-summer-jade/10 rounded-lg">
              <p className="text-2xl font-bold text-summer-jade">
                {analytics.reduce((sum, a) => sum + a.metrics.unique_viewers, 0).toLocaleString()}
              </p>
              <p className="text-sm text-ink-black/70">Unique Viewers</p>
            </div>
            
            <div className="text-center p-4 bg-temple-gold/10 rounded-lg">
              <p className="text-2xl font-bold text-temple-gold">
                {(analytics.reduce((sum, a) => sum + a.metrics.average_view_duration, 0) / analytics.length / 60).toFixed(1)}m
              </p>
              <p className="text-sm text-ink-black/70">Avg. View Time</p>
            </div>
            
            <div className="text-center p-4 bg-celadon-green/10 rounded-lg">
              <p className="text-2xl font-bold text-celadon-green">
                {analytics.reduce((sum, a) => sum + a.metrics.educational_engagement, 0)}
              </p>
              <p className="text-sm text-ink-black/70">Educational Interactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-calligraphy text-2xl font-bold text-ink-black">Gallery Management</h1>
          <p className="text-ink-black/70">Manage your digital calligraphy collection</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="border-ink-black/20">
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
          <Button variant="outline" className="border-ink-black/20">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button className="bg-celadon-green text-ink-black hover:bg-celadon-green/80">
            <Plus className="w-4 h-4 mr-1" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex gap-1 bg-silk-cream/50 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'artworks', label: 'Artworks', icon: ImageIcon },
            { id: 'collections', label: 'Collections', icon: FileText },
            { id: 'exhibitions', label: 'Exhibitions', icon: Globe },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "ghost"}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                "flex items-center gap-2",
                activeTab === id && "bg-celadon-green text-ink-black"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'artworks' && renderArtworksTab()}
      {activeTab === 'collections' && renderCollectionsTab()}
      {activeTab === 'exhibitions' && renderExhibitionsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </div>
  );
};

export default GalleryManagementDashboard;
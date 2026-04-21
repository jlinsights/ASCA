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
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';

const OverviewTab = dynamic(() => import('./dashboard/OverviewTab').then(mod => mod.OverviewTab));
const CollectionsTab = dynamic(() => import('./dashboard/CollectionsTab').then(mod => mod.CollectionsTab));
const ExhibitionsTab = dynamic(() => import('./dashboard/ExhibitionsTab').then(mod => mod.ExhibitionsTab));
const AnalyticsTab = dynamic(() => import('./dashboard/AnalyticsTab').then(mod => mod.AnalyticsTab));
const ArtworksTab = dynamic(() => import('./dashboard/ArtworksTab').then(mod => mod.ArtworksTab));

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
      <ErrorBoundary fallback={<div className="p-4 m-4 bg-red-50 text-red-800 rounded-md">오류: 탭 컴포넌트를 불러올 수 없습니다.</div>}>
      {activeTab === 'overview' && <OverviewTab galleryStats={galleryStats} expandedSections={expandedSections} toggleSection={toggleSection} artworks={artworks} />}
      {activeTab === 'artworks' && <ArtworksTab filters={filters} setFilters={setFilters} viewMode={viewMode} setViewMode={setViewMode} selectedItems={selectedItems} handleSelectAll={handleSelectAll} bulkActions={bulkActions} executeBulkAction={executeBulkAction} isLoading={isLoading} filteredArtworks={filteredArtworks} handleSelectItem={handleSelectItem} />}
      {activeTab === 'collections' && <CollectionsTab collections={collections} />}
      {activeTab === 'exhibitions' && <ExhibitionsTab exhibitions={exhibitions} />}
      {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} artworks={artworks} />}
      </ErrorBoundary>
    </div>
  );
};

export default GalleryManagementDashboard;
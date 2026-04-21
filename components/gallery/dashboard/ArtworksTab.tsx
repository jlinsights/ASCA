
import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, List, Grid3X3, Plus, Edit, Eye, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
export const ArtworksList = ({ filteredArtworks, selectedItems, handleSelectItem }: any) => {
  return (
    <div className="space-y-2">
      {filteredArtworks.map((artwork: any) => {
        const primaryImage = artwork.images.find((img: any) => img.type === 'primary') || artwork.images[0];
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
};

export const ArtworksGrid = ({ filteredArtworks, selectedItems, handleSelectItem }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredArtworks.map((artwork: any) => {
        const primaryImage = artwork.images.find((img: any) => img.type === 'primary') || artwork.images[0];
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
};

export const ArtworksTab = ({ 
  filters, setFilters, viewMode, setViewMode, selectedItems, handleSelectAll, bulkActions, executeBulkAction, isLoading, filteredArtworks, handleSelectItem 
}: any) => {
  return (
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
                  onChange={(e) => setFilters((prev: any) => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev: any) => ({ ...prev, status: e.target.value as any }))}
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
                onChange={(e) => setFilters((prev: any) => ({ ...prev, visibility: e.target.value as any }))}
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
                {bulkActions.map((action: any) => (
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
          {viewMode === 'list' ? <ArtworksList filteredArtworks={filteredArtworks} selectedItems={selectedItems} handleSelectItem={handleSelectItem} /> : <ArtworksGrid filteredArtworks={filteredArtworks} selectedItems={selectedItems} handleSelectItem={handleSelectItem} />}
        </CardContent>
      </Card>
    </div>
  );
};

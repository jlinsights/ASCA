'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, X, Star, Check, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Artwork } from '@/types/artwork'

interface SelectedArtwork extends Artwork {
  displayOrder: number
  isFeatured: boolean
}

interface ArtworkSelectorProps {
  artworks: Artwork[]
  selectedArtworks?: SelectedArtwork[]
  onSelectionChange: (selected: SelectedArtwork[]) => void
  maxSelection?: number
  allowFeatured?: boolean
}

export function ArtworkSelector({
  artworks,
  selectedArtworks = [],
  onSelectionChange,
  maxSelection,
  allowFeatured = true,
}: ArtworkSelectorProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<SelectedArtwork[]>(selectedArtworks)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Filter artworks based on search
  const filteredArtworks = artworks.filter((artwork) => {
    const searchLower = search.toLowerCase()
    return (
      artwork.title.toLowerCase().includes(searchLower) ||
      artwork.titleEn?.toLowerCase().includes(searchLower) ||
      artwork.medium.toLowerCase().includes(searchLower)
    )
  })

  // Check if artwork is selected
  const isSelected = (artworkId: string) => {
    return selected.some((s) => s.id === artworkId)
  }

  // Toggle artwork selection
  const toggleSelection = (artwork: Artwork) => {
    if (isSelected(artwork.id)) {
      // Remove from selection
      const newSelected = selected.filter((s) => s.id !== artwork.id)
      // Reorder remaining items
      const reordered = newSelected.map((item, index) => ({
        ...item,
        displayOrder: index,
      }))
      setSelected(reordered)
      onSelectionChange(reordered)
    } else {
      // Add to selection
      if (maxSelection && selected.length >= maxSelection) {
        return // Max selection reached
      }
      const newItem: SelectedArtwork = {
        ...artwork,
        displayOrder: selected.length,
        isFeatured: false,
      }
      const newSelected = [...selected, newItem]
      setSelected(newSelected)
      onSelectionChange(newSelected)
    }
  }

  // Toggle featured status
  const toggleFeatured = (artworkId: string) => {
    const newSelected = selected.map((item) =>
      item.id === artworkId ? { ...item, isFeatured: !item.isFeatured } : item
    )
    setSelected(newSelected)
    onSelectionChange(newSelected)
  }

  // Remove from selection
  const removeSelection = (artworkId: string) => {
    const newSelected = selected.filter((s) => s.id !== artworkId)
    // Reorder
    const reordered = newSelected.map((item, index) => ({
      ...item,
      displayOrder: index,
    }))
    setSelected(reordered)
    onSelectionChange(reordered)
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newSelected = [...selected]
    const draggedItem = newSelected[draggedIndex]
    
    if (!draggedItem) return // Safety check
    
    newSelected.splice(draggedIndex, 1)
    newSelected.splice(index, 0, draggedItem)

    // Update display orders
    const reordered = newSelected.map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }))

    setSelected(reordered)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    onSelectionChange(selected)
  }

  return (
    <div className="space-y-6">
      {/* Selected Artworks */}
      {selected.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-bold text-foreground">
              선택된 작품 ({selected.length}
              {maxSelection && ` / ${maxSelection}`})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected([])
                onSelectionChange([])
              }}
              className="text-scholar-red hover:text-scholar-red/80"
            >
              <X className="w-4 h-4 mr-1" />
              모두 제거
            </Button>
          </div>

          <div className="space-y-2">
            {selected.map((artwork, index) => (
              <div
                key={artwork.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 bg-card border border-celadon-green/20 rounded-lg cursor-move hover:border-celadon-green/40 transition-colors ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                {/* Drag Handle */}
                <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                {/* Artwork Image */}
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  {artwork.images?.main ? (
                    <Image
                      src={artwork.images.main.url || '/api/placeholder/100/100'}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-celadon-green/10 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>

                {/* Artwork Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{artwork.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{artwork.medium}</p>
                </div>

                {/* Featured Toggle */}
                {allowFeatured && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFeatured(artwork.id)}
                    className={`flex-shrink-0 ${
                      artwork.isFeatured
                        ? 'text-temple-gold hover:text-temple-gold/80'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${artwork.isFeatured ? 'fill-current' : ''}`} />
                  </Button>
                )}

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSelection(artwork.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-scholar-red"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {allowFeatured && (
            <p className="text-xs text-muted-foreground">
              <Star className="w-3 h-3 inline mr-1 text-temple-gold" />
              별표를 클릭하여 대표 작품으로 지정하세요
            </p>
          )}
        </div>
      )}

      {/* Artwork Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-bold text-foreground">작품 라이브러리</h3>
          {maxSelection && (
            <Badge variant="outline" className="border-celadon-green/30">
              최대 {maxSelection}개 선택 가능
            </Badge>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="작품 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Artwork Grid */}
        {filteredArtworks.length === 0 ? (
          <div className="text-center py-12 bg-card border border-dashed border-celadon-green/30 rounded-lg">
            <p className="text-muted-foreground">
              {search ? '검색 결과가 없습니다.' : '등록된 작품이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {filteredArtworks.map((artwork) => {
              const selectedState = isSelected(artwork.id)
              const disabled = maxSelection !== undefined && !selectedState && selected.length >= maxSelection

              return (
                <Card
                  key={artwork.id}
                  className={`group cursor-pointer transition-all ${
                    selectedState
                      ? 'ring-2 ring-celadon-green bg-celadon-green/5'
                      :disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-md hover:border-celadon-green/30'
                  }`}
                  onClick={() => !disabled && toggleSelection(artwork)}
                >
                  <CardContent className="p-3">
                    {/* Image */}
                    <div className="relative aspect-[3/4] rounded overflow-hidden mb-2">
                      {artwork.images?.main ? (
                        <Image
                          src={artwork.images.main.url || '/api/placeholder/200/300'}
                          alt={artwork.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-celadon-green/10 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}

                      {/* Selected Indicator */}
                      {selectedState && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-celadon-green text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <h4 className="font-semibold text-sm text-foreground truncate">{artwork.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{artwork.medium}</p>
                    {artwork.yearCreated && (
                      <p className="text-xs text-muted-foreground">{artwork.yearCreated}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

import type { Artwork } from '@/lib/types/gallery'

// ===============================
// Types and Interfaces
// ===============================

export interface ComparisonMode {
  type: 'side-by-side' | 'overlay' | 'split-view' | 'grid'
  syncZoom: boolean
  syncPan: boolean
  showAnnotations: boolean
  showRegions: boolean
  overlayOpacity?: number
}

export interface ComparisonAnalysis {
  similarities: string[]
  differences: string[]
  techniques: {
    brushwork: string
    composition: string
    style: string
  }
  cultural_context: string
  educational_notes: string[]
}

export interface ArtworkComparisonProps {
  artworks: Artwork[]
  initialMode?: ComparisonMode
  maxArtworks?: number
  onAnalysisRequest?: (artworkIds: string[]) => Promise<ComparisonAnalysis>
  className?: string
}

export interface ViewerState {
  scale: number
  offsetX: number
  offsetY: number
  isDragging: boolean
  dragStart: { x: number; y: number }
}

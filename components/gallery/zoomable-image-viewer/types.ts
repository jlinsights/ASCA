import type { ArtworkImage, ImageRegion, ImageAnnotation } from '@/lib/types/gallery'

// ===============================
// Types and Interfaces
// ===============================

export type ViewerTool = 'pan' | 'zoom' | 'measure' | 'annotate'

export interface ViewerState {
  scale: number
  offsetX: number
  offsetY: number
  rotation: number
  isDragging: boolean
  dragStart: { x: number; y: number }
  lastPinchDistance?: number
}

export interface ZoomableImageViewerProps {
  image: ArtworkImage
  className?: string
  onRegionSelect?: (region: ImageRegion) => void
  onAnnotationClick?: (annotation: ImageAnnotation) => void
  showRegions?: boolean
  showAnnotations?: boolean
  showMeasurements?: boolean
  enableFullscreen?: boolean
  enableDeepZoom?: boolean
  maxZoom?: number
  minZoom?: number
  zoomStep?: number
  onZoomChange?: (scale: number) => void
}

export interface MeasurementTool {
  id: string
  type: 'line' | 'rectangle' | 'circle'
  start: { x: number; y: number }
  end: { x: number; y: number }
  measurements: {
    length?: number
    area?: number
    perimeter?: number
  }
  unit: 'px' | 'cm' | 'mm' | 'in'
}

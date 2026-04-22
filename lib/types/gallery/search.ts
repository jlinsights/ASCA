import type { Artwork } from './artwork'

// Search and Discovery

export interface SearchFilters {
  // Basic Filters
  text_search?: string
  artist_ids?: string[]
  period_ranges?: PeriodRange[]
  styles?: string[]
  techniques?: string[]
  mediums?: string[]

  // Advanced Filters
  dimensions?: DimensionFilter
  creation_date?: DateRange
  condition?: string[]
  provenance_verified?: boolean
  has_educational_content?: boolean
  exhibition_history?: boolean

  // Cultural Filters
  dynasty?: string[]
  region?: string[]
  school?: string[]
  lineage?: string[]

  // Technical Filters
  image_quality?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original'
  has_annotations?: boolean
  has_stroke_analysis?: boolean
  color_palette?: string[]

  // Collections and Exhibitions
  collection_ids?: string[]
  exhibition_ids?: string[]
  curator_selections?: string[]
}

export interface SearchResult {
  artworks: Artwork[]
  total_count: number
  facets: SearchFacets
  suggestions?: string[]
  similar_searches?: string[]
  execution_time: number
}

export interface SearchFacets {
  artists: FacetCount[]
  periods: FacetCount[]
  styles: FacetCount[]
  techniques: FacetCount[]
  mediums: FacetCount[]
  dynasties: FacetCount[]
  regions: FacetCount[]
  conditions: FacetCount[]
}

export interface FacetCount {
  value: string
  count: number
  percentage: number
}

export interface PeriodRange {
  start_year: number
  end_year: number
  dynasty?: string
  cultural_period?: string
}

export interface DateRange {
  start_date: Date
  end_date: Date
}

export interface DimensionFilter {
  min_height?: number
  max_height?: number
  min_width?: number
  max_width?: number
  aspect_ratio?: {
    min: number
    max: number
  }
}

// 작품 카테고리 타입
export type ArtworkCategory = 'calligraphy' | 'painting' | 'sculpture' | 'mixed-media'

// 작품 스타일 타입
export type ArtworkStyle = 'traditional' | 'contemporary' | 'modern'

// 통화 타입
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY'

// 작품 상태 타입
export type ArtworkCondition = 'excellent' | 'very-good' | 'good' | 'fair'

// 작품 기본 정보 인터페이스
export interface Artwork {
  id: string
  title: string
  titleEn: string
  titleJa: string
  titleZh: string
  artist: string
  artistEn: string
  artistJa: string
  artistZh: string
  category: ArtworkCategory
  style: ArtworkStyle
  medium: string
  mediumEn: string
  mediumJa: string
  mediumZh: string
  dimensions: string
  year: number
  price?: number
  currency: Currency
  description: string
  descriptionEn: string
  descriptionJa: string
  descriptionZh: string
  imageUrl?: string
  image_url?: string
  images: string[]
  thumbnailUrl?: string
  isAvailable: boolean
  isFeatured?: boolean
  featured?: boolean
  tags: string[]
  tagsEn: string[]
  tagsJa: string[]
  tagsZh: string[]
  views: number
  likes: number
  createdAt: Date
  created_at: string
  updatedAt: Date
  // 추가 필드들
  orientation?: 'portrait' | 'landscape' | 'square'
  collection_status?: 'private' | 'museum' | 'gallery' | 'public'
}

// 작가 정보 포함 작품 인터페이스
export interface ArtworkWithArtist extends Artwork {
  artist_profile?: {
    id: string
    name: string
    nameEn?: string
    bio?: string
    bioEn?: string
  }
}

// 작품 상세 정보 인터페이스 (옵션 필드들)
export interface ArtworkDetail extends Artwork {
  artistBio?: string
  artistBioEn?: string
  artistBioJa?: string
  artistBioZh?: string
  technique?: string
  techniqueEn?: string
  techniqueJa?: string
  techniqueZh?: string
  provenance?: string
  provenanceEn?: string
  provenanceJa?: string
  provenanceZh?: string
  exhibition?: string
  exhibitionEn?: string
  exhibitionJa?: string
  exhibitionZh?: string
  condition?: ArtworkCondition
  conditionNotes?: string
  certification?: boolean
  certificateNumber?: string
  estimatedValue?: number
  acquisitionDate?: Date
  weight?: number
  materials?: string[]
  materialsEn?: string[]
  materialsJa?: string[]
  materialsZh?: string[]
}

// 작품 필터 인터페이스
export interface ArtworkFilters {
  category?: ArtworkCategory | 'all'
  style?: ArtworkStyle | 'all'
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  isAvailable?: boolean
  isFeatured?: boolean
  artist?: string
  searchTerm?: string
  tags?: string[]
}

// 정렬 옵션 타입
export type SortOption = 
  | 'featured'
  | 'newest'
  | 'oldest'
  | 'price-low'
  | 'price-high'
  | 'popular'
  | 'alphabetical'
  | 'artist'

// 작품 정렬 인터페이스
export interface ArtworkSort {
  field: SortOption
  direction?: 'asc' | 'desc'
}

// 페이지네이션 인터페이스
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 작품 목록 응답 인터페이스
export interface ArtworkListResponse {
  artworks: Artwork[]
  pagination: Pagination
  filters: ArtworkFilters
  sort: ArtworkSort
}

// 작품 검색 결과 인터페이스
export interface ArtworkSearchResult {
  artwork: Artwork
  score: number
  highlights?: {
    title?: string
    description?: string
    artist?: string
    tags?: string[]
  }
}

// 관련 작품 인터페이스
export interface RelatedArtwork {
  artwork: Artwork
  relationScore: number
  relationType: 'same-artist' | 'same-category' | 'same-style' | 'similar-tags'
}

// 작품 통계 인터페이스
export interface ArtworkStats {
  totalArtworks: number
  availableArtworks: number
  soldArtworks: number
  featuredArtworks: number
  categoryCounts: Record<ArtworkCategory, number>
  styleCounts: Record<ArtworkStyle, number>
  averagePrice: number
  priceRange: {
    min: number
    max: number
  }
  yearRange: {
    min: number
    max: number
  }
}

// 카테고리 정보 인터페이스
export interface CategoryInfo {
  id: ArtworkCategory
  title: string
  titleEn: string
  titleJa: string
  titleZh: string
  description: string
  descriptionEn: string
  descriptionJa: string
  descriptionZh: string
  icon?: string
  color?: string
  artworkCount?: number
}

// 작품 이벤트 타입
export type ArtworkEventType = 'view' | 'like' | 'unlike' | 'share' | 'inquiry' | 'favorite'

// 작품 이벤트 인터페이스
export interface ArtworkEvent {
  id: string
  artworkId: string
  eventType: ArtworkEventType
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
  timestamp: Date
}

// 작품 즐겨찾기 인터페이스
export interface ArtworkFavorite {
  id: string
  artworkId: string
  userId: string
  createdAt: Date
}

// 작품 문의 인터페이스
export interface ArtworkInquiry {
  id: string
  artworkId: string
  name: string
  email: string
  phone?: string
  message: string
  inquiryType: 'purchase' | 'information' | 'viewing' | 'other'
  status: 'pending' | 'responded' | 'closed'
  createdAt: Date
  respondedAt?: Date
} 
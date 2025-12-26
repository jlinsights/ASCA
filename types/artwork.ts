// 작품 관리 시스템 타입 정의

export type ArtworkCategory =
  | 'calligraphy'
  | 'traditional-painting'
  | 'modern-painting'
  | 'sculpture'
  | 'photography'
  | 'digital-art'
  | 'mixed-media'
  | 'installation'
  | 'video-art'

export type ArtworkStatus = 'draft' | 'published' | 'archived' | 'in-exhibition'

export type DimensionUnit = 'cm' | 'inch' | 'mm'

export interface Dimensions {
  width: number
  height: number
  depth?: number
  unit: DimensionUnit
}

export interface ArtworkImage {
  id: string
  url: string
  thumbnailUrl?: string
  alt?: string
  order: number
}

export interface Artwork {
  id: string
  artistId: string
  
  // 기본 정보
  title: string
  titleEn?: string
  description: string
  descriptionEn?: string
  
  // 작품 분류
  category: ArtworkCategory
  medium: string // 재료/기법 (예: 한지에 먹, 캔버스에 유화 등)
  dimensions: Dimensions
  yearCreated: number
  
  // 이미지
  images: {
    main: ArtworkImage
    additional?: ArtworkImage[]
  }
  
  // 판매 정보
  isForSale: boolean
  price?: number
  currency?: string
  
  // 전시 연결
  exhibitions?: string[] // exhibition IDs
  contests?: string[] // contest submission IDs
  
  // 메타데이터
  tags: string[]
  style?: string // 예: 전통, 현대, 추상 등
  materials?: string[] // 상세 재료 목록
  
  // 상태 관리
  status: ArtworkStatus
  isFeatured: boolean
  displayOrder?: number
  
  // 기록
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  
  // 통계
  views?: number
  likes?: number
}

export interface ArtworkFormData {
  title: string
  titleEn?: string
  description: string
  descriptionEn?: string
  category: ArtworkCategory
  medium: string
  dimensions: Dimensions
  yearCreated: number
  isForSale: boolean
  price?: number
  tags: string[]
  style?: string
  materials?: string[]
}

export interface ArtworkFilters {
  category?: ArtworkCategory[]
  status?: ArtworkStatus[]
  yearRange?: {
    start: number
    end: number
  }
  isForSale?: boolean
  tags?: string[]
  searchTerm?: string
}

export interface ArtworkSortOptions {
  field: 'createdAt' | 'updatedAt' | 'yearCreated' | 'title' | 'views' | 'likes'
  direction: 'asc' | 'desc'
}

// 작품 업로드 관련
export interface ArtworkUploadProgress {
  artworkId?: string
  imageUploadProgress: number
  overallProgress: number
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

// 작품 통계
export interface ArtworkStats {
  totalArtworks: number
  publishedArtworks: number
  artworksByCategory: Record<ArtworkCategory, number>
  averagePrice?: number
  totalViews: number
  totalLikes: number
}

// 카테고리 라벨 (한글/영문)
export const ARTWORK_CATEGORY_LABELS: Record<ArtworkCategory, { ko: string; en: string }> = {
  'calligraphy': { ko: '서예', en: 'Calligraphy' },
  'traditional-painting': { ko: '전통 회화', en: 'Traditional Painting' },
  'modern-painting': { ko: '현대 회화', en: 'Modern Painting' },
  'sculpture': { ko: '조각', en: 'Sculpture' },
  'photography': { ko: '사진', en: 'Photography' },
  'digital-art': { ko: '디지털 아트', en: 'Digital Art' },
  'mixed-media': { ko: '혼합 매체', en: 'Mixed Media' },
  'installation': { ko: '설치 미술', en: 'Installation' },
  'video-art': { ko: '영상 작품', en: 'Video Art' }
}

// 상태 라벨
export const ARTWORK_STATUS_LABELS: Record<ArtworkStatus, { ko: string; en: string; color: string }> = {
  'draft': { ko: '임시저장', en: 'Draft', color: 'bg-gray-500' },
  'published': { ko: '공개', en: 'Published', color: 'bg-green-500' },
  'archived': { ko: '보관됨', en: 'Archived', color: 'bg-yellow-500' },
  'in-exhibition': { ko: '전시중', en: 'In Exhibition', color: 'bg-blue-500' }
}

// 작가 정보가 포함된 작품 타입
export interface ArtworkWithArtist extends Artwork {
  artist: {
    id: string
    name: string
    nameEn?: string
    profileImage?: string
    bio?: string
  }
  // Additional properties for gallery/display
  thumbnail?: string
  featured?: boolean  // Alias for isFeatured
  year?: number  // Alias for yearCreated
  availability?: 'available' | 'sold' | 'reserved'
  orientation?: 'portrait' | 'landscape' | 'square'
  collection_status?: string
  image_url?: string
}

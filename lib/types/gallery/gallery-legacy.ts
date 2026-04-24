/**
 * 갤러리 관련 타입 정의
 */

export interface GalleryItem {
  id: string
  title: string
  description: string
  category: string
  src: string
  thumbnail: string
  originalSize: number
  modifiedTime: string
  eventDate?: string
  eventYear: number  // 연도 필드 추가
  tags: string[]
  // 이미지 품질 정보 추가
  dimensions?: {
    width: number | null
    height: number | null
    aspectRatio: string
  }
  quality?: {
    isHighRes: boolean
    suggested: number
  }
}

export interface GalleryCategory {
  id: string
  name: string
  description: string
  icon: string
  count: number
}

export interface GalleryMetadata {
  totalImages: number
  lastUpdated: string
  categories: Record<string, GalleryCategory>
  yearStats: Record<number, { count: number; categories: string[] }>  // 연도별 통계 추가
  availableYears: number[]  // 사용 가능한 연도 목록
  version: string
}

export interface GalleryData {
  metadata: GalleryMetadata
  categories: GalleryCategory[]
  items: GalleryItem[]
}

export interface GalleryFilterState {
  category: string
  year: number | 'all'  // 연도 필터 추가
  searchQuery: string
  sortBy: 'date' | 'title' | 'category' | 'year'  // 연도 정렬 옵션 추가
  sortOrder: 'asc' | 'desc'
  page: number
  itemsPerPage: number
}

export interface GalleryViewState {
  viewMode: 'grid' | 'masonry' | 'list'
  selectedImage: GalleryItem | null
  isLightboxOpen: boolean
  isLoading: boolean
}

// 갤러리 이벤트 타입
export interface GalleryEvent {
  type: 'item_clicked' | 'category_changed' | 'search_performed' | 'lightbox_opened' | 'lightbox_closed'
  payload: {
    itemId?: string
    category?: string
    searchQuery?: string
    timestamp: number
  }
}
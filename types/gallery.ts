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
  tags: string[]
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
  version: string
}

export interface GalleryData {
  metadata: GalleryMetadata
  categories: GalleryCategory[]
  items: GalleryItem[]
}

export interface GalleryFilterState {
  category: string
  searchQuery: string
  sortBy: 'date' | 'title' | 'category'
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
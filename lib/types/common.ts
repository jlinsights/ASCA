// 공통 ID 타입
export type Id = string

// API 응답 타입
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// 이미지 타입
export interface ImageData {
  url: string
  alt: string
  width?: number
  height?: number
  caption?: string
}

// 멀티미디어 타입
export interface MediaItem {
  id: Id
  type: 'image' | 'video' | 'audio'
  url: string
  thumbnail?: string
  title?: string
  description?: string
  metadata?: Record<string, unknown>
}

// 검색/필터 타입
export interface SearchParams {
  query?: string
  category?: string
  tags?: string[]
  sort?: 'newest' | 'oldest' | 'popular' | 'featured'
  filters?: Record<string, unknown>
}

// 날짜 범위 타입
export interface DateRange {
  start: Date
  end: Date
}

// 위치 정보 타입
export interface Location {
  address: string
  city?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

// 소셜 공유 타입
export interface ShareData {
  title: string
  description: string
  url: string
  imageUrl?: string
}

// 에러 타입
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// 로딩 상태 타입
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 상태 관리 타입
export interface AsyncState<T> {
  data: T | null
  status: LoadingState
  error: AppError | null
} 
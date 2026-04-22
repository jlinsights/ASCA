// API Response Types

export interface GalleryApiResponse<T> {
  data: T
  success: boolean
  message?: string
  metadata?: {
    total_count?: number
    page?: number
    per_page?: number
    execution_time?: number
  }
  links?: {
    self?: string
    next?: string
    prev?: string
    first?: string
    last?: string
  }
}

export interface BulkOperationResult {
  success_count: number
  error_count: number
  errors: {
    item_id: string
    error_message: string
  }[]
  warnings: {
    item_id: string
    warning_message: string
  }[]
}

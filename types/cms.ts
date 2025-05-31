export interface Notice {
  id: string
  title: string
  content: string
  excerpt?: string
  category: 'general' | 'exhibition' | 'education' | 'competition' | 'meeting' | 'exchange'
  is_pinned: boolean
  is_published: boolean
  views: number
  author_id?: string
  author_name?: string
  created_at: string
  updated_at: string
  published_at: string
}

export interface Exhibition {
  id: string
  title: string
  subtitle?: string
  description: string
  content?: string
  start_date: string
  end_date: string
  location?: string
  venue?: string
  address?: string
  curator?: string
  featured_image_url?: string
  gallery_images?: string[]
  status: 'upcoming' | 'current' | 'past'
  is_featured: boolean
  is_published: boolean
  views: number
  max_capacity?: number
  current_visitors: number
  ticket_price?: number
  admission_fee?: number
  currency?: string
  is_free?: boolean
  opening_hours?: string
  contact?: string
  website?: string
  created_at: string
  updated_at: string
  
  // 통계 및 관련 데이터
  stats?: {
    total_artworks: number
    total_artists: number
    view_count: number
    likes: number
  }
  participating_artists?: Array<{
    id: string
    name: string
    profile_image?: string
    specialty?: string
  }>
  featured_artworks?: Array<{
    id: string
    title: string
    artist_name: string
    image_url: string
    year?: number
  }>
}

export interface Event {
  id: string
  title: string
  description: string
  content?: string
  event_date: string
  end_date?: string
  location?: string
  venue?: string
  organizer?: string
  featured_image_url?: string
  gallery_images?: string[]
  event_type: 'workshop' | 'lecture' | 'competition' | 'exhibition' | 'ceremony' | 'meeting' | 'other'
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  is_featured: boolean
  is_published: boolean
  views: number
  max_participants?: number
  current_participants: number
  registration_fee?: number
  registration_required: boolean
  registration_deadline?: string
  contact_email?: string
  contact_phone?: string
  created_at: string
  updated_at: string
}

export interface NoticeComment {
  id: string
  notice_id: string
  user_id?: string
  author_name?: string
  content: string
  is_approved: boolean
  created_at: string
  updated_at: string
}

// Search and filter types
export interface SearchFilters {
  query?: string
  category?: string
  status?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  featured?: boolean
  pinned?: boolean
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// CMS Admin types
export interface CMSStats {
  totalNotices: number
  totalExhibitions: number
  totalEvents: number
  totalViews: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'notice' | 'exhibition' | 'event'
  action: 'created' | 'updated' | 'deleted' | 'published'
  title: string
  timestamp: string
  user?: string
}

// Form types for admin
export interface NoticeFormData {
  title: string
  content: string
  excerpt?: string
  category: string
  is_pinned: boolean
  is_published: boolean
  author_name?: string
}

export interface ExhibitionFormData {
  title: string
  subtitle?: string
  description: string
  content?: string
  start_date: string
  end_date: string
  location?: string
  venue?: string
  address?: string
  curator?: string
  featured_image_url?: string
  gallery_images?: string[]
  status: 'upcoming' | 'current' | 'past'
  is_featured: boolean
  is_published: boolean
  max_capacity?: number
  ticket_price?: number
  admission_fee?: number | string
  currency?: string
  is_free?: boolean
  opening_hours?: string
  contact?: string
  website?: string
}

export interface EventFormData {
  title: string
  description: string
  content?: string
  event_date: string
  end_date?: string
  location?: string
  venue?: string
  organizer?: string
  featured_image_url?: string
  gallery_images?: string[]
  event_type: string
  is_featured: boolean
  is_published: boolean
  max_participants?: number
  registration_fee?: number
  registration_required: boolean
  registration_deadline?: string
  contact_email?: string
  contact_phone?: string
} 
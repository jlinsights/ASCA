import type { Database } from '@/lib/supabase'

// 기본 Artist 타입
export type BaseArtist = Database['public']['Tables']['artists']['Row']

// 확장된 Artist 타입 - 추가 필드 포함
export interface ExtendedArtist extends BaseArtist {
  // 연락처 정보
  location?: string
  email?: string
  phone?: string
  website?: string
  
  // 학력 정보
  education?: string[]
  
  // 통계 정보
  stats?: {
    artworksCount: number
    exhibitionsCount: number
    viewCount: number
    followers: number
    averagePrice?: number
    soldCount?: number
  }
  
  // 작품 정보
  artworks?: ExtendedArtwork[]
  
  // 소셜 미디어
  socialMedia?: {
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
  }
  
  // 추가 메타데이터
  metadata?: {
    featured: boolean
    verified: boolean
    premiumMember: boolean
    lastActive?: string
    joinDate?: string
  }
}

// 확장된 작품 타입
export interface ExtendedArtwork {
  id: string
  title: string
  description?: string
  imageUrl?: string
  thumbnailUrl?: string
  year?: number
  dimensions?: string
  medium?: string
  price?: number
  currency?: string
  isForSale: boolean
  isSold?: boolean
  category: string
  style?: string
  tags?: string[]
  metadata?: Record<string, unknown>
}

// 전시 타입
export interface Exhibition {
  id: string
  title: string
  venue?: string
  location?: string
  startDate?: string
  endDate?: string
  year?: number
  type: 'solo' | 'group' | 'special' | 'other'
  description?: string
  artworks?: string[] // artwork IDs
  curators?: string[]
  sponsors?: string[]
}

// Artist with all related data
export interface ArtistWithDetails extends ExtendedArtist {
  totalArtworks: number
  featuredArtworks: ExtendedArtwork[]
  recentExhibitions: Exhibition[]
  upcomingEvents: Exhibition[]
}

// Type guards
export function isExtendedArtist(artist: BaseArtist | ExtendedArtist): artist is ExtendedArtist {
  return 'stats' in artist || 'education' in artist || 'socialMedia' in artist
}

export function hasArtworks(artist: ExtendedArtist): artist is ExtendedArtist & { artworks: ExtendedArtwork[] } {
  return Array.isArray(artist.artworks) && artist.artworks.length > 0
}

export function hasStats(artist: ExtendedArtist): artist is ExtendedArtist & { stats: NonNullable<ExtendedArtist['stats']> } {
  return artist.stats != null
}

// Helper functions
export function getArtistDisplayName(artist: BaseArtist | ExtendedArtist, language: 'ko' | 'en' = 'ko'): string {
  if (language === 'en' && artist.name_en) {
    return artist.name_en
  }
  return artist.name
}

export function getArtistBio(artist: BaseArtist | ExtendedArtist, language: 'ko' | 'en' = 'ko'): string {
  if (language === 'en' && artist.bio_en) {
    return artist.bio_en
  }
  return artist.bio || ''
}

export function formatArtistSpecialties(specialties: string[] | null): string[] {
  if (!specialties || !Array.isArray(specialties)) {
    return []
  }
  return specialties.filter(Boolean)
}

export function getArtistContactInfo(artist: ExtendedArtist): {
  email?: string
  phone?: string
  website?: string
  location?: string
} {
  return {
    email: artist.email,
    phone: artist.phone,
    website: artist.website,
    location: artist.location
  }
}

export function getArtistSocialMedia(artist: ExtendedArtist): NonNullable<ExtendedArtist['socialMedia']> {
  return artist.socialMedia || {}
}

export function getArtistStats(artist: ExtendedArtist): NonNullable<ExtendedArtist['stats']> {
  return artist.stats || {
    artworksCount: 0,
    exhibitionsCount: 0,
    viewCount: 0,
    followers: 0
  }
}
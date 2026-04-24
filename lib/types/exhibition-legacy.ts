// Exhibition Management Types
// Defines TypeScript interfaces for exhibition system

export type ExhibitionStatus = 'upcoming' | 'current' | 'past'
export type ExhibitionArtistRole = 'organizer' | 'curator' | 'participant' | 'guest'

/**
 * Base Exhibition interface matching database schema
 */
export interface Exhibition {
  id: string
  title: string
  subtitle?: string | null
  description: string
  content?: string | null
  startDate: string
  endDate: string
  location?: string | null
  venue?: string | null
  curator?: string | null
  featuredImageUrl?: string | null
  galleryImages?: string[] | null
  status: ExhibitionStatus
  isFeatured: boolean
  isPublished: boolean
  views: number
  maxCapacity?: number | null
  currentVisitors?: number | null
  ticketPrice?: number | null
  createdAt: string
  updatedAt: string
}

/**
 * Exhibition-Artwork relationship
 */
export interface ExhibitionArtwork {
  id: string
  exhibitionId: string
  artworkId: string
  displayOrder: number
  isFeatured: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Exhibition-Artist relationship
 */
export interface ExhibitionArtist {
  id: string
  exhibitionId: string
  artistId: string
  role: ExhibitionArtistRole
  bio?: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Exhibition with related data
 */
export interface ExhibitionWithDetails extends Exhibition {
  artworks: Array<{
    id: string
    artworkId: string
    displayOrder: number
    isFeatured: boolean
    notes?: string | null
  }>
  artists: Array<{
    id: string
    artistId: string
    role: ExhibitionArtistRole
    bio?: string | null
    displayOrder: number
  }>
}

/**
 * Exhibition with full artwork and artist information
 */
export interface ExhibitionFull extends Exhibition {
  artworks: Array<{
    relationId: string
    id: string
    title: string
    titleEn?: string | null
    images?: any[]
    artistId: string
    displayOrder: number
    isFeatured: boolean
  }>
  artists: Array<{
    relationId: string
    id: string
    name: string
    nameEn?: string | null
    profileImage?: string | null
    role: ExhibitionArtistRole
    bio?: string | null
    displayOrder: number
  }>
  artworkCount: number
  artistCount: number
  featuredArtworkCount: number
}

/**
 * Form data for creating/editing exhibitions
 */
export interface ExhibitionFormData {
  title: string
  subtitle?: string
  description: string
  content?: string
  startDate: string
  endDate: string
  location?: string
  venue?: string
  curator?: string
  featuredImage?: File | string
  galleryImages?: Array<File | string>
  artworkIds?: string[]
  artistInvites?: Array<{
    artistId: string
    role: ExhibitionArtistRole
    bio?: string
  }>
  isFeatured?: boolean
  isPublished?: boolean
  maxCapacity?: number
  ticketPrice?: number
}

/**
 * Filters for querying exhibitions
 */
export interface ExhibitionFilters {
  status?: ExhibitionStatus
  isFeatured?: boolean
  isPublished?: boolean
  artistId?: string
  artworkId?: string
  search?: string
  startDateFrom?: string
  startDateTo?: string
  endDateFrom?: string
  endDateTo?: string
}

/**
 * Exhibition statistics for an artist
 */
export interface ExhibitionSummary {
  totalExhibitions: number
  upcomingExhibitions: number
  currentExhibitions: number
  pastExhibitions: number
  featuredExhibitions: number
}

/**
 * Artwork order update payload
 */
export interface ArtworkOrderUpdate {
  artworkId: string
  displayOrder: number
}

/**
 * Exhibition status labels (Korean/English)
 */
export const EXHIBITION_STATUS_LABELS: Record<ExhibitionStatus, { ko: string; en: string }> = {
  upcoming: { ko: '예정', en: 'Upcoming' },
  current: { ko: '진행중', en: 'Current' },
  past: { ko: '종료', en: 'Past' },
}

/**
 * Exhibition artist role labels (Korean/English)
 */
export const EXHIBITION_ARTIST_ROLE_LABELS: Record<ExhibitionArtistRole, { ko: string; en: string }> = {
  organizer: { ko: '주최자', en: 'Organizer' },
  curator: { ko: '큐레이터', en: 'Curator' },
  participant: { ko: '참여 작가', en: 'Participant' },
  guest: { ko: '초대 작가', en: 'Guest Artist' },
}

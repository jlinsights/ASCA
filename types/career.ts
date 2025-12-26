// Career Management Types for Phase 2

export type CareerEntryType = 
  | 'exhibition'
  | 'award'
  | 'education'
  | 'publication'
  | 'media'
  | 'residency'
  | 'workshop'

export interface CareerEntry {
  id: string
  artistId: string
  type: CareerEntryType
  
  // Basic info
  title: string
  titleEn?: string
  organization?: string
  organizationEn?: string
  
  // Date
  year: number
  month?: number
  startDate?: Date
  endDate?: Date
  
  // Details
  description?: string
  descriptionEn?: string
  location?: string
  role?: string
  
  // Media & Links
  images?: string[]
  documents?: string[]
  externalUrl?: string
  
  // Metadata
  isFeatured: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

// Exhibition-specific
export interface ExhibitionEntry extends CareerEntry {
  type: 'exhibition'
  exhibitionType: 'solo' | 'group' | 'online' | 'international'
  artworkIds?: string[] // Link to artworks displayed
  venue?: string
  curator?: string
}

// Award-specific
export interface AwardEntry extends CareerEntry {
  type: 'award'
  awardType: 'prize' | 'grant' | 'scholarship' | 'recognition'
  prizeAmount?: number
  currency?: string
}

// Education-specific
export interface EducationEntry extends CareerEntry {
  type: 'education'
  degree?: string
  major?: string
  graduationYear?: number
}

// Publication-specific
export interface PublicationEntry extends CareerEntry {
  type: 'publication'
  publicationType: 'book' | 'article' | 'interview' | 'review' | 'catalog'
  publisher?: string
  isbn?: string
  pages?: string
}

// Media mention-specific
export interface MediaEntry extends CareerEntry {
  type: 'media'
  mediaType: 'tv' | 'radio' | 'newspaper' | 'magazine' | 'online'
  mediaOutlet?: string
}

// Timeline view options
export interface TimelineFilters {
  types?: CareerEntryType[]
  yearRange?: {
    start: number
    end: number
  }
  isFeatured?: boolean
  search?: string
}

export interface TimelineView {
  groupBy: 'year' | 'type' | 'chronological'
  sortOrder: 'asc' | 'desc'
  showImages: boolean
}

// Form data
export interface CareerEntryFormData {
  type: CareerEntryType
  title: string
  titleEn?: string
  organization?: string
  organizationEn?: string
  year: number
  month?: number
  startDate?: string
  endDate?: string
  description?: string
  descriptionEn?: string
  location?: string
  role?: string
  externalUrl?: string
  isFeatured: boolean
  
  // Type-specific fields
  exhibitionType?: 'solo' | 'group' | 'online' | 'international'
  venue?: string
  curator?: string
  artworkIds?: string[]
  
  awardType?: 'prize' | 'grant' | 'scholarship' | 'recognition'
  prizeAmount?: number
  currency?: string
  
  degree?: string
  major?: string
  graduationYear?: number
  
  publicationType?: 'book' | 'article' | 'interview' | 'review' | 'catalog'
  publisher?: string
  isbn?: string
  pages?: string
  
  mediaType?: 'tv' | 'radio' | 'newspaper' | 'magazine' | 'online'
  mediaOutlet?: string
}

// Display labels
export const CAREER_ENTRY_TYPE_LABELS: Record<CareerEntryType, { ko: string; en: string }> = {
  exhibition: { ko: '전시', en: 'Exhibition' },
  award: { ko: '수상', en: 'Award' },
  education: { ko: '학력', en: 'Education' },
  publication: { ko: '출판', en: 'Publication' },
  media: { ko: '언론', en: 'Media' },
  residency: { ko: '레지던시', en: 'Residency' },
  workshop: { ko: '워크샵', en: 'Workshop' }
}

// Artist Profile and Portfolio Types

export interface SocialLinks {
  website?: string
  instagram?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  blog?: string
}

export interface ArtistProfile {
  id: string
  userId: string
  
  // Basic info
  name: string
  nameEn?: string
  profileImage?: string
  bio: string
  bioEn?: string
  
  // Contact
  email?: string
  phone?: string
  location?: string
  
  // Professional info
  specialization: string[]
  yearsActive?: number
  birthYear?: number
  
  // Social links
  socialLinks?: SocialLinks
  
  // Portfolio config
  portfolioConfig?: {
    featuredArtworkIds: string[]
    layout: 'grid' | 'masonry' | 'list'
    colorTheme?: string
    showContact: boolean
    showExhibitions: boolean
    showAwards: boolean
  }
  
  // Website builder config (future)
  websiteConfig?: {
    subdomain?: string
    customDomain?: string
    template?: string
    theme?: Record<string, any>
  }
  
  // Metadata
  isPublic: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioSection {
  id: string
  type: 'artworks' | 'exhibitions' | 'awards' | 'education' | 'about' | 'contact'
  title: string
  titleEn?: string
  order: number
  isVisible: boolean
  content?: any
}

export interface ArtistStats {
  totalArtworks: number
  totalExhibitions: number
  totalAwards: number
  profileViews: number
  portfolioViews: number
}

// Form data types
export interface ArtistProfileFormData {
  name: string
  nameEn?: string
  bio: string
  bioEn?: string
  email?: string
  phone?: string
  location?: string
  specialization: string[]
  yearsActive?: number
  birthYear?: number
  socialLinks?: SocialLinks
  isPublic: boolean
}

export interface PortfolioConfigFormData {
  featuredArtworkIds: string[]
  layout: 'grid' | 'masonry' | 'list'
  colorTheme?: string
  showContact: boolean
  showExhibitions: boolean
  showAwards: boolean
}

// Display types
export interface PublicPortfolio {
  profile: ArtistProfile
  featuredArtworks: any[] // Will use Artwork type from artwork.ts
  exhibitions?: any[]
  awards?: any[]
  stats: ArtistStats
}

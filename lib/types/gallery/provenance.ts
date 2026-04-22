// Provenance and Exhibition History

export interface ProvenanceRecord {
  sequence: number
  date_range: {
    start_date?: Date
    end_date?: Date
    approximate?: string
  }
  owner: {
    name: string
    type: 'private_collector' | 'institution' | 'dealer' | 'auction_house' | 'artist_estate'
    location?: string
  }
  acquisition_method: 'purchase' | 'gift' | 'bequest' | 'commission' | 'unknown'
  acquisition_details?: string
  documentation: string[]
  confidence_level: 'certain' | 'probable' | 'possible' | 'uncertain'
  notes?: string
}

export interface ExhibitionRecord {
  id: string
  title: string
  institution: string
  location: string
  date_range: {
    start_date: Date
    end_date: Date
  }
  type: 'solo' | 'group' | 'permanent' | 'traveling'
  catalog_number?: string
  catalog_url?: string
  significance: string
  reviews?: PublicationRecord[]
}

export interface PublicationRecord {
  id: string
  title: string
  author: string
  publication: string
  date: Date
  type: 'catalog' | 'journal' | 'book' | 'newspaper' | 'website'
  pages?: string
  doi?: string
  url?: string
  relevance: string
  citation_format: string
}

export interface TouringSchedule {
  venue: string
  location: string
  start_date: Date
  end_date: Date
  local_adaptations?: string[]
}

export interface CatalogEssay {
  id: string
  title: string
  author: string
  author_bio: string
  content_url: string
  abstract: string
  keywords: string[]
  related_artworks: string[]
}

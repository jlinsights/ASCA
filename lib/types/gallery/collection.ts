import type { TouringSchedule, CatalogEssay } from './provenance'

// Collections and Virtual Exhibitions

export interface Collection {
  id: string
  title: string
  description: string
  curator: {
    id: string
    name: string
    credentials: string
    bio?: string
  }

  theme: {
    primary_focus: string
    cultural_period?: string
    artistic_movement?: string
    educational_purpose?: string
  }

  artworks: {
    artwork_id: string
    sequence_number?: number
    curatorial_note?: string
    significance_in_collection: string
  }[]

  educational_framework?: {
    learning_path: string[]
    progression_logic: string
    assessment_criteria?: string[]
  }

  metadata: {
    created_date: Date
    last_updated: Date
    visibility: 'public' | 'members' | 'scholars' | 'private'
    featured: boolean
    view_count: number
    like_count: number
  }
}

export interface VirtualExhibition {
  id: string
  title: string
  subtitle?: string
  description: string

  curation: {
    chief_curator: string
    co_curators?: string[]
    curatorial_statement: string
    exhibition_concept: string
  }

  layout: {
    type: 'linear' | 'thematic' | 'chronological' | 'comparative'
    sections: ExhibitionSection[]
    navigation_flow: string[]
  }

  virtual_elements: {
    d3_gallery?: boolean
    interactive_timeline?: boolean
    comparative_viewers?: boolean
    educational_overlays?: boolean
    audio_tour?: string[]
  }

  schedule: {
    opening_date: Date
    closing_date?: Date
    permanent?: boolean
    touring?: TouringSchedule[]
  }

  educational_programs: {
    guided_tours?: string[]
    workshops?: string[]
    lectures?: string[]
    family_activities?: string[]
  }

  catalog?: {
    digital_catalog_url?: string
    print_catalog_isbn?: string
    essays: CatalogEssay[]
  }
}

export interface ExhibitionSection {
  id: string
  title: string
  description: string
  artworks: string[]
  section_type: 'introduction' | 'thematic' | 'chronological' | 'comparative' | 'conclusion'
  educational_content?: string
  multimedia_elements?: string[]
}

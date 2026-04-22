import type { CalligraphyStyle, Technique } from './artist'
import type { Medium } from './medium'
import type { ArtworkImage } from './image'
import type {
  Dimensions,
  ArtworkCondition,
  MountingDetails,
  PreservationData,
  ArtworkMetadata,
} from './physical'
import type { ProvenanceRecord, ExhibitionRecord, PublicationRecord } from './provenance'
import type { EducationalContent } from './educational'

// Artwork Core Schema

export interface Artwork {
  id: string
  title: {
    original: string
    romanized: string
    english: string
    subtitle?: string
  }
  artist: {
    id: string
    name: string
    attribution_confidence: 'certain' | 'attributed' | 'school_of' | 'after' | 'uncertain'
    attribution_notes?: string
  }
  content: {
    text_content?: string
    text_translation?: string
    text_source?: string
    poem_type?: 'classical' | 'modern' | 'original'
    literary_significance?: string
  }
  physical_details: {
    dimensions: Dimensions
    medium: Medium
    materials: {
      paper_silk: string
      ink_type: string
      brush_type?: string
      seals_used?: string[]
    }
    condition: ArtworkCondition
    mounting?: MountingDetails
  }
  artistic_analysis: {
    style: CalligraphyStyle
    techniques: Technique[]
    composition_analysis: string
    brushwork_analysis: string
    ink_treatment: string
    artistic_merit: string
    innovation_aspects?: string[]
  }
  historical_context: {
    creation_date: {
      year?: number
      period: string
      dynasty?: string
      approximate_date?: string
    }
    historical_significance: string
    cultural_context: string
    provenance: ProvenanceRecord[]
    exhibitions: ExhibitionRecord[]
    publications: PublicationRecord[]
  }
  images: ArtworkImage[]
  educational_content?: EducationalContent
  preservation: PreservationData
  metadata: ArtworkMetadata
}

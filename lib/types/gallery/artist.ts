// Core Artist & Calligraphy Types

export interface Artist {
  id: string
  name: {
    original: string
    romanized: string
    english?: string
    aliases?: string[]
  }
  biography: {
    birth_year?: number
    death_year?: number
    birth_place?: string
    life_period: string
    dynasty?: string
    school: string
    lineage?: string
    masters?: string[]
    disciples?: string[]
  }
  profile: {
    portrait_url?: string
    signature_seal?: string
    personal_seals?: string[]
    biography_text: string
    cultural_significance: string
    notable_works?: string[]
    achievements?: string[]
  }
  style: {
    primary_styles: CalligraphyStyle[]
    innovations?: string[]
    influences?: string[]
    characteristic_techniques?: string[]
  }
  metadata: {
    created_at: Date
    updated_at: Date
    verified: boolean
    verification_source?: string
    curator_notes?: string
  }
}

export interface CalligraphyStyle {
  id: string
  name: {
    original: string
    romanized: string
    english: string
  }
  category: 'seal' | 'clerical' | 'regular' | 'running' | 'cursive' | 'modern'
  characteristics: {
    stroke_style: string
    rhythm: string
    spacing: string
    composition: string
    brushwork: string
  }
  historical_context: {
    origin_period: string
    development: string
    cultural_significance: string
    representative_masters: string[]
  }
  visual_examples: string[]
  learning_resources?: string[]
}

export interface Technique {
  id: string
  name: {
    original: string
    romanized: string
    english: string
  }
  category: 'brushwork' | 'composition' | 'ink_treatment' | 'paper_technique'
  description: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'master'
  video_demonstration?: string
  step_by_step_guide?: TechniqueStep[]
  related_techniques?: string[]
}

export interface TechniqueStep {
  step_number: number
  title: string
  description: string
  image_url?: string
  video_url?: string
  key_points: string[]
  common_mistakes?: string[]
}

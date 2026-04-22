import type { CalligraphyStyle } from './artist'

// Medium and Materials

export interface Medium {
  id: string
  name: {
    original: string
    english: string
  }
  type: 'paper' | 'silk' | 'wood' | 'stone' | 'metal' | 'bamboo' | 'other'
  characteristics: {
    texture: string
    absorbency: string
    durability: string
    cultural_significance: string
  }
  historical_usage: {
    periods: string[]
    regions: string[]
    notable_works: string[]
  }
  preparation_methods?: string[]
  preservation_requirements?: string[]
}

export interface Brush {
  id: string
  name: string
  type: 'wolf_hair' | 'goat_hair' | 'rabbit_hair' | 'mixed' | 'synthetic'
  characteristics: {
    firmness: 'soft' | 'medium' | 'hard'
    size: 'small' | 'medium' | 'large' | 'extra_large'
    shape: 'pointed' | 'flat' | 'round'
    flexibility: string
  }
  best_for: CalligraphyStyle[]
  historical_notes?: string
}

export interface Ink {
  id: string
  name: string
  type: 'stick_ink' | 'liquid_ink' | 'modern_ink'
  composition: string[]
  characteristics: {
    darkness: string
    fluidity: string
    permanence: string
    sheen: string
  }
  preparation_method?: string
  cultural_significance?: string
}

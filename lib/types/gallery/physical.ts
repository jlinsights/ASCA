// Dimensions, Condition, Mounting, Preservation, Metadata

export interface Dimensions {
  height: number
  width: number
  depth?: number
  unit: 'cm' | 'mm' | 'inch'
  notes?: string
  mounted_dimensions?: {
    height: number
    width: number
    depth?: number
  }
}

export interface ArtworkCondition {
  overall_rating: 'excellent' | 'very_good' | 'good' | 'fair' | 'poor'
  condition_report: {
    date: Date
    examiner: string
    summary: string
    detailed_report: string
    issues: ConditionIssue[]
    recommendations: string[]
  }
  conservation_history: ConservationRecord[]
  stability: 'stable' | 'at_risk' | 'requires_treatment'
}

export interface ConditionIssue {
  type: 'tear' | 'stain' | 'foxing' | 'insect_damage' | 'mold' | 'fading' | 'cracking' | 'loss'
  severity: 'minor' | 'moderate' | 'severe'
  location: string
  description: string
  image_documentation?: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface ConservationRecord {
  date: Date
  conservator: string
  institution: string
  treatment_type: string
  description: string
  materials_used: string[]
  before_images: string[]
  after_images: string[]
  report_url?: string
}

export interface MountingDetails {
  mounting_type:
    | 'scroll'
    | 'album'
    | 'handscroll'
    | 'hanging_scroll'
    | 'screen'
    | 'fan'
    | 'modern_frame'
  mounting_material: string
  mounting_date?: Date
  mounting_attribution?: string
  mounting_condition: string
  cultural_significance?: string
}

export interface PreservationData {
  storage_conditions: {
    temperature_range: string
    humidity_range: string
    light_levels: string
    air_quality_requirements: string
  }
  handling_restrictions: string[]
  loan_eligibility: boolean
  insurance_value?: number
  last_condition_check: Date
  next_scheduled_check: Date
  preservation_priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface ArtworkMetadata {
  created_at: Date
  created_by: string
  last_updated: Date
  updated_by: string
  version: number
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  visibility: 'public' | 'members' | 'scholars' | 'private'
  copyright_status: string
  usage_rights: string[]
  attribution_required: boolean
  commercial_use_allowed: boolean
  quality_score: number
  completeness_score: number
  verification_status: 'unverified' | 'partially_verified' | 'verified' | 'expert_verified'
}

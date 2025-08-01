// Comprehensive Gallery System Types
// Digital Calligraphy Gallery Platform Schema

// ===============================
// Core Artist Information
// ===============================

export interface Artist {
  id: string;
  name: {
    original: string;
    romanized: string;
    english?: string;
    aliases?: string[];
  };
  biography: {
    birth_year?: number;
    death_year?: number;
    birth_place?: string;
    life_period: string;
    dynasty?: string;
    school: string;
    lineage?: string;
    masters?: string[];
    disciples?: string[];
  };
  profile: {
    portrait_url?: string;
    signature_seal?: string;
    personal_seals?: string[];
    biography_text: string;
    cultural_significance: string;
    notable_works?: string[];
    achievements?: string[];
  };
  style: {
    primary_styles: CalligraphyStyle[];
    innovations?: string[];
    influences?: string[];
    characteristic_techniques?: string[];
  };
  metadata: {
    created_at: Date;
    updated_at: Date;
    verified: boolean;
    verification_source?: string;
    curator_notes?: string;
  };
}

// ===============================
// Calligraphy Styles and Techniques
// ===============================

export interface CalligraphyStyle {
  id: string;
  name: {
    original: string;
    romanized: string;
    english: string;
  };
  category: 'seal' | 'clerical' | 'regular' | 'running' | 'cursive' | 'modern';
  characteristics: {
    stroke_style: string;
    rhythm: string;
    spacing: string;
    composition: string;
    brushwork: string;
  };
  historical_context: {
    origin_period: string;
    development: string;
    cultural_significance: string;
    representative_masters: string[];
  };
  visual_examples: string[];
  learning_resources?: string[];
}

export interface Technique {
  id: string;
  name: {
    original: string;
    romanized: string;
    english: string;
  };
  category: 'brushwork' | 'composition' | 'ink_treatment' | 'paper_technique';
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  video_demonstration?: string;
  step_by_step_guide?: TechniqueStep[];
  related_techniques?: string[];
}

export interface TechniqueStep {
  step_number: number;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  key_points: string[];
  common_mistakes?: string[];
}

// ===============================
// Medium and Materials
// ===============================

export interface Medium {
  id: string;
  name: {
    original: string;
    english: string;
  };
  type: 'paper' | 'silk' | 'wood' | 'stone' | 'metal' | 'bamboo' | 'other';
  characteristics: {
    texture: string;
    absorbency: string;
    durability: string;
    cultural_significance: string;
  };
  historical_usage: {
    periods: string[];
    regions: string[];
    notable_works: string[];
  };
  preparation_methods?: string[];
  preservation_requirements?: string[];
}

export interface Brush {
  id: string;
  name: string;
  type: 'wolf_hair' | 'goat_hair' | 'rabbit_hair' | 'mixed' | 'synthetic';
  characteristics: {
    firmness: 'soft' | 'medium' | 'hard';
    size: 'small' | 'medium' | 'large' | 'extra_large';
    shape: 'pointed' | 'flat' | 'round';
    flexibility: string;
  };
  best_for: CalligraphyStyle[];
  historical_notes?: string;
}

export interface Ink {
  id: string;
  name: string;
  type: 'stick_ink' | 'liquid_ink' | 'modern_ink';
  composition: string[];
  characteristics: {
    darkness: string;
    fluidity: string;
    permanence: string;
    sheen: string;
  };
  preparation_method?: string;
  cultural_significance?: string;
}

// ===============================
// Artwork Core Schema
// ===============================

export interface Artwork {
  id: string;
  title: {
    original: string;
    romanized: string;
    english: string;
    subtitle?: string;
  };
  artist: {
    id: string;
    name: string;
    attribution_confidence: 'certain' | 'attributed' | 'school_of' | 'after' | 'uncertain';
    attribution_notes?: string;
  };
  content: {
    text_content?: string;
    text_translation?: string;
    text_source?: string;
    poem_type?: 'classical' | 'modern' | 'original';
    literary_significance?: string;
  };
  physical_details: {
    dimensions: Dimensions;
    medium: Medium;
    materials: {
      paper_silk: string;
      ink_type: string;
      brush_type?: string;
      seals_used?: string[];
    };
    condition: ArtworkCondition;
    mounting?: MountingDetails;
  };
  artistic_analysis: {
    style: CalligraphyStyle;
    techniques: Technique[];
    composition_analysis: string;
    brushwork_analysis: string;
    ink_treatment: string;
    artistic_merit: string;
    innovation_aspects?: string[];
  };
  historical_context: {
    creation_date: {
      year?: number;
      period: string;
      dynasty?: string;
      approximate_date?: string;
    };
    historical_significance: string;
    cultural_context: string;
    provenance: ProvenanceRecord[];
    exhibitions: ExhibitionRecord[];
    publications: PublicationRecord[];
  };
  images: ArtworkImage[];
  educational_content?: EducationalContent;
  preservation: PreservationData;
  metadata: ArtworkMetadata;
}

// ===============================
// Image and Media Management
// ===============================

export interface ArtworkImage {
  id: string;
  type: 'primary' | 'detail' | 'full_view' | 'raking_light' | 'infrared' | 'x_ray';
  urls: {
    thumbnail: string;      // 150x150
    small: string;          // 400px wide
    medium: string;         // 800px wide
    large: string;          // 1600px wide
    original: string;       // Full resolution
    zoom_tiles?: string[];  // Deep zoom tiles
  };
  metadata: {
    filename: string;
    format: 'webp' | 'avif' | 'jpg' | 'png' | 'tiff';
    dimensions: {
      width: number;
      height: number;
    };
    file_size: number;
    dpi: number;
    color_profile: string;
    capture_date?: Date;
    camera_info?: CameraInfo;
    lighting_conditions?: string;
  };
  regions?: ImageRegion[];
  annotations?: ImageAnnotation[];
  processing: {
    color_corrected: boolean;
    sharpened: boolean;
    noise_reduced: boolean;
    lens_corrected: boolean;
    processing_notes?: string;
  };
}

export interface ImageRegion {
  id: string;
  name: string;
  description: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'character' | 'seal' | 'signature' | 'damage' | 'restoration' | 'annotation';
  educational_note?: string;
  related_content?: string[];
}

export interface ImageAnnotation {
  id: string;
  position: {
    x: number;
    y: number;
  };
  type: 'stroke_analysis' | 'technique_highlight' | 'historical_note' | 'restoration_note';
  title: string;
  content: string;
  media?: {
    image_url?: string;
    video_url?: string;
    audio_url?: string;
  };
  visibility: 'always' | 'hover' | 'click';
  target_audience: 'general' | 'students' | 'scholars' | 'conservators';
}

// ===============================
// Dimensions and Physical Details
// ===============================

export interface Dimensions {
  height: number;
  width: number;
  depth?: number;
  unit: 'cm' | 'mm' | 'inch';
  notes?: string;
  mounted_dimensions?: {
    height: number;
    width: number;
    depth?: number;
  };
}

export interface ArtworkCondition {
  overall_rating: 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
  condition_report: {
    date: Date;
    examiner: string;
    summary: string;
    detailed_report: string;
    issues: ConditionIssue[];
    recommendations: string[];
  };
  conservation_history: ConservationRecord[];
  stability: 'stable' | 'at_risk' | 'requires_treatment';
}

export interface ConditionIssue {
  type: 'tear' | 'stain' | 'foxing' | 'insect_damage' | 'mold' | 'fading' | 'cracking' | 'loss';
  severity: 'minor' | 'moderate' | 'severe';
  location: string;
  description: string;
  image_documentation?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ConservationRecord {
  date: Date;
  conservator: string;
  institution: string;
  treatment_type: string;
  description: string;
  materials_used: string[];
  before_images: string[];
  after_images: string[];
  report_url?: string;
}

// ===============================
// Provenance and Exhibition History
// ===============================

export interface ProvenanceRecord {
  sequence: number;
  date_range: {
    start_date?: Date;
    end_date?: Date;
    approximate?: string;
  };
  owner: {
    name: string;
    type: 'private_collector' | 'institution' | 'dealer' | 'auction_house' | 'artist_estate';
    location?: string;
  };
  acquisition_method: 'purchase' | 'gift' | 'bequest' | 'commission' | 'unknown';
  acquisition_details?: string;
  documentation: string[];
  confidence_level: 'certain' | 'probable' | 'possible' | 'uncertain';
  notes?: string;
}

export interface ExhibitionRecord {
  id: string;
  title: string;
  institution: string;
  location: string;
  date_range: {
    start_date: Date;
    end_date: Date;
  };
  type: 'solo' | 'group' | 'permanent' | 'traveling';
  catalog_number?: string;
  catalog_url?: string;
  significance: string;
  reviews?: PublicationRecord[];
}

export interface PublicationRecord {
  id: string;
  title: string;
  author: string;
  publication: string;
  date: Date;
  type: 'catalog' | 'journal' | 'book' | 'newspaper' | 'website';
  pages?: string;
  doi?: string;
  url?: string;
  relevance: string;
  citation_format: string;
}

// ===============================
// Educational Content
// ===============================

export interface EducationalContent {
  id: string;
  learning_objectives: string[];
  target_audience: ('general_public' | 'students' | 'scholars' | 'practitioners')[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  stroke_analysis: {
    animated_strokes?: StrokeAnimation[];
    stroke_order?: string[];
    technique_breakdown: TechniqueBreakdown[];
    common_variations?: string[];
  };
  
  historical_context: {
    period_overview: string;
    cultural_significance: string;
    artistic_movement?: string;
    contemporaries?: string[];
    influence_legacy?: string;
  };
  
  technical_analysis: {
    brushwork_study: string;
    composition_analysis: string;
    ink_technique: string;
    paper_interaction: string;
    innovation_aspects?: string[];
  };
  
  comparative_studies?: {
    similar_works: string[];
    style_evolution: string[];
    regional_variations?: string[];
    modern_interpretations?: string[];
  };
  
  interactive_elements: {
    virtual_tracing?: boolean;
    style_comparison?: boolean;
    detail_exploration?: boolean;
    quiz_questions?: QuizQuestion[];
  };
  
  multimedia_resources: {
    master_class_videos?: string[];
    audio_guides?: string[];
    virtual_reality_experience?: string;
    augmented_reality_features?: string[];
  };
}

export interface StrokeAnimation {
  stroke_number: number;
  character_position?: string;
  animation_url: string;
  duration: number;
  speed_variations?: number[];
  pressure_mapping?: number[];
  educational_notes: string[];
}

export interface TechniqueBreakdown {
  technique_name: string;
  description: string;
  demonstration_url?: string;
  key_points: string[];
  common_mistakes: string[];
  practice_exercises?: string[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'identification' | 'comparison';
  question: string;
  options?: string[];
  correct_answer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  learning_objective: string;
}

// ===============================
// Search and Discovery
// ===============================

export interface SearchFilters {
  // Basic Filters
  text_search?: string;
  artist_ids?: string[];
  period_ranges?: PeriodRange[];
  styles?: string[];
  techniques?: string[];
  mediums?: string[];
  
  // Advanced Filters
  dimensions?: DimensionFilter;
  creation_date?: DateRange;
  condition?: string[];
  provenance_verified?: boolean;
  has_educational_content?: boolean;
  exhibition_history?: boolean;
  
  // Cultural Filters
  dynasty?: string[];
  region?: string[];
  school?: string[];
  lineage?: string[];
  
  // Technical Filters
  image_quality?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  has_annotations?: boolean;
  has_stroke_analysis?: boolean;
  color_palette?: string[];
  
  // Collections and Exhibitions
  collection_ids?: string[];
  exhibition_ids?: string[];
  curator_selections?: string[];
}

export interface SearchResult {
  artworks: Artwork[];
  total_count: number;
  facets: SearchFacets;
  suggestions?: string[];
  similar_searches?: string[];
  execution_time: number;
}

export interface SearchFacets {
  artists: FacetCount[];
  periods: FacetCount[];
  styles: FacetCount[];
  techniques: FacetCount[];
  mediums: FacetCount[];
  dynasties: FacetCount[];
  regions: FacetCount[];
  conditions: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
  percentage: number;
}

// ===============================
// Collections and Exhibitions
// ===============================

export interface Collection {
  id: string;
  title: string;
  description: string;
  curator: {
    id: string;
    name: string;
    credentials: string;
    bio?: string;
  };
  
  theme: {
    primary_focus: string;
    cultural_period?: string;
    artistic_movement?: string;
    educational_purpose?: string;
  };
  
  artworks: {
    artwork_id: string;
    sequence_number?: number;
    curatorial_note?: string;
    significance_in_collection: string;
  }[];
  
  educational_framework?: {
    learning_path: string[];
    progression_logic: string;
    assessment_criteria?: string[];
  };
  
  metadata: {
    created_date: Date;
    last_updated: Date;
    visibility: 'public' | 'members' | 'scholars' | 'private';
    featured: boolean;
    view_count: number;
    like_count: number;
  };
}

export interface VirtualExhibition {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  
  curation: {
    chief_curator: string;
    co_curators?: string[];
    curatorial_statement: string;
    exhibition_concept: string;
  };
  
  layout: {
    type: 'linear' | 'thematic' | 'chronological' | 'comparative';
    sections: ExhibitionSection[];
    navigation_flow: string[];
  };
  
  virtual_elements: {
    d3_gallery?: boolean;
    interactive_timeline?: boolean;
    comparative_viewers?: boolean;
    educational_overlays?: boolean;
    audio_tour?: string[];
  };
  
  schedule: {
    opening_date: Date;
    closing_date?: Date;
    permanent?: boolean;
    touring?: TouringSchedule[];
  };
  
  educational_programs: {
    guided_tours?: string[];
    workshops?: string[];
    lectures?: string[];
    family_activities?: string[];
  };
  
  catalog?: {
    digital_catalog_url?: string;
    print_catalog_isbn?: string;
    essays: CatalogEssay[];
  };
}

export interface ExhibitionSection {
  id: string;
  title: string;
  description: string;
  artworks: string[];
  section_type: 'introduction' | 'thematic' | 'chronological' | 'comparative' | 'conclusion';
  educational_content?: string;
  multimedia_elements?: string[];
}

// ===============================
// User Interaction and Analytics
// ===============================

export interface UserInteraction {
  user_id: string;
  artwork_id: string;
  interaction_type: 'view' | 'zoom' | 'compare' | 'save' | 'share' | 'annotate' | 'quiz';
  timestamp: Date;
  duration?: number;
  metadata?: {
    zoom_level?: number;
    region_viewed?: string;
    comparison_artworks?: string[];
    quiz_score?: number;
    device_type?: string;
    referrer?: string;
  };
}

export interface ArtworkAnalytics {
  artwork_id: string;
  metrics: {
    total_views: number;
    unique_viewers: number;
    average_view_duration: number;
    zoom_interactions: number;
    detail_region_views: { [region: string]: number };
    educational_engagement: number;
    share_count: number;
    save_count: number;
  };
  demographics: {
    viewer_types: { [type: string]: number };
    geographic_distribution: { [country: string]: number };
    device_breakdown: { [device: string]: number };
  };
  temporal_data: {
    daily_views: { [date: string]: number };
    peak_hours: number[];
    seasonal_trends: { [season: string]: number };
  };
}

// ===============================
// Supporting Types
// ===============================

export interface PeriodRange {
  start_year: number;
  end_year: number;
  dynasty?: string;
  cultural_period?: string;
}

export interface DateRange {
  start_date: Date;
  end_date: Date;
}

export interface DimensionFilter {
  min_height?: number;
  max_height?: number;
  min_width?: number;
  max_width?: number;
  aspect_ratio?: {
    min: number;
    max: number;
  };
}

export interface CameraInfo {
  make: string;
  model: string;
  lens: string;
  focal_length: number;
  aperture: string;
  shutter_speed: string;
  iso: number;
}

export interface MountingDetails {
  mounting_type: 'scroll' | 'album' | 'handscroll' | 'hanging_scroll' | 'screen' | 'fan' | 'modern_frame';
  mounting_material: string;
  mounting_date?: Date;
  mounting_attribution?: string;
  mounting_condition: string;
  cultural_significance?: string;
}

export interface PreservationData {
  storage_conditions: {
    temperature_range: string;
    humidity_range: string;
    light_levels: string;
    air_quality_requirements: string;
  };
  handling_restrictions: string[];
  loan_eligibility: boolean;
  insurance_value?: number;
  last_condition_check: Date;
  next_scheduled_check: Date;
  preservation_priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ArtworkMetadata {
  created_at: Date;
  created_by: string;
  last_updated: Date;
  updated_by: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  visibility: 'public' | 'members' | 'scholars' | 'private';
  copyright_status: string;
  usage_rights: string[];
  attribution_required: boolean;
  commercial_use_allowed: boolean;
  quality_score: number;
  completeness_score: number;
  verification_status: 'unverified' | 'partially_verified' | 'verified' | 'expert_verified';
}

export interface TouringSchedule {
  venue: string;
  location: string;
  start_date: Date;
  end_date: Date;
  local_adaptations?: string[];
}

export interface CatalogEssay {
  id: string;
  title: string;
  author: string;
  author_bio: string;
  content_url: string;
  abstract: string;
  keywords: string[];
  related_artworks: string[];
}

// ===============================
// API Response Types
// ===============================

export interface GalleryApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  metadata?: {
    total_count?: number;
    page?: number;
    per_page?: number;
    execution_time?: number;
  };
  links?: {
    self?: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
}

export interface BulkOperationResult {
  success_count: number;
  error_count: number;
  errors: {
    item_id: string;
    error_message: string;
  }[];
  warnings: {
    item_id: string;
    warning_message: string;
  }[];
}

// All types are already exported as interfaces above
// Educational Content

export interface EducationalContent {
  id: string
  learning_objectives: string[]
  target_audience: ('general_public' | 'students' | 'scholars' | 'practitioners')[]
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'

  stroke_analysis: {
    animated_strokes?: StrokeAnimation[]
    stroke_order?: string[]
    technique_breakdown: TechniqueBreakdown[]
    common_variations?: string[]
  }

  historical_context: {
    period_overview: string
    cultural_significance: string
    artistic_movement?: string
    contemporaries?: string[]
    influence_legacy?: string
  }

  technical_analysis: {
    brushwork_study: string
    composition_analysis: string
    ink_technique: string
    paper_interaction: string
    innovation_aspects?: string[]
  }

  comparative_studies?: {
    similar_works: string[]
    style_evolution: string[]
    regional_variations?: string[]
    modern_interpretations?: string[]
  }

  interactive_elements: {
    virtual_tracing?: boolean
    style_comparison?: boolean
    detail_exploration?: boolean
    quiz_questions?: QuizQuestion[]
  }

  multimedia_resources: {
    master_class_videos?: string[]
    audio_guides?: string[]
    virtual_reality_experience?: string
    augmented_reality_features?: string[]
  }
}

export interface StrokeAnimation {
  stroke_number: number
  character_position?: string
  animation_url: string
  duration: number
  speed_variations?: number[]
  pressure_mapping?: number[]
  educational_notes: string[]
}

export interface TechniqueBreakdown {
  technique_name: string
  description: string
  demonstration_url?: string
  key_points: string[]
  common_mistakes: string[]
  practice_exercises?: string[]
}

export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'identification' | 'comparison'
  question: string
  options?: string[]
  correct_answer: string | string[]
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  learning_objective: string
}

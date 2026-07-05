import type { EducationalContent } from '@/lib/types/gallery'

// ===============================
// Types and Interfaces
// ===============================

export interface AnimationSettings {
  playbackSpeed: number
  showPressure: boolean
  showDirection: boolean
  showTiming: boolean
  loopMode: 'none' | 'single' | 'all'
  autoAdvance: boolean
  soundEnabled: boolean
}

export interface StrokePoint {
  x: number
  y: number
  pressure: number
  timestamp: number
  direction?: number // angle in radians
}

export interface AnimatedStroke {
  id: string
  character_position?: string
  points: StrokePoint[]
  duration: number
  brush_type: string
  ink_flow: number[]
  educational_notes: string[]
}

export interface StrokeAnimationPlayerProps {
  strokes: AnimatedStroke[]
  educationalContent?: EducationalContent
  characterImage?: string
  onStrokeComplete?: (strokeIndex: number) => void
  onAnimationComplete?: () => void
  className?: string
}

export interface PlaybackState {
  isPlaying: boolean
  currentStroke: number
  currentProgress: number // 0-1
  totalProgress: number // 0-1
  isComplete: boolean
}

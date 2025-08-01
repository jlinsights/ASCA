// AI 비전 분석을 위한 타입 정의

export interface Point {
  x: number
  y: number
}

export interface StrokePoint extends Point {
  pressure?: number
  speed?: number
  timestamp?: number
}

export interface Stroke {
  id: string
  points: StrokePoint[]
  startTime: number
  endTime: number
  pressure: {
    min: number
    max: number
    average: number
  }
  speed: {
    min: number
    max: number
    average: number
  }
  length: number
  curvature: number
  direction: number // 각도 (라디안)
  strokeType: StrokeType
}

export type StrokeType = 
  | 'horizontal' // 橫 (획)
  | 'vertical' // 竪 (수)
  | 'dot' // 點 (점)
  | 'sweep_left' // 撇 (별)
  | 'sweep_right' // 捺 (날)
  | 'hook' // 鉤 (구)
  | 'turn' // 折 (절)
  | 'curve' // 彎 (만)

export interface CalligraphyAnalysis {
  id: string
  imageUrl: string
  timestamp: number
  
  // 전체 작품 분석
  overall: {
    score: number // 0-100
    style: CalligraphyStyle
    confidence: number
    dimensions: {
      width: number
      height: number
    }
  }
  
  // 개별 문자 분석
  characters: CharacterAnalysis[]
  
  // 붓질 분석
  strokes: Stroke[]
  
  // 구성 분석
  composition: {
    balance: number // 균형감 0-100
    spacing: number // 자간/행간 적절성 0-100
    proportion: number // 비례감 0-100
    alignment: number // 정렬 상태 0-100
  }
  
  // 기법 분석
  technique: {
    brushControl: number // 붓 조절력 0-100
    inkFlow: number // 먹의 농담 표현 0-100
    strokeQuality: number // 붓질 품질 0-100
    rhythmConsistency: number // 리듬감 일관성 0-100
  }
  
  // 피드백 및 개선점
  feedback: CalligraphyFeedback
}

export interface CharacterAnalysis {
  id: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  character?: string // 인식된 문자 (가능한 경우)
  strokes: string[] // stroke ID 참조
  
  // 문자별 점수
  scores: {
    structure: number // 구조 0-100
    proportion: number // 비례 0-100
    strokeOrder: number // 필순 정확성 0-100
    balance: number // 균형감 0-100
  }
  
  // 개선점
  improvements: string[]
}

export interface CalligraphyFeedback {
  overall: string
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  
  // 상세 피드백
  detailed: {
    brushControl: string
    composition: string
    technique: string
    style: string
  }
  
  // 연습 권장사항
  practiceRecommendations: {
    exercises: string[]
    focusAreas: string[]
    timeframe: string
  }
}

// 이미지 전처리 설정
export interface ImagePreprocessingConfig {
  resize?: {
    width: number
    height: number
    maintainAspectRatio: boolean
  }
  contrast?: {
    enabled: boolean
    factor: number // 0.5 - 2.0
  }
  brightness?: {
    enabled: boolean
    factor: number // 0.5 - 2.0
  }
  sharpen?: {
    enabled: boolean
    strength: number // 0.1 - 2.0
  }
  denoise?: {
    enabled: boolean
    strength: number // 0.1 - 1.0
  }
  binarization?: {
    enabled: boolean
    threshold: number // 0-255
    adaptive: boolean
  }
}

// 분석 설정
export interface AnalysisConfig {
  strokeDetection: {
    sensitivity: number // 0.1 - 1.0
    minStrokeLength: number
    maxGapDistance: number
  }
  characterRecognition: {
    enabled: boolean
    confidence: number // 최소 인식 신뢰도
  }
  styleClassification: {
    enabled: boolean
    styles: CalligraphyStyle[]
  }
  feedbackLevel: 'basic' | 'detailed' | 'expert'
}

export type CalligraphyStyle = 
  | 'kaishu' // 楷書 (해서)
  | 'xingshu' // 行書 (행서)
  | 'caoshu' // 草書 (초서)
  | 'lishu' // 隸書 (예서)
  | 'zhuanshu' // 篆書 (전서)
  | 'modern' // 현대서예
  | 'traditional' // 전통서예

// 실시간 분석을 위한 인터페이스
export interface RealTimeAnalysis {
  sessionId: string
  isActive: boolean
  currentStroke?: Stroke
  strokes: Stroke[]
  liveScore: number
  suggestions: string[]
  corrections: {
    position: Point
    message: string
  }[]
}

// 비교 분석을 위한 인터페이스
export interface ComparisonAnalysis {
  id: string
  userWork: CalligraphyAnalysis
  masterWork: CalligraphyAnalysis
  
  comparison: {
    overall: {
      similarity: number // 0-100
      mainDifferences: string[]
    }
    strokes: {
      count: number
      qualityDifference: number
      suggestions: string[]
    }
    composition: {
      similarity: number
      improvements: string[]
    }
    technique: {
      similarity: number
      gaps: string[]
    }
  }
  
  learningPath: {
    priority: string[]
    exercises: string[]
    timeline: string
  }
}

// 학습 진행도 추적
export interface LearningProgress {
  userId: string
  startDate: Date
  
  skillLevels: {
    brushControl: number // 0-100
    strokeAccuracy: number
    composition: number
    styleConsistency: number
  }
  
  completedExercises: {
    exerciseId: string
    completedAt: Date
    score: number
    feedback: string
  }[]
  
  improvements: {
    area: string
    before: number
    after: number
    improvementDate: Date
  }[]
  
  goals: {
    target: string
    currentLevel: number
    targetLevel: number
    deadline?: Date
  }[]
}

// API 응답 타입
export interface AnalysisResponse {
  success: boolean
  analysis?: CalligraphyAnalysis
  error?: string
  processingTime: number
  confidence: number
}

export interface UploadResponse {
  success: boolean
  imageId?: string
  preprocessedImageUrl?: string
  error?: string
}
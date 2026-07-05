// Types for learning content

export interface LearningResource {
  id: string
  title: {
    original: string
    romanized: string
    english: string
  }
  description: string
  type: 'video' | 'audio' | 'document' | 'interactive' | 'practice'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master'
  duration: number // in minutes
  instructor: {
    name: string
    credentials: string
    avatar: string
  }
  content: {
    url: string
    transcript?: string
    materials?: string[]
  }
  prerequisites: string[]
  objectives: string[]
  tags: string[]
  cultural_context: string
  practice_exercises?: {
    id: string
    title: string
    type: 'stroke_practice' | 'character_writing' | 'composition' | 'critique'
    description: string
  }[]
  rating: number
  enrolled: number
  completed: number
  featured?: boolean
}

export interface LearningPath {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'master'
  estimated_duration: number // in hours
  modules: {
    id: string
    title: string
    description: string
    resources: string[] // resource IDs
    required: boolean
    unlocked: boolean
    completed: boolean
  }[]
  certificate?: {
    available: boolean
    requirements: string[]
  }
  cultural_significance: string
  traditional_lineage?: string
}

export interface UserProgress {
  resourcesCompleted: string[]
  pathsEnrolled: string[]
  pathsCompleted: string[]
  achievements: {
    id: string
    title: string
    description: string
    icon: string
    earned_date: Date
  }[]
  streakDays: number
  totalHours: number
  level: number
  experience: number
}

export interface LearningHubProps {
  resources: LearningResource[]
  learningPaths: LearningPath[]
  userProgress: UserProgress
  showProgressiveDisclosure?: boolean
  className?: string
}

export type LearningTab = 'overview' | 'paths' | 'resources' | 'practice'

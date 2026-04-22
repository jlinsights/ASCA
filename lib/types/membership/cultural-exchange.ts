import type { EmergencyContact } from './member'

// 문화교류 프로그램 관련

/**
 * 문화교류 프로그램
 */
export interface CulturalExchangeProgramInfo {
  id: string
  title: string
  titleKo?: string
  titleEn?: string
  titleCn?: string
  titleJp?: string
  description?: string
  descriptionKo?: string
  descriptionEn?: string
  descriptionCn?: string
  descriptionJp?: string

  programType: CulturalProgramType
  targetAudience: number[] // 대상 회원 등급 레벨
  partnerOrganizations: PartnerOrganization[]
  countries: string[] // ISO 국가 코드
  languages: string[] // ISO 언어 코드

  duration: number // 일수
  maxParticipants: number
  currentParticipants: number
  fee: number
  currency: string

  location: string
  venue?: string
  accommodationProvided: boolean
  mealsProvided: boolean
  transportationProvided: boolean

  requirements: ProgramRequirement[]
  benefits: ProgramBenefit[]
  schedule: ProgramScheduleItem[]

  applicationDeadline?: Date
  startDate: Date
  endDate: Date

  status: CulturalProgramStatus
  organizerId: string
  coordinators: ProgramCoordinator[]

  images: string[]
  documents: ProgramDocument[]

  isFeatured: boolean
  metadata?: Record<string, any>

  createdAt: Date
  updatedAt: Date
}

export type CulturalProgramType =
  | 'cultural_immersion'
  | 'artist_residency'
  | 'workshop_series'
  | 'exhibition_exchange'
  | 'academic_collaboration'
  | 'youth_program'
  | 'master_class'

export type CulturalProgramStatus =
  | 'planning'
  | 'open_for_applications'
  | 'applications_closed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

/**
 * 파트너 기관
 */
export interface PartnerOrganization {
  name: string
  nameLocal?: string
  type: 'university' | 'museum' | 'cultural_center' | 'art_school' | 'government' | 'ngo'
  country: string
  city?: string
  website?: string
  contactPerson?: string
  contactEmail?: string
}

/**
 * 프로그램 요구사항
 */
export interface ProgramRequirement {
  type: 'membership_level' | 'language_proficiency' | 'experience' | 'age' | 'health' | 'other'
  description: string
  mandatory: boolean
  details?: Record<string, any>
}

/**
 * 프로그램 혜택
 */
export interface ProgramBenefit {
  type:
    | 'certificate'
    | 'networking'
    | 'cultural_credit'
    | 'portfolio_enhancement'
    | 'career_development'
  description: string
  value?: string
}

/**
 * 프로그램 일정 항목
 */
export interface ProgramScheduleItem {
  date: Date
  startTime?: string
  endTime?: string
  title: string
  description?: string
  location?: string
  type: 'workshop' | 'lecture' | 'exhibition' | 'cultural_activity' | 'networking' | 'free_time'
  required: boolean
}

/**
 * 프로그램 코디네이터
 */
export interface ProgramCoordinator {
  userId: string
  name: string
  role: 'lead' | 'assistant' | 'local_guide' | 'interpreter'
  contact: string
  languages: string[]
  expertise: string[]
}

/**
 * 프로그램 문서
 */
export interface ProgramDocument {
  title: string
  type: 'application_form' | 'itinerary' | 'guidelines' | 'visa_info' | 'emergency_contacts'
  url: string
  language: string
  updatedAt: Date
}

/**
 * 문화교류 프로그램 참가자
 */
export interface CulturalExchangeParticipantInfo {
  id: string
  programId: string
  memberId: string

  applicationData: ParticipantApplicationData
  specialRequests?: string
  emergencyContact: EmergencyContact

  status: ParticipantStatus
  paymentStatus: PaymentStatus

  feedback?: ProgramFeedback
  completionCertificate?: string

  appliedAt: Date
  approvedAt?: Date
  completedAt?: Date

  metadata?: Record<string, any>
}

export type ParticipantStatus =
  | 'applied'
  | 'approved'
  | 'confirmed'
  | 'attended'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'refunded'

/**
 * 참가자 신청 데이터
 */
export interface ParticipantApplicationData {
  motivationLetter: string
  relevantExperience: string
  languageProficiency: LanguageProficiency[]
  dietaryRestrictions?: string[]
  medicalConditions?: string[]
  accommodationPreferences?: string
  goals: string[]
  questions?: string
}

/**
 * 언어 능력
 */
export interface LanguageProficiency {
  language: string // ISO 코드
  level: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'native'
  speaking: number // 1-5
  listening: number // 1-5
  reading: number // 1-5
  writing: number // 1-5
}

/**
 * 프로그램 피드백
 */
export interface ProgramFeedback {
  overallRating: number // 1-5
  organizationRating: number // 1-5
  contentRating: number // 1-5
  facilitatorRating: number // 1-5
  venueRating: number // 1-5

  highlights: string[]
  improvements: string[]
  wouldRecommend: boolean
  additionalComments?: string

  culturalLearnings: string[]
  skillsGained: string[]
  networkingValue: number // 1-5

  submittedAt: Date
}

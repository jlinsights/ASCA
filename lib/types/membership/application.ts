import type { CalligraphyStyle } from './member'

// 회원 신청 및 심사 관련

/**
 * 회원 신청서
 */
export interface MembershipApplicationInfo {
  id: string
  memberId: string
  requestedTierLevel: number
  requestedTierId?: string
  applicationType: 'new_member' | 'tier_upgrade' | 'tier_downgrade' | 'reactivation'

  applicationReason?: string
  supportingDocuments: SupportingDocument[]
  portfolioItems: PortfolioItem[]
  references: Reference[]

  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
  reviewerId?: string
  reviewComments?: string
  reviewScore?: number // 1-100
  reviewCriteria?: ReviewCriteria

  submittedAt: Date
  reviewedAt?: Date
  decidedAt?: Date

  metadata?: Record<string, any>
}

/**
 * 지원 서류
 */
export interface SupportingDocument {
  type:
    | 'resume'
    | 'certificate'
    | 'portfolio'
    | 'recommendation_letter'
    | 'identification'
    | 'other'
  title: string
  description?: string
  url: string
  fileSize: number
  mimeType: string
  uploadedAt: Date
}

/**
 * 포트폴리오 항목
 */
export interface PortfolioItem {
  type: 'artwork' | 'photograph' | 'video' | 'document'
  title: string
  description?: string
  style?: CalligraphyStyle
  creationDate?: Date
  dimensions?: string
  materials?: string[]
  imageUrls: string[]
  significance: 'representative' | 'recent' | 'award_winning' | 'experimental'
  metadata?: Record<string, any>
}

/**
 * 추천인 정보
 */
export interface Reference {
  name: string
  title?: string
  organization?: string
  relationship: 'teacher' | 'colleague' | 'mentor' | 'student' | 'friend' | 'other'
  contactEmail?: string
  contactPhone?: string
  yearsKnown: number
  recommendationLetter?: string
  letterUrl?: string
  submittedAt?: Date
  verified: boolean
}

/**
 * 심사 기준
 */
export interface ReviewCriteria {
  technicalSkill: number // 1-10
  artisticExpression: number // 1-10
  culturalUnderstanding: number // 1-10
  portfolioQuality: number // 1-10
  experience: number // 1-10
  references: number // 1-10
  totalScore: number // 1-100
  comments: {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
  }
}

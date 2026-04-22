// 인증서 및 자격증 관련

/**
 * 회원 인증서/자격증
 */
export interface MemberCertificationInfo {
  id: string
  memberId: string

  certificationType: CertificationType
  title: string
  titleKo?: string
  titleEn?: string
  titleCn?: string
  titleJp?: string

  description?: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'master'

  issuingAuthority: string
  authorityLogo?: string

  certificateNumber?: string
  certificateUrl?: string // PDF 등 인증서 파일

  skillsAssessed: string[]
  score?: number
  grade?: string

  issuedAt: Date
  expiresAt?: Date

  verificationUrl?: string

  status: CertificationStatus

  metadata?: Record<string, any>

  createdAt: Date
  updatedAt: Date
}

export type CertificationType =
  | 'calligraphy_mastery'
  | 'teaching_qualification'
  | 'cultural_competency'
  | 'workshop_completion'
  | 'exhibition_participation'
  | 'judge_certification'

export type CertificationStatus = 'active' | 'expired' | 'revoked' | 'pending_verification'

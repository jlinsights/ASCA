// 회원 관리 시스템 TypeScript 인터페이스
// ASCA (사단법인 동양서예협회) 회원 관리 시스템
// 기본 회원 관리 인터페이스

/**
 * 회원 등급 정의
 */
export interface MembershipTierInfo {
  id: string
  name: string
  nameKo: string
  nameEn: string
  nameCn?: string
  nameJp?: string
  description?: string
  descriptionKo?: string
  descriptionEn?: string
  descriptionCn?: string
  descriptionJp?: string
  level: number // 1: Student, 2: Advanced, 3: Certified Master, 4: Honorary Master, 5: Institutional, 6: International
  requirements: string // JSON 형태로 저장 (스키마와 일치)
  benefits: string // JSON 형태로 저장 (스키마와 일치)
  annualFee: number
  currency: string
  color: string // 회원등급 식별 색상
  icon?: string
  isActive: boolean
  sortOrder: number
  metadata?: string // JSON 형태로 저장 (스키마와 일치)
  createdAt: Date
  updatedAt: Date
}

/**
 * 회원가입 요구사항
 */
export interface MembershipRequirement {
  type: 'experience' | 'certification' | 'recommendation' | 'portfolio' | 'education' | 'payment'
  title: string
  description: string
  required: boolean
  criteria?: {
    minimumYears?: number
    requiredCertifications?: string[]
    portfolioMinItems?: number
    recommendationCount?: number
  }
}

/**
 * 회원 혜택
 */
export interface MembershipBenefit {
  type:
    | 'event_access'
    | 'exhibition_priority'
    | 'workshop_discount'
    | 'certificate_eligibility'
    | 'voting_rights'
    | 'mentorship'
  title: string
  description: string
  value?: string // 할인율, 혜택 정도 등
  conditions?: string[]
}

/**
 * 회원 정보 (확장된)
 */
export interface MemberProfile {
  // 기본 정보
  id: string
  userId: string
  membershipNumber: string
  tierLevel: number
  tierId?: string
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval' | 'expelled'
  joinDate: Date
  lastActivityDate?: Date

  // 개인 정보
  fullName: string
  fullNameKo?: string
  fullNameEn?: string
  fullNameCn?: string
  fullNameJp?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  nationality: string

  // 연락처 정보 (스키마와 일치)
  phoneNumber?: string
  alternateEmail?: string
  emergencyContactName?: string
  emergencyContactPhone?: string

  // 주소 정보 (스키마와 일치)
  address?: string
  addressKo?: string
  addressEn?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string

  // 서예 관련 정보 (스키마 필드와 일치)
  calligraphyExperience?: number // 연수 (년)
  specializations?: string // JSON 배열
  preferredStyles?: string // JSON 배열
  teachingExperience?: number // 교육 경력 (년)
  certifications?: string // JSON 배열
  achievements?: string // JSON 배열

  // 교육 배경 (스키마와 일치)
  educationBackground?: string // JSON 형태
  calligraphyEducation?: string // JSON 형태

  // 관심 분야 및 문화적 배경 (스키마와 일치)
  interests?: string // JSON 배열
  culturalBackground?: string
  languages?: string // JSON 배열

  // 멤버십 정보 (스키마와 일치)
  membershipHistory?: string // JSON 배열
  paymentHistory?: string // JSON 배열
  participationScore?: number
  contributionScore?: number

  // 프라이버시 설정 (스키마와 일치)
  privacySettings?: string // JSON 형태
  marketingConsent?: boolean
  dataProcessingConsent?: boolean

  // 메타데이터 (스키마와 일치)
  profileCompleteness?: number // 0-100%
  lastProfileUpdate?: Date
  referredBy?: string // 추천인 member ID
  notes?: string // 관리자 메모
  metadata?: string // JSON 형태

  createdAt: Date
  updatedAt: Date
}

/**
 * 비상 연락처
 */
export interface EmergencyContact {
  name?: string
  phoneNumber?: string
  relationship?: string
  email?: string
}

/**
 * 주소 정보
 */
export interface AddressInfo {
  address?: string
  addressKo?: string
  addressEn?: string
  city?: string
  state?: string
  postalCode?: string
  country: string
}

/**
 * 서예 스타일
 */
export type CalligraphyStyle =
  | 'kaishu'
  | 'xingshu'
  | 'caoshu'
  | 'lishu'
  | 'zhuanshu'
  | 'modern'
  | 'experimental'

/**
 * 서예 자격증
 */
export interface CalligraphyCertification {
  name: string
  issuingOrganization: string
  level?: string
  issuedDate: Date
  expiryDate?: Date
  certificateNumber?: string
}

/**
 * 성취/업적
 */
export interface Achievement {
  type: 'award' | 'exhibition' | 'publication' | 'teaching' | 'competition'
  title: string
  description?: string
  date: Date
  organization?: string
  rank?: string
  significance: 'local' | 'national' | 'international'
}

/**
 * 서예 관련 정보
 */
export interface CalligraphyInfo {
  experience: number // 연수 (년)
  specializations: CalligraphyStyle[]
  preferredStyles: CalligraphyStyle[]
  teachingExperience: number // 교육 경력 (년)
  certifications: CalligraphyCertification[]
  achievements: Achievement[]
}

/**
 * 일반 교육 배경
 */
export interface GeneralEducation {
  level: 'high_school' | 'bachelor' | 'master' | 'doctorate'
  institution: string
  field: string
  graduationYear: number
  country: string
}

/**
 * 서예 교육 이력
 */
export interface CalligraphyEducation {
  type: 'formal' | 'apprenticeship' | 'workshop' | 'self_taught'
  institution?: string
  teacher?: string
  duration: number // 월수
  startDate: Date
  endDate?: Date
  level: 'beginner' | 'intermediate' | 'advanced' | 'master'
  focus: CalligraphyStyle[]
}

/**
 * 교육 정보
 */
export interface EducationInfo {
  general: GeneralEducation[]
  calligraphy: CalligraphyEducation[]
}

/**
 * 멤버십 이력 항목
 */
export interface MembershipHistoryEntry {
  date: Date
  action: 'joined' | 'upgraded' | 'downgraded' | 'suspended' | 'reactivated' | 'expelled'
  fromTier?: number
  toTier?: number
  reason?: string
  processedBy?: string // user ID
}

/**
 * 회비 납부 이력
 */
export interface PaymentHistoryEntry {
  date: Date
  amount: number
  currency: string
  paymentMethod: 'bank_transfer' | 'card' | 'cash' | 'check'
  purpose: 'annual_fee' | 'event_fee' | 'workshop_fee' | 'donation'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  receiptNumber?: string
  notes?: string
}

/**
 * 프라이버시 설정
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'members_only' | 'private'
  contactInfoVisible: boolean
  achievementsVisible: boolean
  participationHistoryVisible: boolean
  allowDirectMessages: boolean
  showOnlinStatus: boolean
}

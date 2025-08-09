// 회원 관리 시스템 TypeScript 인터페이스
// ASCA (사단법인 동양서예협회) 회원 관리 시스템

// ===========================
// 기본 회원 관리 인터페이스
// ===========================

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
  type: 'event_access' | 'exhibition_priority' | 'workshop_discount' | 'certificate_eligibility' | 'voting_rights' | 'mentorship'
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
 * 서예 관련 정보
 */
export interface CalligraphyInfo {
  experience: number // 연수 (년)
  specializations: CalligraphyStyle[] // ["kaishu", "xingshu", "caoshu", "lishu", "zhuanshu"]
  preferredStyles: CalligraphyStyle[]
  teachingExperience: number // 교육 경력 (년)
  certifications: CalligraphyCertification[]
  achievements: Achievement[]
}

/**
 * 서예 스타일
 */
export type CalligraphyStyle = 'kaishu' | 'xingshu' | 'caoshu' | 'lishu' | 'zhuanshu' | 'modern' | 'experimental'

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
 * 교육 정보
 */
export interface EducationInfo {
  general: GeneralEducation[]
  calligraphy: CalligraphyEducation[]
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

// ===========================
// 회원 신청 및 심사 관련
// ===========================

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
  type: 'resume' | 'certificate' | 'portfolio' | 'recommendation_letter' | 'identification' | 'other'
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

// ===========================
// 회원 활동 및 참여 관련
// ===========================

/**
 * 회원 활동 로그
 */
export interface MemberActivityLog {
  id: string
  memberId: string
  activityType: MemberActivityType
  description: string
  points: number
  relatedEntityId?: string
  relatedEntityType?: string
  metadata?: Record<string, any>
  timestamp: Date
}

export type MemberActivityType = 
  | 'login'
  | 'profile_update'
  | 'event_participation'
  | 'artwork_submission'
  | 'forum_post'
  | 'payment'
  | 'certificate_earned'
  | 'course_completion'
  | 'workshop_attendance'
  | 'exhibition_visit'
  | 'volunteer_work'
  | 'mentoring'
  | 'cultural_exchange'

// ===========================
// 문화교류 프로그램 관련
// ===========================

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
  type: 'certificate' | 'networking' | 'cultural_credit' | 'portfolio_enhancement' | 'career_development'
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

export type PaymentStatus = 
  | 'pending'
  | 'partial'
  | 'completed'
  | 'refunded'

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

// ===========================
// 인증서 및 자격증 관련
// ===========================

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

export type CertificationStatus = 
  | 'active'
  | 'expired'
  | 'revoked'
  | 'pending_verification'

// ===========================
// 관리자 전용 인터페이스
// ===========================

/**
 * 회원 관리 대시보드 통계
 */
export interface MembershipDashboardStats {
  totalMembers: number
  membersByTier: Record<number, number>
  membersByStatus: Record<string, number>
  newMembersThisMonth: number
  pendingApplications: number
  activePrograms: number
  upcomingEvents: number
  revenueThisMonth: number
  memberRetentionRate: number
  averageProfileCompleteness: number
}

/**
 * 회원 검색 필터
 */
export interface MemberSearchFilters {
  tierLevels?: number[]
  statuses?: string[]
  joinDateRange?: {
    start: Date
    end: Date
  }
  countries?: string[]
  languages?: string[]
  specializations?: CalligraphyStyle[]
  minExperience?: number
  maxExperience?: number
  hasActiveApplications?: boolean
  participationScoreRange?: {
    min: number
    max: number
  }
  searchTerm?: string // 이름, 이메일, 회원번호 검색
}

/**
 * 벌크 액션 결과
 */
export interface BulkActionResult {
  successCount: number
  failureCount: number
  errors: BulkActionError[]
  affectedMemberIds: string[]
}

/**
 * 벌크 액션 에러
 */
export interface BulkActionError {
  memberId: string
  error: string
  details?: string
}

// ===========================
// API 응답 타입
// ===========================

/**
 * 멤버십 API 응답
 */
export interface MembershipApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * 회원 목록 응답
 */
export interface MembersListResponse {
  members: MemberProfile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters?: MemberSearchFilters
}

/**
 * 회원 상세 응답
 */
export interface MemberDetailResponse {
  member: MemberProfile
  tier?: MembershipTierInfo
  recentActivities: MemberActivityLog[]
  applications: MembershipApplicationInfo[]
  certifications: MemberCertificationInfo[]
  programParticipations: CulturalExchangeParticipantInfo[]
}

/**
 * API 요청/응답 타입들
 */
export interface CreateMemberRequest {
  email: string
  first_name_ko?: string
  last_name_ko?: string
  first_name_en?: string
  last_name_en?: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  nationality?: string
  residence_country?: string
  residence_city?: string
  timezone?: string
  preferred_language?: string
  membership_level_id: string
  membership_status?: 'active' | 'inactive' | 'suspended' | 'pending_approval' | 'expelled'
}

export interface UpdateMemberRequest {
  first_name_ko?: string
  last_name_ko?: string
  first_name_en?: string
  last_name_en?: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  nationality?: string
  residence_country?: string
  residence_city?: string
  timezone?: string
  preferred_language?: string
  membership_level_id?: string
  membership_status?: 'active' | 'inactive' | 'suspended' | 'pending_approval' | 'expelled'
}

export interface MemberSearchParams {
  query?: string
  page?: string
  limit?: string
  status?: string
  level?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
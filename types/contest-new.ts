// Contest Management Types
// Phase 3: Contest Management System

// ==================================================================
// ENUMS & CONSTANTS
// ==================================================================

export type ContestCategory = 
  | 'calligraphy'    // 서예
  | 'painting'       // 회화
  | 'sculpture'      // 조각
  | 'photography'    // 사진
  | 'mixed'          // 혼합
  | 'other'          // 기타

export type ContestType = 
  | 'open'           // 공개
  | 'young_artist'   // 청년작가
  | 'professional'   // 전문가
  | 'student'        // 학생
  | 'regional'       // 지역
  | 'themed'         // 테마

export type ContestStatus = 
  | 'draft'      // 초안
  | 'announced'  // 발표됨
  | 'open'       // 접수중
  | 'closed'     // 마감
  | 'judging'    // 심사중
  | 'completed'  // 완료

export type ApplicationStatus =
  | 'submitted'     // 제출됨
  | 'under_review'  // 검토중
  | 'accepted'      // 승인됨
  | 'rejected'      // 거절됨
  | 'winner'        // 수상

export type PaymentStatus =
  | 'pending'    // 대기중
  | 'completed'  // 완료
  | 'waived'     // 면제

// ==================================================================
// LABELS (KO/EN)
// ==================================================================

export const CONTEST_CATEGORY_LABELS: Record<ContestCategory, { ko: string; en: string }> = {
  calligraphy: { ko: '서예', en: 'Calligraphy' },
  painting: { ko: '회화', en: 'Painting' },
  sculpture: { ko: '조각', en: 'Sculpture' },
  photography: { ko: '사진', en: 'Photography' },
  mixed: { ko: '혼합', en: 'Mixed Media' },
  other: { ko: '기타', en: 'Other' }
}

export const CONTEST_TYPE_LABELS: Record<ContestType, { ko: string; en: string }> = {
  open: { ko: '공개', en: 'Open' },
  young_artist: { ko: '청년작가', en: 'Young Artist' },
  professional: { ko: '전문가', en: 'Professional' },
  student: { ko: '학생', en: 'Student' },
  regional: { ko: '지역', en: 'Regional' },
  themed: { ko: '테마', en: 'Themed' }
}

export const CONTEST_STATUS_LABELS: Record<ContestStatus, { ko: string; en: string }> = {
  draft: { ko: '초안', en: 'Draft' },
  announced: { ko: '발표됨', en: 'Announced' },
  open: { ko: '접수중', en: 'Open' },
  closed: { ko: '마감', en: 'Closed' },
  judging: { ko: '심사중', en: 'Judging' },
  completed: { ko: '완료', en: 'Completed' }
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, { ko: string; en: string }> = {
  submitted: { ko: '제출됨', en: 'Submitted' },
  under_review: { ko: '검토중', en: 'Under Review' },
  accepted: { ko: '승인됨', en: 'Accepted' },
  rejected: { ko: '거절됨', en: 'Rejected' },
  winner: { ko: '수상', en: 'Winner' }
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, { ko: string; en: string }> = {
  pending: { ko: '대기중', en: 'Pending' },
  completed: { ko: '완료', en: 'Completed' },
  waived: { ko: '면제', en: 'Waived' }
}

// ==================================================================
// SUPPORTING TYPES
// ==================================================================

export interface ContestPrize {
  rank: string          // '대상', '금상', '은상', etc.
  prize: string         // '500만원', '작품 구매', etc.
  count: number
}

export interface ArtworkRequirement {
  minDimensions?: {
    width: number
    height: number
    unit: 'cm' | 'inch'
  }
  maxDimensions?: {
    width: number
    height: number
    unit: 'cm' | 'inch'
  }
  allowedMediums?: string[]
  maxFileSize?: number  // in MB for digital submissions
  otherRequirements?: string
}

// ==================================================================
// MAIN INTERFACES
// ==================================================================

export interface Contest {
  id: string
  
  // Basic Information
  title: string
  titleEn?: string
  subtitle?: string
  description: string
  descriptionEn?: string
  
  // Organization
  organizer: string
  sponsor?: string
  contactEmail?: string
  contactPhone?: string
  websiteUrl?: string
  
  // Category & Type
  category: ContestCategory
  contestType: ContestType
  
  // Timeline
  announcementDate?: string
  startDate: string
  endDate: string
  resultDate?: string
  exhibitionDate?: string
  
  // Requirements
  eligibility?: string
  theme?: string
  artworkRequirements?: ArtworkRequirement
  maxSubmissions: number
  
  // Prizes
  prizes?: ContestPrize[]
  totalPrizeAmount?: number
  
  // Entry Fee
  entryFee: number
  paymentMethods?: string[]
  
  // Images
  posterImageUrl?: string
  galleryImages?: string[]
  
  // Status
  status: ContestStatus
  isFeatured: boolean
  
  // Statistics
  applicantCount: number
  viewCount: number
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

export interface ContestApplication {
  id: string
  
  // Relations
  contestId: string
  artistId: string
  artworkIds: string[]
  
  // Application Number
  applicationNumber: string
  
  // Artist Information (snapshot)
  artistName: string
  artistEmail: string
  artistPhone?: string
  artistAddress?: string
  
  // Submission Details
  submittedArtworks: any[]  // Artwork snapshots at time of submission
  artistStatement?: string
  notes?: string
  
  // Payment
  paymentStatus: PaymentStatus
  paymentAmount?: number
  paymentDate?: Date
  paymentReceiptUrl?: string
  
  // Status & Results
  status: ApplicationStatus
  result?: string
  judgeNotes?: string
  
  // Metadata
  submittedAt: Date
  updatedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
}

// ==================================================================
// EXTENDED TYPES WITH RELATIONS
// ==================================================================

export interface ContestWithStats extends Contest {
  _count?: {
    applications: number
  }
  applications?: ContestApplication[]
}

export interface ContestApplicationWithDetails extends ContestApplication {
  contest?: Contest
  artworks?: any[]  // Full artwork objects
  artist?: {
    id: string
    name: string
    email: string
    profileImage?: string
  }
}

// ==================================================================
// FORM DATA TYPES
// ==================================================================

export interface ContestFormData {
  title: string
  titleEn?: string
  subtitle?: string
  description: string
  descriptionEn?: string
  
  organizer: string
  sponsor?: string
  contactEmail?: string
  contactPhone?: string
  websiteUrl?: string
  
  category: ContestCategory
  contestType: ContestType
  
  announcementDate?: string
  startDate: string
  endDate: string
  resultDate?: string
  exhibitionDate?: string
  
  eligibility?: string
  theme?: string
  artworkRequirements?: ArtworkRequirement
  maxSubmissions: number
  
  prizes?: ContestPrize[]
  totalPrizeAmount?: number
  
  entryFee: number
  paymentMethods?: string[]
  
  posterImageUrl?: string
  galleryImages?: string[]
  
  status: ContestStatus
  isFeatured: boolean
}

export interface ApplicationFormData {
  contestId: string
  artworkIds: string[]
  
  artistName: string
  artistEmail: string
  artistPhone?: string
  artistAddress?: string
  
  artistStatement?: string
  notes?: string
  
  paymentStatus?: PaymentStatus
  paymentReceiptUrl?: string
}

// ==================================================================
// FILTER & QUERY TYPES
// ==================================================================

export interface ContestFilters {
  status?: ContestStatus | ContestStatus[]
  category?: ContestCategory | ContestCategory[]
  contestType?: ContestType
  search?: string
  featured?: boolean
  startDate?: {
    from?: string
    to?: string
  }
  endDate?: {
    from?: string
    to?: string
  }
}

export interface ApplicationFilters {
  contestId?: string
  artistId?: string
  status?: ApplicationStatus | ApplicationStatus[]
  paymentStatus?: PaymentStatus
}

// ==================================================================
// STATISTICS TYPES
// ==================================================================

export interface ContestStatistics {
  totalContests: number
  openContests: number
  closedContests: number
  totalApplications: number
  totalPrizeAmount: number
}

export interface ArtistApplicationSummary {
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  winnerCount: number
}

// ==================================================================
// HELPER TYPES
// ==================================================================

export interface ContestDeadlineInfo {
  daysRemaining: number
  hoursRemaining: number
  isExpired: boolean
  isSoon: boolean  // Less than 7 days
}

export function getContestDeadlineInfo(endDate: string): ContestDeadlineInfo {
  const now = new Date()
  const deadline = new Date(endDate)
  const diffMs = deadline.getTime() - now.getTime()
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  return {
    daysRemaining: Math.max(0, diffDays),
    hoursRemaining: Math.max(0, diffHours),
    isExpired: diffMs < 0,
    isSoon: diffDays >= 0 && diffDays <= 7
  }
}

export function canApplyToContest(contest: Contest): boolean {
  const now = new Date()
  const startDate = new Date(contest.startDate)
  const endDate = new Date(contest.endDate)
  
  return (
    contest.status === 'open' &&
    now >= startDate &&
    now <= endDate
  )
}

export function getContestStatusColor(status: ContestStatus): string {
  const colors: Record<ContestStatus, string> = {
    draft: 'bg-slate-100 text-slate-800',
    announced: 'bg-blue-100 text-blue-800',
    open: 'bg-emerald-100 text-emerald-800',
    closed: 'bg-gray-100 text-gray-800',
    judging: 'bg-amber-100 text-amber-800',
    completed: 'bg-purple-100 text-purple-800'
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getApplicationStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-amber-100 text-amber-800',
    accepted: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    winner: 'bg-temple-gold/20 text-temple-gold'
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}

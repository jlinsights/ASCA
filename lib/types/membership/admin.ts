import type { CalligraphyStyle } from './member'

// 관리자 전용 인터페이스

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

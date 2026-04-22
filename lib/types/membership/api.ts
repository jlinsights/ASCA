import type { MemberProfile, MembershipTierInfo } from './member'
import type { MemberActivityLog } from './activity'
import type { MembershipApplicationInfo } from './application'
import type { MemberCertificationInfo } from './certification'
import type { CulturalExchangeParticipantInfo } from './cultural-exchange'
import type { MemberSearchFilters } from './admin'

// API 응답 타입

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

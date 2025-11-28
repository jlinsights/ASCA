// 회원 관리 API
// ASCA (사단법인 동양서예협회) 회원 관리 시스템 API

import { db } from '@/lib/db'
import { 
  members, 
  membershipTiers, 
  membershipApplications, 
  memberActivities,
  culturalExchangePrograms,
  culturalExchangeParticipants,
  memberCertifications,
  users 
} from '@/lib/db/schema'
import { 
  eq, 
  and, 
  or, 
  desc, 
  asc, 
  count, 
  sum, 
  avg,
  gte, 
  lte, 
  like,
  inArray,
  isNull,
  isNotNull
} from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import type {
  MemberProfile,
  MembershipTierInfo,
  MembershipApplicationInfo,
  MemberActivityLog,
  CulturalExchangeProgramInfo,
  CulturalExchangeParticipantInfo,
  MemberCertificationInfo,
  MemberSearchFilters,
  MembersListResponse,
  MemberDetailResponse,
  MembershipDashboardStats,
  BulkActionResult,
  MembershipApiResponse
} from '@/lib/types/membership'
import { logger } from '@/lib/utils/logger'

// ===========================
// 회원 관리 기본 API
// ===========================

/**
 * 모든 회원 조회 (필터링 및 페이지네이션 지원)
 */
export async function getMembers(
  filters: MemberSearchFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<MembersListResponse> {
  try {
    const offset = (page - 1) * limit
    
    // 필터 적용
    const conditions = []
    
    if (filters.tierLevels?.length) {
      conditions.push(inArray(members.tierLevel, filters.tierLevels))
    }
    
    if (filters.statuses?.length) {
      conditions.push(inArray(members.status, filters.statuses as any))
    }
    
    if (filters.joinDateRange) {
      if (filters.joinDateRange.start) {
        conditions.push(gte(members.joinDate, filters.joinDateRange.start))
      }
      if (filters.joinDateRange.end) {
        conditions.push(lte(members.joinDate, filters.joinDateRange.end))
      }
    }
    
    if (filters.countries?.length) {
      conditions.push(inArray(members.country, filters.countries))
    }
    
    if (filters.minExperience !== undefined) {
      conditions.push(gte(members.calligraphyExperience, filters.minExperience))
    }
    
    if (filters.maxExperience !== undefined) {
      conditions.push(lte(members.calligraphyExperience, filters.maxExperience))
    }
    
    if (filters.participationScoreRange) {
      if (filters.participationScoreRange.min !== undefined) {
        conditions.push(gte(members.participationScore, filters.participationScoreRange.min))
      }
      if (filters.participationScoreRange.max !== undefined) {
        conditions.push(lte(members.participationScore, filters.participationScoreRange.max))
      }
    }
    
    if (filters.searchTerm) {
      const searchTerm = `%${filters.searchTerm}%`
      conditions.push(
        or(
          like(members.fullName, searchTerm),
          like(members.membershipNumber, searchTerm),
          like(users.email, searchTerm)
        )
      )
    }
    
    // 기본 쿼리 구성 with conditions
    const query = db
      .select({
        member: members,
        user: users,
        tier: membershipTiers
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(membershipTiers, eq(members.tierId, membershipTiers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    
    // 총 개수 조회
    const totalCountResult = await db
      .select({ count: count() })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    
    const total = totalCountResult[0]?.count || 0
    
    // 페이지네이션 및 정렬 적용
    const results = await query
      .orderBy(desc(members.createdAt))
      .limit(limit)
      .offset(offset)
    
    // 결과 매핑
    const membersList = results.map((result: any) => ({
      ...result.member,
      joinDate: new Date(Number(result.member.joinDate) * 1000),
      lastActivityDate: result.member.lastActivityDate ? new Date(Number(result.member.lastActivityDate) * 1000) : undefined,
      dateOfBirth: result.member.dateOfBirth ? new Date(Number(result.member.dateOfBirth) * 1000) : undefined,
      createdAt: new Date(Number(result.member.createdAt) * 1000),
      updatedAt: new Date(Number(result.member.updatedAt) * 1000),
      tier: result.tier,
      user: result.user
    }))
    
    return {
      members: membersList as any,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters
    }
  } catch (error) {
    logger.error('Error fetching members', error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

/**
 * 특정 회원 상세 조회
 */
export async function getMember(memberId: string): Promise<MemberDetailResponse> {
  try {
    // 회원 기본 정보
    const memberResult = await db
      .select({
        member: members,
        user: users,
        tier: membershipTiers
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(membershipTiers, eq(members.tierId, membershipTiers.id))
      .where(eq(members.id, memberId))
      .limit(1)
    
    if (!memberResult[0]) {
      throw new Error('Member not found')
    }
    
    const member = memberResult[0]
    
    // 최근 활동 로그
    const recentActivities = await db
      .select()
      .from(memberActivities)
      .where(eq(memberActivities.memberId, memberId))
      .orderBy(desc(memberActivities.timestamp))
      .limit(10)
    
    // 회원 신청서
    const applications = await db
      .select()
      .from(membershipApplications)
      .where(eq(membershipApplications.memberId, memberId))
      .orderBy(desc(membershipApplications.submittedAt))
    
    // 인증서
    const certifications = await db
      .select()
      .from(memberCertifications)
      .where(eq(memberCertifications.memberId, memberId))
      .orderBy(desc(memberCertifications.issuedAt))
    
    // 문화교류 프로그램 참가 이력
    const programParticipations = await db
      .select({
        participation: culturalExchangeParticipants,
        program: culturalExchangePrograms
      })
      .from(culturalExchangeParticipants)
      .leftJoin(
        culturalExchangePrograms, 
        eq(culturalExchangeParticipants.programId, culturalExchangePrograms.id)
      )
      .where(eq(culturalExchangeParticipants.memberId, memberId))
      .orderBy(desc(culturalExchangeParticipants.appliedAt))
    
    return {
      member: {
        ...member.member,
        joinDate: new Date(Number(member.member.joinDate) * 1000),
        lastActivityDate: member.member.lastActivityDate ? new Date(Number(member.member.lastActivityDate) * 1000) : undefined,
        dateOfBirth: member.member.dateOfBirth ? new Date(Number(member.member.dateOfBirth) * 1000) : undefined,
        createdAt: new Date(Number(member.member.createdAt) * 1000),
        updatedAt: new Date(Number(member.member.updatedAt) * 1000),
        user: member.user
      } as any,
      tier: member.tier as any,
      recentActivities: recentActivities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(Number(activity.timestamp) * 1000)
      })) as any,
      applications: applications.map((app: any) => ({
        ...app,
        submittedAt: new Date(Number(app.submittedAt) * 1000),
        reviewedAt: app.reviewedAt ? new Date(Number(app.reviewedAt) * 1000) : undefined,
        decidedAt: app.decidedAt ? new Date(Number(app.decidedAt) * 1000) : undefined
      })) as any,
      certifications: certifications.map((cert: any) => ({
        ...cert,
        issuedAt: new Date(Number(cert.issuedAt) * 1000),
        expiresAt: cert.expiresAt ? new Date(Number(cert.expiresAt) * 1000) : undefined,
        createdAt: new Date(Number(cert.createdAt) * 1000),
        updatedAt: new Date(Number(cert.updatedAt) * 1000)
      })) as any,
      programParticipations: programParticipations.map((pp: any) => ({
        ...pp.participation,
        appliedAt: new Date(Number(pp.participation.appliedAt) * 1000),
        approvedAt: pp.participation.approvedAt ? new Date(Number(pp.participation.approvedAt) * 1000) : undefined,
        completedAt: pp.participation.completedAt ? new Date(Number(pp.participation.completedAt) * 1000) : undefined,
        program: pp.program ? {
          ...pp.program,
          startDate: new Date(Number(pp.program.startDate) * 1000),
          endDate: new Date(Number(pp.program.endDate) * 1000),
          applicationDeadline: pp.program.applicationDeadline ? new Date(Number(pp.program.applicationDeadline) * 1000) : undefined,
          createdAt: new Date(Number(pp.program.createdAt) * 1000),
          updatedAt: new Date(Number(pp.program.updatedAt) * 1000)
        } : undefined
      })) as any
    }
  } catch (error) {
    logger.error('Error fetching member details', error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

/**
 * 새 회원 생성
 */
export async function createMember(memberData: Partial<MemberProfile>): Promise<MemberProfile> {
  try {
    const membershipNumber = await generateMembershipNumber()
    
    const newMember = {
      id: crypto.randomUUID(),
      userId: memberData.userId!,
      membershipNumber,
      tierLevel: memberData.tierLevel || 1,
      tierId: memberData.tierId,
      status: memberData.status || 'pending_approval',
      joinDate: Math.floor((memberData.joinDate || new Date()).getTime() / 1000),
      fullName: memberData.fullName!,
      dateOfBirth: memberData.dateOfBirth ? Math.floor(memberData.dateOfBirth.getTime() / 1000) : null,
      gender: memberData.gender,
      nationality: memberData.nationality || 'KR',
      phoneNumber: memberData.phoneNumber,
      alternateEmail: memberData.alternateEmail,
      emergencyContactName: memberData.emergencyContactName,
      emergencyContactPhone: memberData.emergencyContactPhone,
      address: memberData.address,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    }
    
    const result = await db.insert(members).values(newMember).returning()
    return result[0] as any
  } catch (error) {
    logger.error('Error creating member', error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

/**
 * 회원 정보 업데이트
 */
export async function updateMember(
  memberId: string, 
  updates: Partial<MemberProfile>
): Promise<MemberProfile> {
  try {
    const updateData: any = {
      ...updates,
      updatedAt: Math.floor(Date.now() / 1000)
    }
    
    // 날짜 필드 변환
    if (updates.dateOfBirth) {
      updateData.dateOfBirth = Math.floor(updates.dateOfBirth.getTime() / 1000)
    }
    if (updates.lastActivityDate) {
      updateData.lastActivityDate = Math.floor(updates.lastActivityDate.getTime() / 1000)
    }
    if (updates.lastProfileUpdate) {
      updateData.lastProfileUpdate = Math.floor(updates.lastProfileUpdate.getTime() / 1000)
    }
    
    // JSON 필드 변환
    const jsonFields = [
      'specializations', 'preferredStyles', 'certifications', 'achievements',
      'educationBackground', 'calligraphyEducation', 'interests', 'languages',
      'membershipHistory', 'paymentHistory', 'privacySettings', 'metadata'
    ]
    
    jsonFields.forEach(field => {
      if (updates[field as keyof MemberProfile] !== undefined) {
        updateData[field] = JSON.stringify(updates[field as keyof MemberProfile])
      }
    })
    
    const result = await db
      .update(members)
      .set(updateData)
      .where(eq(members.id, memberId))
      .returning()
    
    if (!result[0]) {
      throw new Error('Member not found')
    }
    
    return result[0] as any
  } catch (error) {
    logger.error('Error updating member', error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

/**
 * 회원 삭제 (소프트 삭제 - 상태를 'inactive'로 변경)
 */
export async function deleteMember(memberId: string): Promise<boolean> {
  try {
    const result = await db
      .update(members)
      .set({ 
        status: 'inactive',
        updatedAt: Math.floor(Date.now() / 1000)
      })
      .where(eq(members.id, memberId))
      .returning()
    
    return result.length > 0
  } catch (error) {
    logger.error('Error deleting member', error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

// ===========================
// 회원 등급 관리 API
// ===========================

/**
 * 모든 회원 등급 조회
 */
export async function getMembershipTiers(): Promise<MembershipTierInfo[]> {
  try {
    const results = await db
      .select()
      .from(membershipTiers)
      .where(eq(membershipTiers.isActive, true))
      .orderBy(asc(membershipTiers.level))
    
    return results.map((tier: any) => ({
      ...tier,
      requirements: tier.requirements ? JSON.parse(tier.requirements) : [],
      benefits: tier.benefits ? JSON.parse(tier.benefits) : [],
      metadata: tier.metadata ? JSON.parse(tier.metadata) : {},
      createdAt: new Date(Number(tier.createdAt) * 1000),
      updatedAt: new Date(Number(tier.updatedAt) * 1000)
    })) as any
  } catch (error) {
    logger.error('Error fetching membership tiers', error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

/**
 * 특정 회원 등급 조회
 */
export async function getMembershipTier(tierId: string): Promise<MembershipTierInfo | null> {
  try {
    const result = await db
      .select()
      .from(membershipTiers)
      .where(eq(membershipTiers.id, tierId))
      .limit(1)
    
    if (!result[0]) {
      return null
    }
    
    return {
      ...result[0],
      requirements: result[0].requirements ? JSON.parse(result[0].requirements) : [],
      benefits: result[0].benefits ? JSON.parse(result[0].benefits) : [],
      metadata: result[0].metadata ? JSON.parse(result[0].metadata) : {},
      createdAt: new Date(Number(result[0].createdAt) * 1000),
      updatedAt: new Date(Number(result[0].updatedAt) * 1000)
    } as any
  } catch (error) {
    logger.error('Error fetching membership tier', error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

// ===========================
// 회원 활동 및 통계 API
// ===========================

/**
 * 회원 활동 로그 추가
 */
export async function logMemberActivity(
  memberId: string,
  activityType: string,
  description: string,
  points: number = 0,
  relatedEntityId?: string,
  relatedEntityType?: string,
  metadata?: Record<string, any>
): Promise<MemberActivityLog> {
  try {
    const newActivity = {
      id: crypto.randomUUID(),
      memberId,
      activityType: activityType as 'event_participation' | 'login' | 'profile_update' | 'artwork_submission' | 'forum_post' | 'payment' | 'certificate_earned' | 'course_completion',
      description,
      points,
      relatedEntityId,
      relatedEntityType,
      metadata: metadata ? JSON.stringify(metadata) : null,
      timestamp: new Date()
    }
    
    const result = await db.insert(memberActivities).values(newActivity).returning()
    
    // 회원의 참여 점수 업데이트
    if (points > 0) {
      await db
        .update(members)
        .set({
          participationScore: sql`${members.participationScore} + ${points}`,
          lastActivityDate: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000)
        })
        .where(eq(members.id, memberId))
    }
    
    return {
      ...result[0],
      timestamp: new Date(Number(result[0].timestamp) * 1000),
      metadata: result[0].metadata ? JSON.parse(result[0].metadata) : {}
    } as any
  } catch (error) {
    logger.error('Error logging member activity', error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

/**
 * 회원 관리 대시보드 통계 조회
 */
export async function getMembershipDashboardStats(): Promise<MembershipDashboardStats> {
  try {
    // 총 회원 수
    const totalMembersResult = await db
      .select({ count: count() })
      .from(members)
      .where(eq(members.status, 'active'))
    
    // 등급별 회원 수
    const membersByTierResult = await db
      .select({
        tierLevel: members.tierLevel,
        count: count()
      })
      .from(members)
      .where(eq(members.status, 'active'))
      .groupBy(members.tierLevel)
    
    // 상태별 회원 수
    const membersByStatusResult = await db
      .select({
        status: members.status,
        count: count()
      })
      .from(members)
      .groupBy(members.status)
    
    // 이번 달 신규 회원
    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    thisMonthStart.setHours(0, 0, 0, 0)

    const newMembersThisMonthResult = await db
      .select({ count: count() })
      .from(members)
      .where(gte(members.joinDate, thisMonthStart))

    // 대기 중인 신청서
    const pendingApplicationsResult = await db
      .select({ count: count() })
      .from(membershipApplications)
      .where(eq(membershipApplications.status, 'pending'))
    
    // 활성 프로그램 수
    const activeProgramsResult = await db
      .select({ count: count() })
      .from(culturalExchangePrograms)
      .where(
        or(
          eq(culturalExchangePrograms.status, 'open_for_applications'),
          eq(culturalExchangePrograms.status, 'in_progress')
        )
      )
    
    // 평균 프로필 완성도
    const avgProfileCompletenessResult = await db
      .select({ avg: avg(members.profileCompleteness) })
      .from(members)
      .where(eq(members.status, 'active'))
    
    return {
      totalMembers: totalMembersResult[0]?.count || 0,
      membersByTier: membersByTierResult.reduce((acc: any, item: any) => {
        acc[item.tierLevel] = item.count
        return acc
      }, {} as Record<number, number>),
      membersByStatus: membersByStatusResult.reduce((acc: any, item: any) => {
        acc[item.status] = item.count
        return acc
      }, {} as Record<string, number>),
      newMembersThisMonth: newMembersThisMonthResult[0]?.count || 0,
      pendingApplications: pendingApplicationsResult[0]?.count || 0,
      activePrograms: activeProgramsResult[0]?.count || 0,
      upcomingEvents: 0, // TODO: events 테이블에서 조회
      revenueThisMonth: 0, // TODO: payment 시스템 연동 후 구현
      memberRetentionRate: 0, // TODO: 장기적 데이터 분석 후 구현
      averageProfileCompleteness: Math.round(Number(avgProfileCompletenessResult[0]?.avg) || 0)
    }
  } catch (error) {
    logger.error('Error fetching membership dashboard stats', error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

// ===========================
// 유틸리티 함수
// ===========================

/**
 * 회원번호 생성
 */
async function generateMembershipNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `ASCA-${year}-`
  
  // 해당 연도의 마지막 회원번호 조회
  const lastMember = await db
    .select({ membershipNumber: members.membershipNumber })
    .from(members)
    .where(like(members.membershipNumber, `${prefix}%`))
    .orderBy(desc(members.membershipNumber))
    .limit(1)
  
  let nextNumber = 1
  if (lastMember[0]) {
    const lastNumber = parseInt(lastMember[0].membershipNumber.split('-')[2])
    nextNumber = lastNumber + 1
  }
  
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`
}

/**
 * 프로필 완성도 계산
 */
export function calculateProfileCompleteness(member: Partial<MemberProfile>): number {
  const requiredFields = [
    'fullName', 'dateOfBirth', 'nationality', 'phoneNumber',
    'address', 'calligraphyExperience', 'specializations'
  ]
  
  const optionalFields = [
    'fullNameEn', 'emergencyContactName', 'emergencyContactPhone',
    'teachingExperience', 'certifications', 'achievements',
    'educationBackground', 'interests'
  ]
  
  let score = 0
  const totalFields = requiredFields.length + optionalFields.length
  
  // 필수 필드 (70% 가중치)
  const completedRequired = requiredFields.filter(field => {
    const value = member[field as keyof MemberProfile]
    return value !== null && value !== undefined && value !== ''
  }).length
  
  score += (completedRequired / requiredFields.length) * 70
  
  // 선택 필드 (30% 가중치)
  const completedOptional = optionalFields.filter(field => {
    const value = member[field as keyof MemberProfile]
    return value !== null && value !== undefined && value !== ''
  }).length
  
  score += (completedOptional / optionalFields.length) * 30
  
  return Math.round(score)
}
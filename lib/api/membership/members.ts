// 회원 기본 CRUD API

import { db } from '@/lib/db'
import {
  culturalExchangePrograms,
  culturalExchangeParticipants,
  memberActivities,
  memberCertifications,
  members,
  membershipApplications,
  membershipTiers,
  users,
} from '@/lib/db/schema'
import { and, count, desc, eq, gte, inArray, like, lte, or } from 'drizzle-orm'
import type {
  MemberDetailResponse,
  MemberProfile,
  MemberSearchFilters,
  MembersListResponse,
} from '@/lib/types/membership'
import { logger } from '@/lib/utils/logger'
import { generateMembershipNumber } from './utils'

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
    const conditions: any[] = []

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

    const query = db
      .select({
        member: members,
        user: users,
        tier: membershipTiers,
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(membershipTiers, eq(members.tierId, membershipTiers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    const totalCountResult = await db
      .select({ count: count() })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    const total = totalCountResult[0]?.count || 0

    const results = await query.orderBy(desc(members.createdAt)).limit(limit).offset(offset)

    const membersList = results.map((result: any) => ({
      ...result.member,
      joinDate: new Date(Number(result.member.joinDate) * 1000),
      lastActivityDate: result.member.lastActivityDate
        ? new Date(Number(result.member.lastActivityDate) * 1000)
        : undefined,
      dateOfBirth: result.member.dateOfBirth
        ? new Date(Number(result.member.dateOfBirth) * 1000)
        : undefined,
      createdAt: new Date(Number(result.member.createdAt) * 1000),
      updatedAt: new Date(Number(result.member.updatedAt) * 1000),
      tier: result.tier,
      user: result.user,
    }))

    return {
      members: membersList as any,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters,
    }
  } catch (error) {
    logger.error(
      'Error fetching members',
      error instanceof Error ? error : new Error(String(error))
    )
    throw error
  }
}

/**
 * 특정 회원 상세 조회
 */
export async function getMember(memberId: string): Promise<MemberDetailResponse> {
  try {
    const memberResult = await db
      .select({
        member: members,
        user: users,
        tier: membershipTiers,
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

    const recentActivities = await db
      .select()
      .from(memberActivities)
      .where(eq(memberActivities.memberId, memberId))
      .orderBy(desc(memberActivities.timestamp))
      .limit(10)

    const applications = await db
      .select()
      .from(membershipApplications)
      .where(eq(membershipApplications.memberId, memberId))
      .orderBy(desc(membershipApplications.submittedAt))

    const certifications = await db
      .select()
      .from(memberCertifications)
      .where(eq(memberCertifications.memberId, memberId))
      .orderBy(desc(memberCertifications.issuedAt))

    const programParticipations = await db
      .select({
        participation: culturalExchangeParticipants,
        program: culturalExchangePrograms,
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
        lastActivityDate: member.member.lastActivityDate
          ? new Date(Number(member.member.lastActivityDate) * 1000)
          : undefined,
        dateOfBirth: member.member.dateOfBirth
          ? new Date(Number(member.member.dateOfBirth) * 1000)
          : undefined,
        createdAt: new Date(Number(member.member.createdAt) * 1000),
        updatedAt: new Date(Number(member.member.updatedAt) * 1000),
        user: member.user,
      } as any,
      tier: member.tier as any,
      recentActivities: recentActivities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(Number(activity.timestamp) * 1000),
      })) as any,
      applications: applications.map((app: any) => ({
        ...app,
        submittedAt: new Date(Number(app.submittedAt) * 1000),
        reviewedAt: app.reviewedAt ? new Date(Number(app.reviewedAt) * 1000) : undefined,
        decidedAt: app.decidedAt ? new Date(Number(app.decidedAt) * 1000) : undefined,
      })) as any,
      certifications: certifications.map((cert: any) => ({
        ...cert,
        issuedAt: new Date(Number(cert.issuedAt) * 1000),
        expiresAt: cert.expiresAt ? new Date(Number(cert.expiresAt) * 1000) : undefined,
        createdAt: new Date(Number(cert.createdAt) * 1000),
        updatedAt: new Date(Number(cert.updatedAt) * 1000),
      })) as any,
      programParticipations: programParticipations.map((pp: any) => ({
        ...pp.participation,
        appliedAt: new Date(Number(pp.participation.appliedAt) * 1000),
        approvedAt: pp.participation.approvedAt
          ? new Date(Number(pp.participation.approvedAt) * 1000)
          : undefined,
        completedAt: pp.participation.completedAt
          ? new Date(Number(pp.participation.completedAt) * 1000)
          : undefined,
        program: pp.program
          ? {
              ...pp.program,
              startDate: new Date(Number(pp.program.startDate) * 1000),
              endDate: new Date(Number(pp.program.endDate) * 1000),
              applicationDeadline: pp.program.applicationDeadline
                ? new Date(Number(pp.program.applicationDeadline) * 1000)
                : undefined,
              createdAt: new Date(Number(pp.program.createdAt) * 1000),
              updatedAt: new Date(Number(pp.program.updatedAt) * 1000),
            }
          : undefined,
      })) as any,
    }
  } catch (error) {
    logger.error(
      'Error fetching member details',
      error instanceof Error ? error : new Error(String(error))
    )
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
      joinDate: memberData.joinDate || new Date(),
      fullName: memberData.fullName!,
      dateOfBirth: memberData.dateOfBirth || null,
      gender: memberData.gender,
      nationality: memberData.nationality || 'KR',
      phoneNumber: memberData.phoneNumber,
      alternateEmail: memberData.alternateEmail,
      emergencyContactName: memberData.emergencyContactName,
      emergencyContactPhone: memberData.emergencyContactPhone,
      address: memberData.address,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      updatedAt: new Date(),
    }

    if (updates.dateOfBirth) {
      updateData.dateOfBirth = updates.dateOfBirth
    }
    if (updates.lastActivityDate) {
      updateData.lastActivityDate = updates.lastActivityDate
    }
    if (updates.lastProfileUpdate) {
      updateData.lastProfileUpdate = updates.lastProfileUpdate
    }

    const jsonFields = [
      'specializations',
      'preferredStyles',
      'certifications',
      'achievements',
      'educationBackground',
      'calligraphyEducation',
      'interests',
      'languages',
      'membershipHistory',
      'paymentHistory',
      'privacySettings',
      'metadata',
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
        updatedAt: new Date(),
      })
      .where(eq(members.id, memberId))
      .returning()

    return result.length > 0
  } catch (error) {
    logger.error('Error deleting member', error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

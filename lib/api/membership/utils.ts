// 회원 유틸리티 함수 — 내부 헬퍼 및 공개 계산 함수

import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'
import { desc, like } from 'drizzle-orm'
import type { MemberProfile } from '@/lib/types/membership'

/**
 * 회원번호 생성 (내부 사용)
 */
export async function generateMembershipNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `ASCA-${year}-`

  const lastMember = await db
    .select({ membershipNumber: members.membershipNumber })
    .from(members)
    .where(like(members.membershipNumber, `${prefix}%`))
    .orderBy(desc(members.membershipNumber))
    .limit(1)

  let nextNumber = 1
  if (lastMember[0]) {
    const lastNumber = parseInt(lastMember[0].membershipNumber.split('-')[2] || '0')
    nextNumber = lastNumber + 1
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`
}

/**
 * 프로필 완성도 계산
 */
export function calculateProfileCompleteness(member: Partial<MemberProfile>): number {
  const requiredFields = [
    'fullName',
    'dateOfBirth',
    'nationality',
    'phoneNumber',
    'address',
    'calligraphyExperience',
    'specializations',
  ]

  const optionalFields = [
    'fullNameEn',
    'emergencyContactName',
    'emergencyContactPhone',
    'teachingExperience',
    'certifications',
    'achievements',
    'educationBackground',
    'interests',
  ]

  let score = 0

  const completedRequired = requiredFields.filter(field => {
    const value = member[field as keyof MemberProfile]
    return value !== null && value !== undefined && value !== ''
  }).length

  score += (completedRequired / requiredFields.length) * 70

  const completedOptional = optionalFields.filter(field => {
    const value = member[field as keyof MemberProfile]
    return value !== null && value !== undefined && value !== ''
  }).length

  score += (completedOptional / optionalFields.length) * 30

  return Math.round(score)
}

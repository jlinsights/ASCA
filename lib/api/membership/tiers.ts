// 회원 등급 조회 API

import { db } from '@/lib/db'
import { membershipTiers } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'
import type { MembershipTierInfo } from '@/lib/types/membership'
import { logger } from '@/lib/utils/logger'

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
      requirements: tier.requirements || [],
      benefits: tier.benefits || [],
      metadata: tier.metadata || {},
      createdAt: new Date(Number(tier.createdAt) * 1000),
      updatedAt: new Date(Number(tier.updatedAt) * 1000),
    })) as any
  } catch (error) {
    logger.error(
      'Error fetching membership tiers',
      error instanceof Error ? error : new Error(String(error))
    )
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
      requirements: result[0].requirements || [],
      benefits: result[0].benefits || [],
      metadata: result[0].metadata || {},
      createdAt: new Date(Number(result[0].createdAt) * 1000),
      updatedAt: new Date(Number(result[0].updatedAt) * 1000),
    } as any
  } catch (error) {
    logger.error(
      'Error fetching membership tier',
      error instanceof Error ? error : new Error(String(error))
    )
    throw error
  }
}

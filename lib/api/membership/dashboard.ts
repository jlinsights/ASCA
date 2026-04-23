// 회원 관리 대시보드 통계 API

import { db } from '@/lib/db'
import { culturalExchangePrograms, members, membershipApplications } from '@/lib/db/schema'
import { avg, count, eq, gte, or } from 'drizzle-orm'
import type { MembershipDashboardStats } from '@/lib/types/membership'
import { logger } from '@/lib/utils/logger'

/**
 * 회원 관리 대시보드 통계 조회
 */
export async function getMembershipDashboardStats(): Promise<MembershipDashboardStats> {
  try {
    const totalMembersResult = await db
      .select({ count: count() })
      .from(members)
      .where(eq(members.status, 'active'))

    const membersByTierResult = await db
      .select({
        tierLevel: members.tierLevel,
        count: count(),
      })
      .from(members)
      .where(eq(members.status, 'active'))
      .groupBy(members.tierLevel)

    const membersByStatusResult = await db
      .select({
        status: members.status,
        count: count(),
      })
      .from(members)
      .groupBy(members.status)

    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    thisMonthStart.setHours(0, 0, 0, 0)

    const newMembersThisMonthResult = await db
      .select({ count: count() })
      .from(members)
      .where(gte(members.joinDate, thisMonthStart))

    const pendingApplicationsResult = await db
      .select({ count: count() })
      .from(membershipApplications)
      .where(eq(membershipApplications.status, 'pending'))

    const activeProgramsResult = await db
      .select({ count: count() })
      .from(culturalExchangePrograms)
      .where(
        or(
          eq(culturalExchangePrograms.status, 'open_for_applications'),
          eq(culturalExchangePrograms.status, 'in_progress')
        )
      )

    const avgProfileCompletenessResult = await db
      .select({ avg: avg(members.profileCompleteness) })
      .from(members)
      .where(eq(members.status, 'active'))

    return {
      totalMembers: totalMembersResult[0]?.count || 0,
      membersByTier: membersByTierResult.reduce(
        (acc: any, item: any) => {
          acc[item.tierLevel] = item.count
          return acc
        },
        {} as Record<number, number>
      ),
      membersByStatus: membersByStatusResult.reduce(
        (acc: any, item: any) => {
          acc[item.status] = item.count
          return acc
        },
        {} as Record<string, number>
      ),
      newMembersThisMonth: newMembersThisMonthResult[0]?.count || 0,
      pendingApplications: pendingApplicationsResult[0]?.count || 0,
      activePrograms: activeProgramsResult[0]?.count || 0,
      upcomingEvents: 0, // TODO: events 테이블에서 조회
      revenueThisMonth: 0, // TODO: payment 시스템 연동 후 구현
      memberRetentionRate: 0, // TODO: 장기적 데이터 분석 후 구현
      averageProfileCompleteness: Math.round(Number(avgProfileCompletenessResult[0]?.avg) || 0),
    }
  } catch (error) {
    logger.error(
      'Error fetching membership dashboard stats',
      error instanceof Error ? error : new Error(String(error))
    )
    throw error
  }
}

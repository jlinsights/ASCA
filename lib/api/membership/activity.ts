// 회원 활동 로그 API

import { db } from '@/lib/db'
import { memberActivities, members } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import type { MemberActivityLog } from '@/lib/types/membership'
import { logger } from '@/lib/utils/logger'

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
      activityType: activityType as
        | 'event_participation'
        | 'login'
        | 'profile_update'
        | 'artwork_submission'
        | 'forum_post'
        | 'payment'
        | 'certificate_earned'
        | 'course_completion',
      description,
      points,
      relatedEntityId,
      relatedEntityType,
      metadata: metadata ? JSON.stringify(metadata) : null,
      timestamp: new Date(),
    }

    const result = await db.insert(memberActivities).values(newActivity).returning()

    if (!result[0]) {
      throw new Error('Failed to log activity')
    }

    if (points > 0) {
      await db
        .update(members)
        .set({
          participationScore: sql`${members.participationScore} + ${points}`,
          lastActivityDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(members.id, memberId))
    }

    return {
      ...result[0],
      timestamp: new Date(Number(result[0].timestamp) * 1000),
      metadata: result[0].metadata || {},
    } as any
  } catch (error) {
    logger.error(
      'Error logging member activity',
      error instanceof Error ? error : new Error(String(error))
    )
    throw error
  }
}

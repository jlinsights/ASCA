import { db } from '@/lib/db'
import {
  membershipApplications,
  members,
  users,
  membershipTiers,
  memberActivities,
} from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type PendingApplication = {
  id: string
  memberId: string
  memberName: string
  memberEmail: string
  currentTier: number
  requestedTier: number
  requestedTierName: string
  applicationType: string
  status: string
  submittedAt: Date
  reason: string | null
}

export async function getPendingApplications(): Promise<PendingApplication[]> {
  try {
    const results = await db
      .select({
        application: membershipApplications,
        member: members,
        user: users,
        tier: membershipTiers,
      })
      .from(membershipApplications)
      .leftJoin(members, eq(membershipApplications.memberId, members.id))
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(membershipTiers, eq(membershipApplications.requestedTierId, membershipTiers.id))
      .where(eq(membershipApplications.status, 'pending'))
      .orderBy(desc(membershipApplications.submittedAt))

    return results.map(row => ({
      id: row.application.id,
      memberId: row.member!.id,
      memberName: row.member!.fullName,
      memberEmail: row.user!.email,
      currentTier: row.member!.tierLevel,
      requestedTier: row.application.requestedTierLevel,
      requestedTierName: row.tier?.nameKo || 'Unknown Tier',
      applicationType: row.application.applicationType,
      status: row.application.status,
      submittedAt: row.application.submittedAt,
      reason: row.application.applicationReason,
    }))
  } catch (error) {
    console.error('Failed to fetch pending applications:', error)
    return []
  }
}

export async function approveApplication(applicationId: string, reviewerId?: string) {
  try {
    const app = await db.query.membershipApplications.findFirst({
      where: eq(membershipApplications.id, applicationId),
    })

    if (!app) throw new Error('Application not found')

    await db
      .update(membershipApplications)
      .set({
        status: 'approved',
        reviewedAt: new Date(),
        decidedAt: new Date(),
        reviewerId: reviewerId,
      })
      .where(eq(membershipApplications.id, applicationId))

    await db
      .update(members)
      .set({
        status: 'active',
        tierLevel: app.requestedTierLevel,
        tierId: app.requestedTierId,
        updatedAt: new Date(),
        lastActivityDate: new Date(),
      })
      .where(eq(members.id, app.memberId))

    await db.insert(memberActivities).values({
      id: crypto.randomUUID(),
      memberId: app.memberId,
      activityType: 'profile_update',
      description: `Membership application approved. Tier upgraded to level ${app.requestedTierLevel}`,
      timestamp: new Date(),
    })

    revalidatePath('/admin/membership')
    return { success: true as const }
  } catch (error) {
    console.error('Failed to approve application:', error)
    return { success: false as const, error: 'Failed to approve application' }
  }
}

export async function rejectApplication(
  applicationId: string,
  reason: string,
  reviewerId?: string
) {
  try {
    await db
      .update(membershipApplications)
      .set({
        status: 'rejected',
        reviewedAt: new Date(),
        decidedAt: new Date(),
        reviewComments: reason,
        reviewerId: reviewerId,
      })
      .where(eq(membershipApplications.id, applicationId))

    revalidatePath('/admin/membership')
    return { success: true as const }
  } catch (error) {
    console.error('Failed to reject application:', error)
    return { success: false as const, error: 'Failed to reject application' }
  }
}

export async function seedTestApplication() {
  try {
    const member = await db.query.members.findFirst()
    if (!member) {
      return {
        success: false as const,
        error: 'No members found to attach application to.',
      }
    }

    const targetTierId = (
      await db.query.membershipTiers.findFirst({
        where: eq(membershipTiers.level, 2),
      })
    )?.id

    await db.insert(membershipApplications).values({
      id: crypto.randomUUID(),
      memberId: member.id,
      requestedTierLevel: 2,
      requestedTierId: targetTierId,
      applicationType: 'tier_upgrade',
      status: 'pending',
      applicationReason: 'I have completed the advanced calligraphy course.',
      submittedAt: new Date(),
    })

    revalidatePath('/admin/membership')
    return { success: true as const }
  } catch (error) {
    console.error('Seeding failed:', error)
    return { success: false as const, error: String(error) }
  }
}

import { db } from '@/lib/db'
import { membershipTiers } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function getAllMembershipTiers() {
  return db
    .select()
    .from(membershipTiers)
    .where(eq(membershipTiers.isActive, true))
    .orderBy(asc(membershipTiers.sortOrder))
}

export async function getMembershipTierById(id: string) {
  const results = await db.select().from(membershipTiers).where(eq(membershipTiers.id, id)).limit(1)

  return results[0] ?? null
}

import { db } from '@/lib/db'
import { partners } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function getAllPartners() {
  return db
    .select()
    .from(partners)
    .where(eq(partners.isActive, true))
    .orderBy(asc(partners.sortOrder))
}

export async function getPartnerById(id: string) {
  const results = await db.select().from(partners).where(eq(partners.id, id)).limit(1)

  return results[0] ?? null
}

export async function getPartnersByCategory(category: string) {
  return db
    .select()
    .from(partners)
    .where(and(eq(partners.isActive, true), eq(partners.category, category)))
    .orderBy(asc(partners.sortOrder))
}

import { db } from '@/lib/db'
import { contestResults } from '@/lib/db/schema'
import { eq, desc, and, asc } from 'drizzle-orm'

export async function getContestResultsByYear(year: number) {
  return db
    .select()
    .from(contestResults)
    .where(eq(contestResults.year, year))
    .orderBy(asc(contestResults.displayOrder))
}

export async function getAvailableYears() {
  const results = await db
    .selectDistinct({ year: contestResults.year })
    .from(contestResults)
    .orderBy(desc(contestResults.year))

  return results.map(r => r.year)
}

export async function getContestResultsByYearGrouped(year: number) {
  const results = await getContestResultsByYear(year)

  const grouped: Record<string, typeof results> = {}
  for (const result of results) {
    const key = result.awardCategory
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(result)
  }

  return grouped
}

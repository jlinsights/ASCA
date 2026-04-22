import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { academyCourses } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { error as logError } from '@/lib/logging'

export async function GET() {
  try {
    const courses = await db.select().from(academyCourses).orderBy(desc(academyCourses.createdAt))

    return NextResponse.json(courses)
  } catch (error) {
    logError('Failed to fetch courses', error instanceof Error ? error : undefined)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

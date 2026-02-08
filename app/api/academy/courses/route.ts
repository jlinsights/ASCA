import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { academyCourses } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const courses = await db
      .select()
      .from(academyCourses)
      .orderBy(desc(academyCourses.createdAt));

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { academyInstructors } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const instructors = await db
      .select()
      .from(academyInstructors)
      .orderBy(desc(academyInstructors.createdAt));

    return NextResponse.json(instructors);
  } catch (error) {
    console.error('Failed to fetch instructors:', error);
    return NextResponse.json({ error: 'Failed to fetch instructors' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { academyInstructors } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { error as logError } from '@/lib/logging';

export async function GET() {
  try {
    const instructors = await db
      .select()
      .from(academyInstructors)
      .orderBy(desc(academyInstructors.createdAt));

    return NextResponse.json(instructors);
  } catch (error) {
    logError('Failed to fetch instructors', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Failed to fetch instructors' }, { status: 500 });
  }
}

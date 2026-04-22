import { NextResponse } from 'next/server'
import { getAvailableYears } from '@/lib/db/queries/contest-results'
import { error as logError } from '@/lib/logging'

export async function GET() {
  try {
    const years = await getAvailableYears()
    return NextResponse.json({ years })
  } catch (error) {
    logError('Failed to fetch contest years', error instanceof Error ? error : undefined)
    return NextResponse.json({ error: 'Failed to fetch contest years' }, { status: 500 })
  }
}

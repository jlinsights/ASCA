import { NextRequest, NextResponse } from 'next/server'
import { getContestResultsByYearGrouped } from '@/lib/db/queries/contest-results'
import { error as logError } from '@/lib/logging'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const { year: yearStr } = await params
    const year = parseInt(yearStr, 10)
    if (isNaN(year)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    const grouped = await getContestResultsByYearGrouped(year)
    return NextResponse.json(grouped)
  } catch (error) {
    logError('Failed to fetch contest results', error instanceof Error ? error : undefined)
    return NextResponse.json({ error: 'Failed to fetch contest results' }, { status: 500 })
  }
}

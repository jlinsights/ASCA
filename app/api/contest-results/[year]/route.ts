import { NextRequest, NextResponse } from 'next/server'
import { getContestResultsByYearGrouped } from '@/lib/db/queries/contest-results'

export async function GET(_request: NextRequest, { params }: { params: { year: string } }) {
  try {
    const year = parseInt(params.year, 10)
    if (isNaN(year)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    const grouped = await getContestResultsByYearGrouped(year)
    return NextResponse.json(grouped)
  } catch (error) {
    console.error('Failed to fetch contest results:', error)
    return NextResponse.json({ error: 'Failed to fetch contest results' }, { status: 500 })
  }
}

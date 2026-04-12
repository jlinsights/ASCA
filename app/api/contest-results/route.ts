import { NextResponse } from 'next/server'
import { getAvailableYears } from '@/lib/db/queries/contest-results'

export async function GET() {
  try {
    const years = await getAvailableYears()
    return NextResponse.json({ years })
  } catch (error) {
    console.error('Failed to fetch contest years:', error)
    return NextResponse.json({ error: 'Failed to fetch contest years' }, { status: 500 })
  }
}

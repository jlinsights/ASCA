import { NextResponse } from 'next/server'
import { getAllPartners } from '@/lib/db/queries/partners'
import { error as logError } from '@/lib/logging'

export async function GET() {
  try {
    const data = await getAllPartners()
    return NextResponse.json(data)
  } catch (error) {
    logError('Failed to fetch partners', error instanceof Error ? error : undefined)
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
  }
}

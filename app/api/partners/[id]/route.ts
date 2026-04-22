import { NextRequest, NextResponse } from 'next/server'
import { getPartnerById } from '@/lib/db/queries/partners'
import { error as logError } from '@/lib/logging'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const partner = await getPartnerById(id)
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }
    return NextResponse.json(partner)
  } catch (error) {
    logError('Failed to fetch partner', error instanceof Error ? error : undefined)
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 })
  }
}

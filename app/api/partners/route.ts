import { NextResponse } from 'next/server'
import { getAllPartners } from '@/lib/db/queries/partners'

export async function GET() {
  try {
    const data = await getAllPartners()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch partners:', error)
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
  }
}

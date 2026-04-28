import { NextRequest, NextResponse } from 'next/server'
import { getExhibitionFullById } from '@/lib/db/queries'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await getExhibitionFullById(params.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 })
  }
  return NextResponse.json({ data })
}

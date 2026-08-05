import { NextRequest, NextResponse } from 'next/server'
import { fetchArtworks } from '@/lib/api/artworks'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const limitParam = parseInt(searchParams.get('limit') || '12', 10)
    const limit = Number.isNaN(limitParam) ? 12 : Math.min(Math.max(limitParam, 1), 100)

    const result = await fetchArtworks(undefined, undefined, limit)

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message || '작품 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ artworks: result.data || [] })
  } catch (error) {
    return NextResponse.json({ error: '작품 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

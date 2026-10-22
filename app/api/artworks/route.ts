import { NextRequest, NextResponse } from 'next/server'
import { fetchArtworks } from '@/lib/api/artworks'
import { getSupabaseClient } from '@/lib/supabase'

// artworks 테이블에는 작가 이름이 없다. 작품 목록 화면이 artwork.artist.name 을 읽으므로 여기서 붙인다
// (없으면 프로덕션 /artworks 가 'Cannot read properties of undefined' 로 통째로 깨졌다, 2026-10-22).
async function withArtists<T extends { artist_id?: string | null }>(rows: T[]) {
  const ids = [...new Set(rows.map(row => row.artist_id).filter((id): id is string => !!id))]
  const supabase = getSupabaseClient()
  if (!supabase || ids.length === 0) return rows.map(row => ({ ...row, artist: null }))
  const { data } = await supabase.from('artists').select('id,name,name_en').in('id', ids)
  const byId = new Map((data ?? []).map(artist => [artist.id, artist]))
  return rows.map(row => {
    const artist = row.artist_id ? byId.get(row.artist_id) : undefined
    return {
      ...row,
      artist: artist
        ? { id: artist.id, name: artist.name, nameEn: artist.name_en ?? undefined }
        : null,
    }
  })
}

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

    const rows = (result.data || []) as unknown as { artist_id?: string | null }[]
    return NextResponse.json({ artworks: await withArtists(rows) })
  } catch (error) {
    return NextResponse.json({ error: '작품 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { fetchArtworks, fetchArtworksByArtist } from '@/lib/api/artworks'
import { getSupabaseClient } from '@/lib/supabase'
import { artworkImageUrl } from '@/lib/api/artwork-image'

// 기본으로 전부 준다 — 예전 기본값 12 때문에 134점 중 12점만 보였다 (2026-10-23)
const DEFAULT_LIMIT = 500
const MAX_LIMIT = 500
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// artworks 테이블에는 작가 이름이 없다. 작품 목록 화면이 artwork.artist.name 을 읽으므로 여기서 붙인다
// (없으면 프로덕션 /artworks 가 'Cannot read properties of undefined' 로 통째로 깨졌다, 2026-10-22).
type ArtworkRow = { artist_id?: string | null; images?: unknown; year_created?: number | null }

async function withArtists<T extends ArtworkRow>(rows: T[]) {
  const ids = [...new Set(rows.map(row => row.artist_id).filter((id): id is string => !!id))]
  const supabase = getSupabaseClient()
  const display = (row: T) => ({
    ...row,
    image_url: artworkImageUrl(row.images),
    year: row.year_created ?? undefined,
  })
  if (!supabase || ids.length === 0) return rows.map(row => ({ ...display(row), artist: null }))
  const { data } = await supabase.from('artists').select('id,name,name_en').in('id', ids)
  const byId = new Map((data ?? []).map(artist => [artist.id, artist]))
  return rows.map(row => {
    const artist = row.artist_id ? byId.get(row.artist_id) : undefined
    return {
      ...display(row),
      artist: artist
        ? { id: artist.id, name: artist.name, nameEn: artist.name_en ?? undefined }
        : null,
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const limitParam = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)
    const limit = Number.isNaN(limitParam)
      ? DEFAULT_LIMIT
      : Math.min(Math.max(limitParam, 1), MAX_LIMIT)

    // 작가 상세의 작품 칸 — 그 작가의 공개 작품만. 예전에는 이 값을 무시하고 전체를 돌려줬다
    const artistId = searchParams.get('artist_id') ?? searchParams.get('artistId')
    if (artistId !== null && !UUID.test(artistId)) {
      return NextResponse.json({ error: '작가 ID 형식이 올바르지 않습니다.' }, { status: 400 })
    }

    const result = artistId
      ? await fetchArtworksByArtist(artistId, ['published'])
      : await fetchArtworks(undefined, undefined, limit)

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message || '작품 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    const rows = (result.data || []) as unknown as ArtworkRow[]
    return NextResponse.json({ artworks: await withArtists(rows) })
  } catch (error) {
    return NextResponse.json({ error: '작품 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

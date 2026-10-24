import { NextRequest, NextResponse } from 'next/server'
import { getArtist } from '@/lib/api/artists'
import { log } from '@/lib/utils/logger'

// 옛 Webflow 작가 주소 /calligrapher/<slug> → /artists/<대표 slug>.
// slug 와 옛 주소(slug_aliases)를 DB 에서 찾는다 — 저장소에는 작가 이름 목록을 두지 않는다.
// 못 찾으면(비공개 작가는 RLS 가 가림, 대조 미확정 작가) 예전처럼 작가 목록으로 임시 이동한다.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params
  const fallback = NextResponse.redirect(new URL('/artists', request.url), 307)

  try {
    const artist = await getArtist(slug)
    const target = artist?.slug ?? artist?.id
    if (!target) return fallback
    return NextResponse.redirect(
      new URL(`/artists/${encodeURIComponent(target)}`, request.url),
      308
    )
  } catch (error) {
    log.error('calligrapher redirect lookup failed', error)
    return fallback
  }
}

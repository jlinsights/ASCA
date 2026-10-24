import { NextRequest, NextResponse } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { spacingTolerantPattern } from '@/lib/api/artists'
import {
  ADMIN_ARTISTS_PAGE_SIZE,
  ADMIN_ARTIST_COLUMNS,
  parseAdminArtistsQuery,
  type AdminArtistRow,
} from '@/lib/admin/artist-dues'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'

// 관리 화면용 작가 목록 — 비공개 작가와 회비 상태까지 본다.
// 관리자(ADMIN_EMAILS 의 인증된 기본 이메일)만, 서버에서 service role 로 읽는다.
export async function GET(request: NextRequest) {
  const identity = await archiveIdentity()
  if (!identity) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!identity.admin)
    return NextResponse.json({ error: '관리자만 볼 수 있습니다.' }, { status: 403 })

  const parsed = parseAdminArtistsQuery(new URL(request.url).searchParams)
  if (!parsed.success) {
    return NextResponse.json({ error: '조회 조건이 올바르지 않습니다.' }, { status: 400 })
  }
  const { q, grade, dues, page } = parsed.data
  const from = (page - 1) * ADMIN_ARTISTS_PAGE_SIZE

  try {
    let query = archiveWriter().from('artists').select(ADMIN_ARTIST_COLUMNS, { count: 'exact' })
    if (q) query = query.or(`name.ilike.*${q}*,name_zh.ilike.*${q}*,name_en.ilike.*${q}*`)
    if (grade) query = query.ilike('membership_type', spacingTolerantPattern(grade))
    if (dues) query = query.eq('dues_status', dues)

    const { data, error, count } = await query
      .order('name')
      .order('id')
      .range(from, from + ADMIN_ARTISTS_PAGE_SIZE - 1)
    if (error) throw error

    return NextResponse.json({
      artists: (data ?? []) as unknown as AdminArtistRow[],
      total: count ?? 0,
      page,
      pageSize: ADMIN_ARTISTS_PAGE_SIZE,
    })
  } catch (error) {
    log.error('admin artists list failed', error)
    return NextResponse.json({ error: '작가 목록을 불러오지 못했습니다.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import {
  ADMIN_APPLICATIONS_LIMIT,
  ADMIN_APPLICATION_COLUMNS,
  VIEW_STATUSES,
  adminApplicationQuerySchema,
} from '@/lib/applications/admin-applications'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 작가 신청 목록 — 관리자(MFA 완료)만. 기본은 아직 끝나지 않은 신청(접수·심사 중), 오래된 것부터.
export async function GET(request: NextRequest) {
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  const query = adminApplicationQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  )
  if (!query.success) return json({ error: 'Invalid query', code: 'INVALID_QUERY' }, 400)
  const { view, page } = query.data
  const from = (page - 1) * ADMIN_APPLICATIONS_LIMIT

  try {
    const { data, error, count } = await archiveWriter()
      .from('artist_applications')
      .select(ADMIN_APPLICATION_COLUMNS, { count: 'exact' })
      .in('status', [...VIEW_STATUSES[view]])
      // 처리할 것은 먼저 온 순서로, 끝난 것은 최근 순서로. id 로 같은 시각의 순서를 고정한다
      .order('submitted_at', { ascending: view === 'open' })
      .order('id', { ascending: true })
      .range(from, from + ADMIN_APPLICATIONS_LIMIT - 1)
    if (error) throw error
    return json({
      data: data ?? [],
      page,
      limit: ADMIN_APPLICATIONS_LIMIT,
      total: count ?? 0,
    })
  } catch (error) {
    log.error('admin artist applications list failed', error)
    return json({ error: 'Application list unavailable', code: 'APPLICATION_UNAVAILABLE' }, 500)
  }
}

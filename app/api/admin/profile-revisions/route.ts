import { NextRequest, NextResponse } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import {
  REVISION_COLUMNS,
  REVISIONS_PAGE_SIZE,
  revisionQuerySchema,
} from '@/lib/admin/profile-revisions'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 최근 작가 프로필 수정 — 관리자(MFA 완료)만, 최신 순
export async function GET(request: NextRequest) {
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  const query = revisionQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams))
  if (!query.success) return json({ error: 'Invalid query', code: 'INVALID_QUERY' }, 400)
  try {
    const db = archiveWriter()
    let select = db.from('artist_profile_revisions').select(REVISION_COLUMNS)
    if (query.data.artistId) select = select.eq('artist_id', query.data.artistId)
    const { data, error } = await select
      .order('created_at', { ascending: false })
      .limit(REVISIONS_PAGE_SIZE)
    if (error) throw error
    const rows = data ?? []
    // 누가 고쳤는지 — 계정 이메일을 관리자 응답에만 붙인다
    const emails = new Map<string, string | null>()
    await Promise.all(
      [...new Set(rows.map(row => row.account_id).filter((id): id is string => !!id))].map(
        async accountId => {
          const { data: user } = await db.auth.admin.getUserById(accountId)
          emails.set(accountId, user?.user?.email ?? null)
        }
      )
    )
    return json({
      data: rows.map(row => ({
        ...row,
        editor_email: row.account_id ? (emails.get(row.account_id) ?? null) : null,
      })),
    })
  } catch (error) {
    log.error('admin profile revisions list failed', error)
    return json({ error: 'Revision list unavailable', code: 'REVISIONS_UNAVAILABLE' }, 500)
  }
}

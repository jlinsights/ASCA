import { NextRequest, NextResponse } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { ADMIN_CLAIM_COLUMNS, adminClaimQuerySchema } from '@/lib/profile/artist-claims'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 연결 요청 검토 대기열 — 관리자(MFA 완료)만, 오래된 요청부터
export async function GET(request: NextRequest) {
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  const query = adminClaimQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  )
  if (!query.success) return json({ error: 'Invalid status', code: 'INVALID_QUERY' }, 400)
  try {
    const db = archiveWriter()
    const { data, error } = await db
      .from('artist_claim_requests')
      .select(ADMIN_CLAIM_COLUMNS)
      .eq('status', query.data.status)
      .order('created_at', { ascending: query.data.status === 'pending' })
      .limit(100)
    if (error) throw error
    const rows = data ?? []
    // 본인 확인용 — 요청 계정의 이메일을 관리자 응답에만 붙인다
    const emails = new Map<string, string | null>()
    await Promise.all(
      [...new Set(rows.map(row => row.account_id))].map(async accountId => {
        const { data: user } = await db.auth.admin.getUserById(accountId)
        emails.set(accountId, user?.user?.email ?? null)
      })
    )
    return json({
      data: rows.map(row => ({ ...row, claimant_email: emails.get(row.account_id) ?? null })),
    })
  } catch (error) {
    log.error('admin artist claims list failed', error)
    return json({ error: 'Claim list unavailable', code: 'CLAIM_UNAVAILABLE' }, 500)
  }
}

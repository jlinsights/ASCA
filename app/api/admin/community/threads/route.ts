import { NextResponse } from 'next/server'
import { archiveIdentity } from '@/lib/archive/writer'
import { listHiddenThreads } from '@/lib/community/feed'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 사무국이 숨긴 게시판 글 — 관리자(MFA 완료)만, 최근에 숨긴 순
export async function GET() {
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  try {
    return json({ data: await listHiddenThreads() })
  } catch (error) {
    log.error('admin hidden threads list failed', error)
    return json({ error: 'Community unavailable', code: 'COMMUNITY_UNAVAILABLE' }, 500)
  }
}

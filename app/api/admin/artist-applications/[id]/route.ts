import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { applicationDecisionSchema } from '@/lib/applications/admin-applications'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 신청 한 건의 심사 상태·메모를 바꾼다.
// 쓰기는 조건부 update 한 번 — DB 가 관리자가 본 상태(from)·처리 시각(seen)일 때만 바뀐다.
// 두 관리자가 동시에 상태나 메모를 고쳐도 뒤에 온 쪽은 409 를 받고 목록을 새로 읽는다.
// 감사 기록에는 상태와 메모 유무만 남긴다 — 메모 본문에 개인정보가 들어갈 수 있다.
export async function POST(request: NextRequest, { params }: Context) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success)
    return json({ error: 'Invalid application ID', code: 'INVALID_APPLICATION_ID' }, 400)
  const body = applicationDecisionSchema.safeParse(await request.json().catch(() => null))
  if (!body.success) return json({ error: 'Invalid decision', code: 'INVALID_DECISION' }, 400)
  const limited = await rateLimit({
    maxRequests: 60,
    windowMs: 60_000,
    keyGenerator: () => `artist-application-review:${identity.userId}`,
  }).check(request)
  if (limited) return limited

  const { from, seen, to, note } = body.data
  const changes: Record<string, unknown> = {
    status: to,
    reviewed_by: identity.userId,
    reviewed_at: new Date().toISOString(),
  }
  if (note !== undefined) changes.review_note = note.trim() || null

  try {
    const db = archiveWriter()
    const target = db.from('artist_applications').update(changes).eq('id', id).eq('status', from)
    const changed = await (
      seen === null ? target.is('reviewed_at', null) : target.eq('reviewed_at', seen)
    ).select('id')
    if (changed.error) throw changed.error
    if ((changed.data ?? []).length === 0) {
      // 없는 신청인지, 다른 관리자가 먼저 바꿨는지 가린다
      const { data: current, error: readError } = await db
        .from('artist_applications')
        .select('id')
        .eq('id', id)
        .maybeSingle()
      if (readError) throw readError
      if (!current)
        return json({ error: 'Application not found', code: 'APPLICATION_NOT_FOUND' }, 404)
      return json({ error: 'Application changed', code: 'APPLICATION_CHANGED' }, 409)
    }

    try {
      await auditTrail.trackDataChange(
        identity.userId,
        'update',
        'artist_application',
        id,
        { status: from },
        { status: to, note_changed: note !== undefined }
      )
    } catch (error) {
      // 바뀐 것은 이미 저장됐다 — 감사 기록 실패로 관리자에게 실패를 보이지 않는다
      log.error('artist application review audit failed', error)
    }
    return json({ data: { id, status: to } })
  } catch (error) {
    log.error('artist application review failed', error)
    return json({ error: 'Review failed', code: 'APPLICATION_UNAVAILABLE' }, 500)
  }
}

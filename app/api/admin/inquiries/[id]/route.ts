import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { auditTrail } from '@/lib/audit/audit-trail'
import { inquiryDecisionSchema } from '@/lib/inquiries/schema'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { log, logger } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

/** 관리자 쓰기 공통 확인 — 출처·로그인·관리자·ID·속도 */
async function guard(request: NextRequest, params: Context['params'], bucket: string) {
  try {
    if (!checkOrigin(request).ok)
      return { fail: json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403) }
  } catch {
    return { fail: json({ error: 'Origin check unavailable', code: 'UNAVAILABLE' }, 503) }
  }
  const identity = await archiveIdentity()
  if (!identity)
    return { fail: json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401) }
  if (!identity.admin) return { fail: json({ error: 'Admin only', code: 'FORBIDDEN' }, 403) }
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success)
    return { fail: json({ error: 'Invalid inquiry ID', code: 'INVALID_INQUIRY_ID' }, 400) }
  const limited = await rateLimit({
    maxRequests: 60,
    windowMs: 60_000,
    keyGenerator: () => `${bucket}:${identity.userId}`,
  }).check(request)
  if (limited) return { fail: limited }
  return { id, userId: identity.userId }
}

// 문의 한 건의 상태를 바꾼다 — 답함·종결이면 처리한 관리자와 시각을 남기고, 새 문의로 되돌리면 지운다
export async function POST(request: NextRequest, { params }: Context) {
  const checked = await guard(request, params, 'inquiry-status')
  if ('fail' in checked) return checked.fail
  const body = inquiryDecisionSchema.safeParse(await request.json().catch(() => null))
  if (!body.success) return json({ error: 'Invalid decision', code: 'INVALID_DECISION' }, 400)
  const { status, note } = body.data
  const handled = status === 'new' ? null : new Date().toISOString()

  try {
    const db = archiveWriter()
    // 감사 기록용 이전 값 — 문의자 개인정보·본문은 기록에 넣지 않는다
    const before = await db
      .from('inquiries')
      .select('status,handled_by,handled_at')
      .eq('id', checked.id)
      .maybeSingle()
    if (before.error) throw before.error
    if (!before.data) return json({ error: 'Inquiry not found', code: 'INQUIRY_NOT_FOUND' }, 404)

    const { data, error } = await db
      .from('inquiries')
      .update({
        status,
        handled_at: handled,
        handled_by: handled ? checked.userId : null,
        ...(note === undefined ? {} : { staff_note: note || null }),
      })
      .eq('id', checked.id)
      .select('id')
    if (error) throw error
    if (!data?.length) return json({ error: 'Inquiry not found', code: 'INQUIRY_NOT_FOUND' }, 404)
    await auditTrail.trackDataChange(checked.userId, 'update', 'inquiry', checked.id, before.data, {
      status,
      handled_by: handled ? checked.userId : null,
      handled_at: handled,
      noteChanged: note !== undefined,
    })
    // auditTrail 은 메모리 기록이라 운영에서도 출력되는 logger.warn(log.warn 은 개발 전용)에 식별자만 남긴다
    logger.warn('inquiry status changed', {
      id: checked.id,
      by: checked.userId,
      from: before.data.status,
      to: status,
    })
    return json({ ok: true })
  } catch (error) {
    log.error('admin inquiry update failed', error)
    return json({ error: 'Update failed', code: 'INQUIRY_UNAVAILABLE' }, 500)
  }
}

// 문의 한 건을 지운다 — 보유 기간이 지났거나 본인이 삭제를 요청했을 때(개인정보 보호법 제21·36조)
export async function DELETE(request: NextRequest, { params }: Context) {
  const checked = await guard(request, params, 'inquiry-delete')
  if ('fail' in checked) return checked.fail
  try {
    const { data, error } = await archiveWriter()
      .from('inquiries')
      .delete()
      .eq('id', checked.id)
      .select('id,topic,status,handled_by,created_at')
    if (error) throw error
    const removed = data?.[0]
    if (!removed) return json({ error: 'Inquiry not found', code: 'INQUIRY_NOT_FOUND' }, 404)
    // 지운 문의의 개인정보는 남기지 않고, 누가 언제 어떤 문의를 지웠는지만 남긴다
    await auditTrail.trackDataChange(checked.userId, 'delete', 'inquiry', checked.id, removed, null)
    logger.warn('inquiry deleted', { id: checked.id, by: checked.userId, status: removed.status })
    return json({ ok: true })
  } catch (error) {
    log.error('admin inquiry delete failed', error)
    return json({ error: 'Delete failed', code: 'INQUIRY_UNAVAILABLE' }, 500)
  }
}

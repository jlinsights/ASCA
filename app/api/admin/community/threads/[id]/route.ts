import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { threadModerationSchema } from '@/lib/community/threads'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

/**
 * 사무국 숨김·되살림 — 행은 지우지 않는다. 조건부 갱신이라
 * 이미 숨겨진(또는 이미 보이는) 글, 작성자가 지운 글은 바뀌지 않고 409 로 알린다.
 */
export async function POST(request: NextRequest, { params }: Context) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success)
    return json({ error: 'Invalid thread ID', code: 'INVALID_THREAD_ID' }, 400)
  const body = threadModerationSchema.safeParse(await request.json().catch(() => null))
  if (!body.success) return json({ error: 'Invalid action', code: 'INVALID_ACTION' }, 400)
  const limited = await rateLimit({
    maxRequests: 60,
    windowMs: 60_000,
    keyGenerator: () => `community-moderation:${identity.userId}`,
  }).check(request)
  if (limited) return limited

  try {
    const threads = archiveWriter().from('community_threads')
    const action = body.data
    const { data, error } =
      action.action === 'hide'
        ? await threads
            .update({
              hidden_at: new Date().toISOString(),
              hidden_by: identity.userId,
              hidden_reason: action.reason || null,
            })
            .eq('id', id)
            .is('hidden_at', null)
            .is('deleted_at', null)
            .select('id')
            .maybeSingle()
        : await threads
            .update({ hidden_at: null, hidden_by: null, hidden_reason: null })
            .eq('id', id)
            .not('hidden_at', 'is', null)
            .is('deleted_at', null)
            .select('id')
            .maybeSingle()
    if (error) throw error
    if (!data) return json({ error: 'Thread state changed', code: 'THREAD_STATE_CHANGED' }, 409)
    await auditTrail.trackDataChange(identity.userId, 'update', 'community_thread', id, undefined, {
      action: action.action,
    })
    return json({ data: { id, action: action.action } })
  } catch (error) {
    log.error('community moderation failed', error)
    return json({ error: 'Community unavailable', code: 'COMMUNITY_UNAVAILABLE' }, 500)
  }
}

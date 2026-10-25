import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { revisionDbFailure } from '@/lib/admin/profile-revisions'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })
const bodySchema = z.object({ action: z.literal('revert') }).strict()

// 수정 되돌리기 — 그 뒤로 같은 칸이 바뀌었으면 DB 함수가 거절한다(409 CHANGED_SINCE)
export async function POST(request: NextRequest, { params }: Context) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success)
    return json({ error: 'Invalid revision ID', code: 'INVALID_REVISION_ID' }, 400)
  if (!bodySchema.safeParse(await request.json().catch(() => null)).success)
    return json({ error: 'Invalid action', code: 'INVALID_ACTION' }, 400)
  const limited = await rateLimit({
    maxRequests: 60,
    windowMs: 60_000,
    keyGenerator: () => `profile-revert:${identity.userId}`,
  }).check(request)
  if (limited) return limited

  try {
    const { data, error } = await archiveWriter().rpc('revert_artist_profile_revision', {
      p_revision: id,
      p_admin: identity.userId,
    })
    if (error) {
      const failure = revisionDbFailure(error)
      if (failure) return json({ error: failure.code, code: failure.code }, failure.status)
      throw error
    }
    await auditTrail.trackDataChange(identity.userId, 'update', 'artist_profile', id, undefined, {
      action: 'revert',
      revisionId: data,
    })
    return json({ data: { id, revertRevisionId: data } })
  } catch (error) {
    log.error('profile revision revert failed', error)
    return json({ error: 'Revert failed', code: 'REVISIONS_UNAVAILABLE' }, 500)
  }
}

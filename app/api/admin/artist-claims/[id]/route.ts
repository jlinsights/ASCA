import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { claimDbFailure, claimDecisionSchema } from '@/lib/profile/artist-claims'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 승인·반려·해제 — 상태 확인과 연결 쓰기는 DB 함수가 한 트랜잭션으로 한다.
// 관리자 ID 를 넘기면 함수가 그 계정이 활성 관리자인지 다시 확인한다.
export async function POST(request: NextRequest, { params }: Context) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success)
    return json({ error: 'Invalid claim ID', code: 'INVALID_CLAIM_ID' }, 400)
  const body = claimDecisionSchema.safeParse(await request.json().catch(() => null))
  if (!body.success) return json({ error: 'Invalid decision', code: 'INVALID_DECISION' }, 400)
  const limited = await rateLimit({
    maxRequests: 60,
    windowMs: 60_000,
    keyGenerator: () => `artist-claim-review:${identity.userId}`,
  }).check(request)
  if (limited) return limited

  try {
    const db = archiveWriter()
    const decision = body.data
    const note = decision.note || undefined
    const { error } =
      decision.action === 'approve'
        ? await db.rpc('approve_artist_claim', {
            p_request: id,
            p_admin: identity.userId,
            p_artist: decision.artistId,
            p_note: note,
          })
        : await db.rpc(
            decision.action === 'reject' ? 'reject_artist_claim' : 'revoke_artist_claim',
            { p_request: id, p_admin: identity.userId, p_note: note }
          )
    if (error) {
      const failure = claimDbFailure(error)
      if (failure) return json({ error: failure.code, code: failure.code }, failure.status)
      throw error
    }
    await auditTrail.trackDataChange(identity.userId, 'update', 'artist_claim', id, undefined, {
      action: decision.action,
    })
    return json({ data: { id, action: decision.action } })
  } catch (error) {
    log.error('artist claim decision failed', error)
    return json({ error: 'Claim decision failed', code: 'CLAIM_UNAVAILABLE' }, 500)
  }
}

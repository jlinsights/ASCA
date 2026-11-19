import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { entryDecisionSchema } from '@/lib/contests/admin-entries'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 출품 한 건을 작가 행에 잇거나 푼다.
// 쓰기는 조건부 update 한 번 — 잇기는 아직 비어 있을 때만, 풀기는 이어져 있을 때만 바뀐다.
// 두 관리자가 동시에 눌러도 뒤에 온 쪽은 409 를 받고 목록을 새로 읽는다.
// 풀어도 match_method·matched_by·matched_at 은 마지막 연결 이력으로 남는다(DB CHECK 가 허용).
export async function POST(request: NextRequest, { params }: Context) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success)
    return json({ error: 'Invalid entry ID', code: 'INVALID_ENTRY_ID' }, 400)
  const body = entryDecisionSchema.safeParse(await request.json().catch(() => null))
  if (!body.success) return json({ error: 'Invalid decision', code: 'INVALID_DECISION' }, 400)
  const limited = await rateLimit({
    maxRequests: 60,
    windowMs: 60_000,
    keyGenerator: () => `contest-entry-link:${identity.userId}`,
  }).check(request)
  if (limited) return limited

  try {
    const db = archiveWriter()
    const decision = body.data

    const { data: entry, error: entryError } = await db
      .from('contest_entries')
      .select('id,artist_id')
      .eq('id', id)
      .maybeSingle()
    if (entryError) throw entryError
    if (!entry) return json({ error: 'Entry not found', code: 'ENTRY_NOT_FOUND' }, 404)

    let changed
    if (decision.action === 'link') {
      const { data: artist, error: artistError } = await db
        .from('artists')
        .select('id')
        .eq('id', decision.artistId)
        .maybeSingle()
      if (artistError) throw artistError
      if (!artist) return json({ error: 'Artist not found', code: 'ARTIST_NOT_FOUND' }, 404)

      changed = await db
        .from('contest_entries')
        .update({
          artist_id: decision.artistId,
          match_method: 'admin',
          matched_by: identity.userId,
          matched_at: new Date().toISOString(),
        })
        .eq('id', id)
        .is('artist_id', null)
        .select('id')
    } else {
      changed = await db
        .from('contest_entries')
        .update({ artist_id: null })
        .eq('id', id)
        .not('artist_id', 'is', null)
        .select('id')
    }
    if (changed.error) throw changed.error
    if ((changed.data ?? []).length === 0) {
      const code = decision.action === 'link' ? 'ENTRY_ALREADY_LINKED' : 'ENTRY_NOT_LINKED'
      return json({ error: code, code }, 409)
    }

    await auditTrail.trackDataChange(identity.userId, 'update', 'contest_entry', id, undefined, {
      action: decision.action,
      artist_id: decision.action === 'link' ? decision.artistId : entry.artist_id,
    })
    return json({ data: { id, action: decision.action } })
  } catch (error) {
    log.error('contest entry link failed', error)
    return json({ error: 'Entry link failed', code: 'ENTRY_UNAVAILABLE' }, 500)
  }
}

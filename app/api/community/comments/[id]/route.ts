import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

/**
 * 내 댓글 지우기 — 행은 남기고 deleted_at 만 찍는다.
 * 작성자 조건을 갱신문에 함께 걸어, 남의 댓글·이미 지운 댓글은 바뀌지 않고 404 가 된다
 * (남의 댓글이 있는지도 알려 주지 않는다).
 */
export async function DELETE(request: NextRequest, { params }: Context) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  try {
    const account = await getAccount()
    if (!account) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
    const { id } = await params
    if (!z.string().uuid().safeParse(id).success)
      return json({ error: 'Invalid comment ID', code: 'INVALID_COMMENT_ID' }, 400)
    const limited = await rateLimit({
      maxRequests: 60,
      windowMs: 60 * 60_000,
      keyGenerator: () => `community-comment-delete:${account.id}`,
    }).check(request)
    if (limited) return limited

    const { data, error } = await archiveWriter()
      .from('community_comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('author_id', account.id)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) return json({ error: 'Comment not found', code: 'COMMENT_NOT_FOUND' }, 404)
    await auditTrail.trackDataChange(
      account.id,
      'delete',
      'community_comment',
      id,
      undefined,
      undefined
    )
    return json({ data: { id } })
  } catch (error) {
    if (error instanceof AccountAuthError)
      return json({ error: error.code, code: error.code }, error.status)
    log.error('community comment delete failed', error)
    return json({ error: 'Community unavailable', code: 'COMMUNITY_UNAVAILABLE' }, 500)
  }
}

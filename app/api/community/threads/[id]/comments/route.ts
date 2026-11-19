import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { commentCreateSchema } from '@/lib/community/comments'
import { isOpenThread } from '@/lib/community/feed'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

/**
 * 댓글 쓰기 — 글쓰기와 같은 규칙(로그인 계정이 작성자, 표시 이름 필요).
 * 숨김·삭제된 글에는 달 수 없다.
 */
export async function POST(request: NextRequest, { params }: Context) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  try {
    const account = await getAccount()
    if (!account) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
    const { id } = await params
    if (!z.string().uuid().safeParse(id).success)
      return json({ error: 'Invalid thread ID', code: 'INVALID_THREAD_ID' }, 400)
    const body = commentCreateSchema.safeParse(await request.json().catch(() => null))
    if (!body.success)
      return json({ error: 'Invalid comment', code: 'INVALID_COMMENT_FIELDS' }, 400)
    if (!account.displayName.trim())
      return json({ error: 'Display name required', code: 'DISPLAY_NAME_REQUIRED' }, 409)
    const limited = await rateLimit({
      maxRequests: 30,
      windowMs: 60 * 60_000,
      keyGenerator: () => `community-comment:${account.id}`,
    }).check(request)
    if (limited) return limited
    if (!(await isOpenThread(id)))
      return json({ error: 'Thread not found', code: 'THREAD_NOT_FOUND' }, 404)

    const { data, error } = await archiveWriter()
      .from('community_comments')
      .insert({ thread_id: id, author_id: account.id, body: body.data.body })
      .select('id')
      .single()
    if (error) throw error
    // 본문은 로그에 남기지 않는다
    await auditTrail.trackDataChange(
      account.id,
      'create',
      'community_comment',
      data.id,
      undefined,
      {
        thread_id: id,
      }
    )
    return json({ data: { id: data.id } }, 201)
  } catch (error) {
    if (error instanceof AccountAuthError)
      return json({ error: error.code, code: error.code }, error.status)
    log.error('community comment create failed', error)
    return json({ error: 'Community unavailable', code: 'COMMUNITY_UNAVAILABLE' }, 500)
  }
}

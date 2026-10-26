import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { reactionSchema } from '@/lib/community/comments'
import { getReactions, isOpenThread } from '@/lib/community/feed'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

/**
 * 좋아요 켜기·끄기 — 원하는 상태({ liked })를 보내므로 두 번 눌려도 결과가 같다.
 * 이름이 드러나지 않으니 표시 이름은 묻지 않는다. 숨김·삭제 글에는 누를 수 없다.
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
    const body = reactionSchema.safeParse(await request.json().catch(() => null))
    if (!body.success) return json({ error: 'Invalid reaction', code: 'INVALID_REACTION' }, 400)
    const limited = await rateLimit({
      maxRequests: 60,
      windowMs: 60_000,
      keyGenerator: () => `community-reaction:${account.id}`,
    }).check(request)
    if (limited) return limited
    if (!(await isOpenThread(id)))
      return json({ error: 'Thread not found', code: 'THREAD_NOT_FOUND' }, 404)

    const reactions = archiveWriter().from('community_reactions')
    const { error } = body.data.liked
      ? await reactions.upsert(
          { thread_id: id, account_id: account.id },
          { onConflict: 'thread_id,account_id', ignoreDuplicates: true }
        )
      : await reactions.delete().eq('thread_id', id).eq('account_id', account.id)
    if (error) throw error
    return json({ data: await getReactions(id, account.id) })
  } catch (error) {
    if (error instanceof AccountAuthError)
      return json({ error: error.code, code: error.code }, error.status)
    log.error('community reaction failed', error)
    return json({ error: 'Community unavailable', code: 'COMMUNITY_UNAVAILABLE' }, 500)
  }
}

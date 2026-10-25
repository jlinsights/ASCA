import { NextRequest, NextResponse } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { threadCreateSchema } from '@/lib/community/threads'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

/**
 * 글쓰기 — 작성자는 로그인 계정으로만 정한다(본문에 실려 온 작성자 값은 버린다).
 * 게시판은 누구나 읽으므로 표시 이름이 비어 있으면 먼저 정하게 한다.
 */
export async function POST(request: NextRequest) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  try {
    const account = await getAccount()
    if (!account) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
    const body = threadCreateSchema.safeParse(await request.json().catch(() => null))
    if (!body.success)
      return json({ error: 'Invalid thread fields', code: 'INVALID_THREAD_FIELDS' }, 400)
    if (!account.displayName.trim())
      return json({ error: 'Display name required', code: 'DISPLAY_NAME_REQUIRED' }, 409)
    const limited = await rateLimit({
      maxRequests: 5,
      windowMs: 60 * 60_000,
      keyGenerator: () => `community-thread:${account.id}`,
    }).check(request)
    if (limited) return limited

    const { data, error } = await archiveWriter()
      .from('community_threads')
      .insert({ author_id: account.id, title: body.data.title, body: body.data.body })
      .select('id')
      .single()
    if (error) throw error
    // 제목·본문은 로그에 남기지 않는다
    await auditTrail.trackDataChange(
      account.id,
      'create',
      'community_thread',
      data.id,
      undefined,
      undefined
    )
    return json({ data: { id: data.id } }, 201)
  } catch (error) {
    if (error instanceof AccountAuthError)
      return json({ error: error.code, code: error.code }, error.status)
    log.error('community thread create failed', error)
    return json({ error: 'Community unavailable', code: 'COMMUNITY_UNAVAILABLE' }, 500)
  }
}

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
/** community_create_thread 가 사진을 붙이지 못할 때 내는 예외 */
const IMAGE_ERRORS = new Set(['COMMUNITY_IMAGES_UNAVAILABLE', 'COMMUNITY_IMAGES_INVALID'])

/**
 * 글쓰기 — 작성자는 로그인 계정으로만 정한다(본문에 실려 온 작성자 값은 버린다).
 * 게시판은 누구나 읽으므로 표시 이름이 비어 있으면 먼저 정하게 한다.
 * 사진은 미리 올려 둔 대기 사진 ID 로 받는다(POST /api/community/images).
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

    // 글 저장과 사진 붙이기를 한 트랜잭션으로 — 사진이 하나라도 내 대기 사진이 아니면 글도 남지 않는다
    const { data: threadId, error } = await archiveWriter().rpc('community_create_thread', {
      p_author: account.id,
      p_title: body.data.title,
      p_body: body.data.body,
      p_image_ids: body.data.imageIds,
    })
    if (error) {
      if (IMAGE_ERRORS.has(error.message))
        return json({ error: 'Images unavailable', code: 'IMAGES_UNAVAILABLE' }, 409)
      throw error
    }
    const data = { id: threadId as string }
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

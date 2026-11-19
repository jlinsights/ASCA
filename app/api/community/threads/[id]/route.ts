import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { threadCreateSchema } from '@/lib/community/threads'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

type Guard = { ok: true; accountId: string; id: string } | { ok: false; response: NextResponse }

/** 수정·삭제 공통 — 출처·로그인·ID·속도 제한 */
async function guard(request: NextRequest, params: Context['params']): Promise<Guard> {
  if (!checkOrigin(request).ok)
    return {
      ok: false,
      response: json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403),
    }
  const account = await getAccount()
  if (!account)
    return {
      ok: false,
      response: json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401),
    }
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success)
    return {
      ok: false,
      response: json({ error: 'Invalid thread ID', code: 'INVALID_THREAD_ID' }, 400),
    }
  const limited = await rateLimit({
    maxRequests: 30,
    windowMs: 60 * 60_000,
    keyGenerator: () => `community-thread-own:${account.id}`,
  }).check(request)
  if (limited) return { ok: false, response: limited as NextResponse }
  return { ok: true, accountId: account.id, id }
}

function failure(error: unknown, what: string) {
  if (error instanceof AccountAuthError)
    return json({ error: error.code, code: error.code }, error.status)
  log.error(`community thread ${what} failed`, error)
  return json({ error: 'Community unavailable', code: 'COMMUNITY_UNAVAILABLE' }, 500)
}

/**
 * 내 글 고치기 — 작성자·숨김·삭제 조건을 갱신문에 함께 건다.
 * 남의 글, 사무국이 숨긴 글, 지운 글이면 바뀌지 않고 404(존재 여부를 알리지 않는다).
 */
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const checked = await guard(request, params)
    if (!checked.ok) return checked.response
    const body = threadCreateSchema.safeParse(await request.json().catch(() => null))
    if (!body.success)
      return json({ error: 'Invalid thread fields', code: 'INVALID_THREAD_FIELDS' }, 400)
    const { data, error } = await archiveWriter()
      .from('community_threads')
      .update({ title: body.data.title, body: body.data.body })
      .eq('id', checked.id)
      .eq('author_id', checked.accountId)
      .is('hidden_at', null)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) return json({ error: 'Thread not found', code: 'THREAD_NOT_FOUND' }, 404)
    // 제목·본문은 로그에 남기지 않는다
    await auditTrail.trackDataChange(
      checked.accountId,
      'update',
      'community_thread',
      checked.id,
      undefined,
      undefined
    )
    return json({ data: { id: checked.id } })
  } catch (error) {
    return failure(error, 'update')
  }
}

/**
 * 내 글 지우기 — 행은 남기고 deleted_at 만 찍는다. 댓글·좋아요는 글과 함께 더 이상 보이지 않는다.
 * 사무국이 숨긴 글은 숨김 기록을 지키려고 작성자가 지울 수 없다(404).
 */
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const checked = await guard(request, params)
    if (!checked.ok) return checked.response
    const { data, error } = await archiveWriter()
      .from('community_threads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', checked.id)
      .eq('author_id', checked.accountId)
      .is('hidden_at', null)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) return json({ error: 'Thread not found', code: 'THREAD_NOT_FOUND' }, 404)
    await auditTrail.trackDataChange(
      checked.accountId,
      'delete',
      'community_thread',
      checked.id,
      undefined,
      undefined
    )
    return json({ data: { id: checked.id } })
  } catch (error) {
    return failure(error, 'delete')
  }
}

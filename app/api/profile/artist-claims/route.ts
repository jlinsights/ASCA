import { NextRequest, NextResponse } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import { MEMBER_CLAIM_COLUMNS, claimCreateSchema, claimInsert } from '@/lib/profile/artist-claims'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

function failure(error: unknown) {
  if (error instanceof AccountAuthError)
    return json({ error: error.code, code: error.code }, error.status)
  return json({ error: 'Claim operation failed', code: 'CLAIM_UNAVAILABLE' }, 500)
}

// 내 연결 요청 이력
export async function GET() {
  try {
    const account = await getAccount()
    if (!account) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
    const { data, error } = await archiveWriter()
      .from('artist_claim_requests')
      .select(MEMBER_CLAIM_COLUMNS)
      .eq('account_id', account.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    return json({ data: data ?? [], linkedArtistIds: account.artistIds })
  } catch (error) {
    return failure(error)
  }
}

// 연결 요청 — 공개 작가 페이지를 고르거나, 목록에 없으면 이름만 남긴다
export async function POST(request: NextRequest) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  try {
    const account = await getAccount()
    if (!account) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
    const body = claimCreateSchema.safeParse(await request.json().catch(() => null))
    if (!body.success)
      return json({ error: 'Invalid claim fields', code: 'INVALID_CLAIM_FIELDS' }, 400)
    const limited = await rateLimit({
      maxRequests: 10,
      windowMs: 60 * 60_000,
      keyGenerator: () => `artist-claim:${account.id}`,
    }).check(request)
    if (limited) return limited
    if (account.artistIds.length > 0)
      return json({ error: 'Account already linked', code: 'ACCOUNT_ALREADY_LINKED' }, 409)

    const db = archiveWriter()
    if (body.data.artistId) {
      // 공개 페이지만 고를 수 있다. 비공개 행은 존재 여부도 드러내지 않는다(#117).
      const { data: artist, error } = await db
        .from('artists')
        .select('id,claimed_by_user_id')
        .eq('id', body.data.artistId)
        .eq('visibility', 'public')
        .maybeSingle()
      if (error) throw error
      if (!artist) return json({ error: 'Artist not found', code: 'ARTIST_NOT_FOUND' }, 404)
      if (artist.claimed_by_user_id)
        return json({ error: 'Artist already linked', code: 'ARTIST_ALREADY_LINKED' }, 409)
    }

    const { data, error } = await db
      .from('artist_claim_requests')
      .insert(claimInsert(account.id, body.data))
      .select(MEMBER_CLAIM_COLUMNS)
      .single()
    // 계정당 대기 요청 하나 — 고유 인덱스가 동시 요청까지 막는다
    if (error?.code === '23505')
      return json({ error: 'A request is already pending', code: 'CLAIM_PENDING' }, 409)
    if (error) throw error
    // 이름·메모는 로그에 남기지 않는다
    await auditTrail.trackDataChange(account.id, 'create', 'artist_claim', data.id, undefined, {
      listed: Boolean(body.data.artistId),
    })
    return json({ data }, 201)
  } catch (error) {
    return failure(error)
  }
}

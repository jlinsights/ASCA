import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditTrail } from '@/lib/audit/audit-trail'
import { MEMBER_CLAIM_COLUMNS } from '@/lib/profile/artist-claims'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 대기 중인 내 요청 철회 — 검토가 끝난 요청은 건드리지 않는다
export async function DELETE(request: NextRequest, { params }: Context) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  try {
    const account = await getAccount()
    if (!account) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
    const { id } = await params
    if (!z.string().uuid().safeParse(id).success)
      return json({ error: 'Invalid claim ID', code: 'INVALID_CLAIM_ID' }, 400)
    const { data, error } = await archiveWriter()
      .from('artist_claim_requests')
      .update({ status: 'withdrawn' })
      .eq('id', id)
      .eq('account_id', account.id)
      .eq('status', 'pending')
      .select(MEMBER_CLAIM_COLUMNS)
      .maybeSingle()
    if (error) throw error
    if (!data) return json({ error: 'Pending claim not found', code: 'CLAIM_NOT_PENDING' }, 404)
    await auditTrail.trackDataChange(account.id, 'update', 'artist_claim', id, undefined, {
      status: 'withdrawn',
    })
    return json({ data })
  } catch (error) {
    if (error instanceof AccountAuthError)
      return json({ error: error.code, code: error.code }, error.status)
    return json({ error: 'Claim operation failed', code: 'CLAIM_UNAVAILABLE' }, 500)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { rateLimit } from '@/lib/security/rate-limit'
import { auditTrail } from '@/lib/audit/audit-trail'
import {
  ARTIST_PROFILE_COLUMNS,
  artistProfilePatch,
  artistProfileResponse,
  artistProfileUpdateSchema,
} from '@/lib/profile/editor'

export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

async function owner(id: string) {
  const account = await getAccount()
  if (!account) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!z.string().uuid().safeParse(id).success)
    return json({ error: 'Invalid artist ID', code: 'INVALID_ARTIST_ID' }, 400)
  // Administrators have no ownership bypass in the self-service editor.
  if (!account.artistIds.includes(id))
    return json({ error: 'Artist is not linked to this account', code: 'FORBIDDEN' }, 403)
  return account
}

function failure(error: unknown) {
  if (error instanceof AccountAuthError)
    return json({ error: error.code, code: error.code }, error.status)
  return json({ error: 'Profile operation failed', code: 'PROFILE_UNAVAILABLE' }, 500)
}

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const account = await owner(id)
    if (account instanceof NextResponse) return account
    const { data, error } = await archiveWriter()
      .from('artists')
      .select(ARTIST_PROFILE_COLUMNS)
      .eq('id', id)
      .eq('claimed_by_user_id', account.id)
      .maybeSingle()
    if (error) throw error
    if (!data) return json({ error: 'Linked artist not found', code: 'NOT_FOUND' }, 404)
    return json({ data: artistProfileResponse(data) })
  } catch (error) {
    return failure(error)
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  if (!checkOrigin(request).ok)
    return json({ error: 'Origin rejected', code: 'CSRF_ORIGIN_MISMATCH' }, 403)
  try {
    const { id } = await params
    const account = await owner(id)
    if (account instanceof NextResponse) return account
    const body = artistProfileUpdateSchema.safeParse(await request.json().catch(() => null))
    if (!body.success)
      return json(
        { error: 'Unsupported or invalid profile fields', code: 'INVALID_PROFILE_FIELDS' },
        400
      )
    const limited = await rateLimit({
      maxRequests: 60,
      windowMs: 60_000,
      keyGenerator: () => `artist-profile:${account.id}`,
    }).check(request)
    if (limited) return limited
    // Recheck the owner in the write itself so a revoked mapping cannot use a stale account lookup.
    const { data, error } = await archiveWriter()
      .from('artists')
      .update({ ...artistProfilePatch(body.data), updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('claimed_by_user_id', account.id)
      .select(ARTIST_PROFILE_COLUMNS)
      .maybeSingle()
    if (error) throw error
    if (!data) return json({ error: 'Linked artist not found', code: 'NOT_FOUND' }, 404)
    // Record the actor and changed columns without copying biographies or birth dates into logs.
    await auditTrail.trackDataChange(account.id, 'update', 'artist_profile', id, undefined, {
      fields: Object.keys(artistProfilePatch(body.data)),
    })
    return json({ data: artistProfileResponse(data) })
  } catch (error) {
    return failure(error)
  }
}

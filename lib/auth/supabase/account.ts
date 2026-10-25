import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SupabaseAccount } from './types'
export type { SupabaseAccount } from './types'

import { AccountAuthError, isInvalidSession } from './errors'
export { AccountAuthError, isInvalidSession } from './errors'

/**
 * Pass a request-scoped cookie client using the publishable/anon key.
 * Never use a service-role client here: ownership and profile reads must obey RLS.
 * Roles and artist ownership always come from the database, never user metadata.
 */
export async function loadSupabaseAccount(client: SupabaseClient): Promise<SupabaseAccount | null> {
  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError) {
    if (isInvalidSession(authError)) return null
    throw new AccountAuthError('AUTH_UNAVAILABLE', 503)
  }
  const user = authData.user
  if (!user?.email || !user.email_confirmed_at) return null

  const { data: profile, error: profileError } = await client
    .from('account_profiles')
    .select('id,role,display_name,locale,disabled_at,created_at,updated_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) throw new AccountAuthError('AUTH_UNAVAILABLE', 503)
  if (
    !profile ||
    profile.id !== user.id ||
    profile.disabled_at ||
    !['member', 'admin'].includes(profile.role)
  ) {
    return null
  }

  // getUser verifies the current user; getClaims verifies the JWT used for MFA.
  // Do not decode an unverified JWT or read assurance/role from user_metadata.
  const { data: claimsData, error: claimsError } = await client.auth.getClaims()
  if (claimsError && isInvalidSession(claimsError)) return null
  const claims = claimsData?.claims
  if (claimsError || claims?.sub !== user.id || (claims.aal !== 'aal1' && claims.aal !== 'aal2')) {
    throw new AccountAuthError('AUTH_UNAVAILABLE', 503)
  }

  const { data: artists, error: artistError } = await client.rpc('get_my_artist_ids')
  if (artistError || !Array.isArray(artists)) {
    throw new AccountAuthError('AUTH_UNAVAILABLE', 503)
  }

  return {
    id: user.id,
    email: user.email,
    displayName: profile.display_name,
    locale: profile.locale,
    role: profile.role,
    assuranceLevel: claims.aal,
    artistIds: artists.map((artist: { artist_id: string }) => artist.artist_id),
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

export async function requireSupabaseAccount(client: SupabaseClient): Promise<SupabaseAccount> {
  const account = await loadSupabaseAccount(client)
  if (!account) throw new AccountAuthError('UNAUTHORIZED', 401)
  return account
}

export async function requireSupabaseAdmin(client: SupabaseClient): Promise<SupabaseAccount> {
  const account = await requireSupabaseAccount(client)
  if (account.role !== 'admin') throw new AccountAuthError('FORBIDDEN', 403)
  if (account.assuranceLevel !== 'aal2') throw new AccountAuthError('MFA_REQUIRED', 403)
  return account
}

/** Use only with an account freshly loaded by loadSupabaseAccount on the server. */
export function canManageArtist(account: SupabaseAccount, artistId: string): boolean {
  if (account.role === 'admin') return account.assuranceLevel === 'aal2'
  return account.artistIds.includes(artistId)
}

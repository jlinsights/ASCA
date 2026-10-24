/** @jest-environment node */
import { AuthApiError, type SupabaseClient } from '@supabase/supabase-js'
import {
  loadSupabaseAccount,
  requireSupabaseAccount,
  requireSupabaseAdmin,
  canManageArtist,
} from '../account'

jest.mock('server-only', () => ({}))

const userId = '11111111-1111-4111-8111-111111111111'
const artistId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

function fixture() {
  const getUser = jest.fn().mockResolvedValue({
    data: {
      user: {
        id: userId,
        email: 'artist@example.test',
        email_confirmed_at: '2026-10-24T00:00:00Z',
        user_metadata: { role: 'admin', full_name: 'Forged administrator' },
      },
    },
    error: null,
  })
  const getClaims = jest.fn().mockResolvedValue({
    data: { claims: { sub: userId, aal: 'aal1' } },
    error: null,
  })
  const maybeSingle = jest.fn().mockResolvedValue({
    data: { id: userId, role: 'member', display_name: '작가', locale: 'ko', disabled_at: null },
    error: null,
  })
  const eq = jest.fn().mockReturnValue({ maybeSingle })
  const select = jest.fn().mockReturnValue({ eq })
  const from = jest.fn().mockReturnValue({ select })
  const rpc = jest.fn().mockResolvedValue({ data: [{ artist_id: artistId }], error: null })
  const client = { auth: { getUser, getClaims }, from, rpc } as unknown as SupabaseClient
  return { client, getUser, getClaims, maybeSingle, eq, from, rpc }
}

describe('Supabase account authority', () => {
  it('uses the DB role and resolves artist IDs independently from the account ID', async () => {
    const f = fixture()
    const account = await loadSupabaseAccount(f.client)
    expect(account).toMatchObject({ id: userId, role: 'member', artistIds: [artistId] })
    expect(f.eq).toHaveBeenCalledWith('id', userId)
    expect(canManageArtist(account!, artistId)).toBe(true)
    expect(canManageArtist(account!, userId)).toBe(false)
    await expect(requireSupabaseAdmin(f.client)).rejects.toMatchObject({ status: 403 })
  })

  it('returns signed out for a missing session', async () => {
    const f = fixture()
    f.getUser.mockResolvedValue({
      data: { user: null },
      error: { name: 'AuthSessionMissingError' },
    })
    expect(await loadSupabaseAccount(f.client)).toBeNull()
    expect(f.from).not.toHaveBeenCalled()
  })

  it.each([
    'bad_jwt',
    'session_not_found',
    'session_expired',
    'refresh_token_not_found',
    'refresh_token_already_used',
    'user_not_found',
    'user_banned',
  ] as const)('reports an invalid session as 401, not a service failure: %s', async code => {
    const f = fixture()
    f.getUser.mockResolvedValue({ data: { user: null }, error: new AuthApiError(code, 401, code) })
    await expect(requireSupabaseAccount(f.client)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      status: 401,
    })
    expect(f.from).not.toHaveBeenCalled()
  })

  it('handles a revoked refresh token returned as HTTP 400', async () => {
    const f = fixture()
    f.getUser.mockResolvedValue({
      data: { user: null },
      error: new AuthApiError('Revoked token', 400, 'refresh_token_not_found'),
    })
    await expect(requireSupabaseAccount(f.client)).rejects.toMatchObject({ status: 401 })
  })

  it('denies a session that becomes invalid while checking its MFA claims', async () => {
    const f = fixture()
    f.getClaims.mockResolvedValue({
      data: null,
      error: new AuthApiError('Invalid JWT', 401, 'bad_jwt'),
    })
    await expect(requireSupabaseAdmin(f.client)).rejects.toMatchObject({ status: 401 })
    expect(f.rpc).not.toHaveBeenCalled()
  })

  it('keeps authentication server errors as service failures', async () => {
    const f = fixture()
    f.getUser.mockResolvedValue({
      data: { user: null },
      error: new AuthApiError('Server failure', 500, 'unexpected_failure'),
    })
    await expect(requireSupabaseAccount(f.client)).rejects.toMatchObject({ status: 503 })
  })

  it('does not disguise an auth service failure as a signed-out user', async () => {
    const f = fixture()
    f.getUser.mockResolvedValue({
      data: { user: null },
      error: { name: 'AuthRetryableFetchError' },
    })
    await expect(loadSupabaseAccount(f.client)).rejects.toMatchObject({ status: 503 })
  })

  it.each([
    { data: null, error: null },
    { data: { id: userId, role: 'admin', disabled_at: '2026-10-24' }, error: null },
    { data: { id: userId, role: 'superadmin', disabled_at: null }, error: null },
  ])('denies a missing, disabled, or invalid profile', async profile => {
    const f = fixture()
    f.maybeSingle.mockResolvedValue(profile)
    expect(await loadSupabaseAccount(f.client)).toBeNull()
    expect(f.rpc).not.toHaveBeenCalled()
  })

  it('fails closed when profile or ownership lookup fails', async () => {
    const f = fixture()
    f.maybeSingle.mockResolvedValueOnce({ data: null, error: { code: '42P01' } })
    await expect(loadSupabaseAccount(f.client)).rejects.toMatchObject({ status: 503 })
    f.rpc.mockResolvedValueOnce({ data: null, error: { code: '42501' } })
    await expect(loadSupabaseAccount(f.client)).rejects.toMatchObject({ status: 503 })
  })

  it('rejects an unconfirmed email even if the DB role is admin', async () => {
    const f = fixture()
    f.getUser.mockResolvedValue({
      data: { user: { id: userId, email: 'unverified@example.test', email_confirmed_at: null } },
      error: null,
    })
    expect(await loadSupabaseAccount(f.client)).toBeNull()
    expect(f.from).not.toHaveBeenCalled()
  })

  it('requires MFA for admin access, including other artists', async () => {
    const f = fixture()
    f.maybeSingle.mockResolvedValue({
      data: { id: userId, role: 'admin', display_name: '관리자', locale: 'ko', disabled_at: null },
      error: null,
    })
    const account = await loadSupabaseAccount(f.client)
    expect(canManageArtist(account!, userId)).toBe(false)
    await expect(requireSupabaseAdmin(f.client)).rejects.toMatchObject({
      status: 403,
      code: 'MFA_REQUIRED',
    })
    f.getClaims.mockResolvedValue({ data: { claims: { sub: userId, aal: 'aal2' } }, error: null })
    const admin = await requireSupabaseAdmin(f.client)
    expect(canManageArtist(admin, userId)).toBe(true)
  })

  it.each([
    { data: { claims: { sub: 'another-user', aal: 'aal2' } }, error: null },
    { data: { claims: { sub: userId, aal: 'unsupported' } }, error: null },
    { data: null, error: { message: 'invalid JWT' } },
  ])('never grants access from invalid or mismatched claims', async claims => {
    const f = fixture()
    f.getClaims.mockResolvedValue(claims)
    await expect(loadSupabaseAccount(f.client)).rejects.toMatchObject({ status: 503 })
  })
})

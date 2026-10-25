/** @jest-environment node */
import { NextRequest } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { GET } from '../route'
import { POST } from '../[id]/route'

jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: async () => null }) }))

const identity = jest.mocked(archiveIdentity)
const claimId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const artistId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const admin = { userId: '22222222-2222-4222-8222-222222222222', admin: true }

let query: Record<string, jest.Mock>
beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  identity.mockResolvedValue(admin)
  query = {}
  for (const method of ['from', 'select', 'eq', 'order']) query[method] = jest.fn(() => query)
  query.limit = jest.fn().mockResolvedValue({ data: [], error: null })
  query.rpc = jest.fn().mockResolvedValue({ data: artistId, error: null })
  jest.mocked(archiveWriter).mockReturnValue(query as any)
})

const list = (qs = '') => GET(new NextRequest(`https://asca.example/api/admin/artist-claims${qs}`))
const decide = (body: unknown, id = claimId) =>
  POST(
    new NextRequest(`https://asca.example/api/admin/artist-claims/${id}`, {
      method: 'POST',
      headers: { origin: 'https://asca.example' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  )

describe('GET /api/admin/artist-claims', () => {
  it('401/403 without an MFA admin — no service-role access', async () => {
    identity.mockResolvedValueOnce(null)
    expect((await list()).status).toBe(401)
    identity.mockResolvedValueOnce({ userId: 'member', admin: false })
    expect((await list()).status).toBe(403)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('defaults to the pending queue, oldest first; rejects unknown statuses', async () => {
    expect((await list()).status).toBe(200)
    expect(query.eq).toHaveBeenCalledWith('status', 'pending')
    expect(query.order).toHaveBeenCalledWith('created_at', { ascending: true })
    expect((await list('?status=deleted')).status).toBe(400)
  })

  it('attaches each claimant’s email once per account', async () => {
    const accountId = '33333333-3333-4333-8333-333333333333'
    query.limit.mockResolvedValueOnce({
      data: [
        { id: 'r1', account_id: accountId },
        { id: 'r2', account_id: accountId },
      ],
      error: null,
    })
    const getUserById = jest
      .fn()
      .mockResolvedValue({ data: { user: { email: 'claimant@example.test' } } })
    ;(query as any).auth = { admin: { getUserById } }
    const body = await (await list()).json()
    expect(getUserById).toHaveBeenCalledTimes(1)
    expect(body.data.map((row: { claimant_email: string }) => row.claimant_email)).toEqual([
      'claimant@example.test',
      'claimant@example.test',
    ])
  })
})

describe('POST /api/admin/artist-claims/[id]', () => {
  it('rejects a bad Origin, a non-admin and a malformed body before any RPC', async () => {
    jest.mocked(checkOrigin).mockReturnValueOnce({ ok: false })
    expect((await decide({ action: 'approve' })).status).toBe(403)
    identity.mockResolvedValueOnce({ userId: 'member', admin: false })
    expect((await decide({ action: 'approve' })).status).toBe(403)
    expect((await decide({ action: 'delete' })).status).toBe(400)
    expect((await decide({ action: 'approve' }, 'nope')).status).toBe(400)
    expect(query.rpc).not.toHaveBeenCalled()
  })

  it('passes the signed-in admin (never a body field) to approve', async () => {
    expect((await decide({ action: 'approve', artistId, note: '확인함' })).status).toBe(200)
    expect(query.rpc).toHaveBeenCalledWith('approve_artist_claim', {
      p_request: claimId,
      p_admin: admin.userId,
      p_artist: artistId,
      p_note: '확인함',
    })
    expect((await decide({ action: 'approve', adminId: 'someone' })).status).toBe(400)
  })

  it('routes reject and revoke to their functions', async () => {
    await decide({ action: 'reject', note: '확인 불가' })
    await decide({ action: 'revoke' })
    expect(query.rpc.mock.calls.map(([fn]) => fn)).toEqual([
      'reject_artist_claim',
      'revoke_artist_claim',
    ])
  })

  it.each([
    ['23505', 409, 'ARTIST_ALREADY_LINKED'],
    ['55000', 409, 'CLAIM_NOT_PENDING'],
    ['22023', 400, 'ARTIST_REQUIRED'],
    ['42501', 403, 'CLAIM_NOT_ALLOWED'],
    ['P0002', 404, 'CLAIM_NOT_FOUND'],
  ])('maps SQLSTATE %s to %i', async (code, status, expected) => {
    query.rpc.mockResolvedValueOnce({ data: null, error: { code } })
    const response = await decide({ action: 'approve' })
    expect(response.status).toBe(status)
    expect((await response.json()).code).toBe(expected)
  })

  it('500 on an unknown database error', async () => {
    query.rpc.mockResolvedValueOnce({ data: null, error: { code: 'XX000' } })
    expect((await decide({ action: 'reject' })).status).toBe(500)
  })
})

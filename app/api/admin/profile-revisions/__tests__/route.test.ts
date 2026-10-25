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
const admin = { userId: '22222222-2222-4222-8222-222222222222', admin: true }
const revisionId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const artistId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const editor = '33333333-3333-4333-8333-333333333333'

let query: Record<string, jest.Mock> & { auth?: unknown }
let getUserById: jest.Mock
beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  identity.mockResolvedValue(admin)
  query = {}
  for (const method of ['from', 'select', 'eq', 'order']) query[method] = jest.fn(() => query)
  query.limit = jest.fn().mockResolvedValue({ data: [], error: null })
  query.rpc = jest.fn().mockResolvedValue({ data: 'undo-1', error: null })
  getUserById = jest.fn().mockResolvedValue({ data: { user: { email: 'artist@example.test' } } })
  query.auth = { admin: { getUserById } }
  jest.mocked(archiveWriter).mockReturnValue(query as any)
})

const list = (qs = '') =>
  GET(new NextRequest(`https://asca.example/api/admin/profile-revisions${qs}`))
const revert = (body: unknown = { action: 'revert' }, id = revisionId) =>
  POST(
    new NextRequest(`https://asca.example/api/admin/profile-revisions/${id}`, {
      method: 'POST',
      headers: { origin: 'https://asca.example' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  )

describe('GET /api/admin/profile-revisions', () => {
  it('401/403 without an MFA admin — no service-role access', async () => {
    identity.mockResolvedValueOnce(null)
    expect((await list()).status).toBe(401)
    identity.mockResolvedValueOnce({ userId: 'member', admin: false })
    expect((await list()).status).toBe(403)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('lists newest first, filters by artist, and attaches the editor email once', async () => {
    query.limit.mockResolvedValueOnce({
      data: [
        { id: 'r1', account_id: editor },
        { id: 'r2', account_id: editor },
        { id: 'r3', account_id: null },
      ],
      error: null,
    })
    const body = await (await list(`?artistId=${artistId}`)).json()
    expect(query.eq).toHaveBeenCalledWith('artist_id', artistId)
    expect(query.order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(getUserById).toHaveBeenCalledTimes(1)
    expect(body.data.map((row: { editor_email: string | null }) => row.editor_email)).toEqual([
      'artist@example.test',
      'artist@example.test',
      null,
    ])
    expect((await list('?artistId=nope')).status).toBe(400)
  })
})

describe('POST /api/admin/profile-revisions/[id]', () => {
  it('rejects bad Origin, non-admin, bad id and unknown actions before the RPC', async () => {
    jest.mocked(checkOrigin).mockReturnValueOnce({ ok: false })
    expect((await revert()).status).toBe(403)
    identity.mockResolvedValueOnce({ userId: 'member', admin: false })
    expect((await revert()).status).toBe(403)
    expect((await revert({ action: 'revert' }, 'nope')).status).toBe(400)
    expect((await revert({ action: 'delete' })).status).toBe(400)
    expect((await revert({ action: 'revert', adminId: 'x' })).status).toBe(400)
    expect(query.rpc).not.toHaveBeenCalled()
  })

  it('passes the signed-in admin to the revert function', async () => {
    const response = await revert()
    expect(response.status).toBe(200)
    expect(query.rpc).toHaveBeenCalledWith('revert_artist_profile_revision', {
      p_revision: revisionId,
      p_admin: admin.userId,
    })
  })

  it.each([
    ['40001', 409, 'CHANGED_SINCE'],
    ['55000', 409, 'NOT_REVERTIBLE'],
    ['42501', 403, 'REVIEWER_NOT_ALLOWED'],
    ['P0002', 404, 'REVISION_NOT_FOUND'],
  ])('maps SQLSTATE %s to %i', async (code, status, expected) => {
    query.rpc.mockResolvedValueOnce({ data: null, error: { code } })
    const response = await revert()
    expect(response.status).toBe(status)
    expect((await response.json()).code).toBe(expected)
  })

  it('500 on an unknown database error', async () => {
    query.rpc.mockResolvedValueOnce({ data: null, error: { code: 'XX000' } })
    expect((await revert()).status).toBe(500)
  })
})

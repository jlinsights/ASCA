/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditTrail } from '@/lib/audit/audit-trail'
import { GET, POST } from '../route'
import { DELETE } from '../[id]/route'

jest.mock('server-only', () => ({}))
jest.mock('@/lib/archive/writer', () => ({ archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))
jest.mock('@/lib/security/rate-limit', () => ({
  rateLimit: () => ({ check: async () => null }),
}))

const artistId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const claimId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const accountId = '11111111-1111-4111-8111-111111111111'
const account = { id: accountId, role: 'member', artistIds: [] as string[] }
const claim = { id: claimId, artist_id: artistId, claimed_name: '시험 작가', status: 'pending' }

let query: Record<string, jest.Mock>
let calls: [string, unknown[]][]
beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(getAccount).mockResolvedValue({ ...account } as any)
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  calls = []
  query = {}
  for (const method of ['from', 'select', 'eq', 'update', 'insert', 'order']) {
    query[method] = jest.fn((...args: unknown[]) => {
      calls.push([method, args])
      return query
    })
  }
  query.limit = jest.fn().mockResolvedValue({ data: [claim], error: null })
  query.maybeSingle = jest
    .fn()
    .mockResolvedValue({ data: { id: artistId, claimed_by_user_id: null }, error: null })
  query.single = jest.fn().mockResolvedValue({ data: claim, error: null })
  jest.mocked(archiveWriter).mockReturnValue(query as any)
})

const post = (body: unknown) =>
  POST(
    new NextRequest('https://asca.example/api/profile/artist-claims', {
      method: 'POST',
      headers: { origin: 'https://asca.example' },
      body: JSON.stringify(body),
    })
  )
const withdraw = (value = claimId) =>
  DELETE(
    new NextRequest(`https://asca.example/api/profile/artist-claims/${value}`, {
      method: 'DELETE',
      headers: { origin: 'https://asca.example' },
    }),
    { params: Promise.resolve({ id: value }) }
  )

describe('GET /api/profile/artist-claims', () => {
  it('401 without an account, and lists only this account’s requests', async () => {
    jest.mocked(getAccount).mockResolvedValueOnce(null)
    expect((await GET()).status).toBe(401)
    expect(archiveWriter).not.toHaveBeenCalled()

    const response = await GET()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(calls).toContainEqual(['eq', ['account_id', accountId]])
    // 회원 응답에는 검토자 ID 가 없다
    expect(String(calls.find(([m]) => m === 'select')?.[1][0])).not.toContain('reviewed_by')
  })
})

describe('POST /api/profile/artist-claims', () => {
  it('rejects a bad Origin before authentication', async () => {
    jest.mocked(checkOrigin).mockReturnValue({ ok: false })
    expect((await post({ claimedName: '작가' })).status).toBe(403)
    expect(getAccount).not.toHaveBeenCalled()
  })

  it('400 on unknown fields or a client-chosen account', async () => {
    expect((await post({ claimedName: '' })).status).toBe(400)
    expect((await post({ claimedName: '작가', accountId: 'someone-else' })).status).toBe(400)
    expect(query.insert).not.toHaveBeenCalled()
  })

  it('409 when the account is already linked to an artist page', async () => {
    jest.mocked(getAccount).mockResolvedValueOnce({ ...account, artistIds: [artistId] } as any)
    expect((await post({ claimedName: '작가', artistId })).status).toBe(409)
    expect(query.insert).not.toHaveBeenCalled()
  })

  it('only offers public artist rows, and hides whether a hidden row exists', async () => {
    query.maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    const response = await post({ claimedName: '작가', artistId })
    expect(response.status).toBe(404)
    expect(calls).toContainEqual(['eq', ['visibility', 'public']])
    expect(query.insert).not.toHaveBeenCalled()
  })

  it('409 when the chosen page is already linked', async () => {
    query.maybeSingle.mockResolvedValueOnce({
      data: { id: artistId, claimed_by_user_id: 'someone' },
      error: null,
    })
    expect((await post({ claimedName: '작가', artistId })).status).toBe(409)
    expect(query.insert).not.toHaveBeenCalled()
  })

  it('inserts for the signed-in account and audits without the name', async () => {
    const response = await post({ claimedName: ' 시험 작가 ', artistId, note: '전시 이력 있음' })
    expect(response.status).toBe(201)
    expect(query.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: accountId,
        artist_id: artistId,
        claimed_name: '시험 작가',
        note: '전시 이력 있음',
      })
    )
    const metadata = jest.mocked(auditTrail.trackDataChange).mock.calls[0][5]
    expect(JSON.stringify(metadata)).not.toContain('시험 작가')
  })

  it('accepts an unlisted claim without looking up any artist row', async () => {
    expect((await post({ claimedName: '목록에 없음' })).status).toBe(201)
    expect(query.maybeSingle).not.toHaveBeenCalled()
    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({ artist_id: null }))
  })

  it('409 when a request is already pending (unique index)', async () => {
    query.single.mockResolvedValueOnce({ data: null, error: { code: '23505' } })
    const response = await post({ claimedName: '작가' })
    expect(response.status).toBe(409)
    expect((await response.json()).code).toBe('CLAIM_PENDING')
  })
})

describe('DELETE /api/profile/artist-claims/[id]', () => {
  it('400 on a malformed id', async () => {
    expect((await withdraw('not-a-uuid')).status).toBe(400)
  })

  it('withdraws only this account’s pending request', async () => {
    query.maybeSingle.mockResolvedValueOnce({
      data: { ...claim, status: 'withdrawn' },
      error: null,
    })
    expect((await withdraw()).status).toBe(200)
    expect(query.update).toHaveBeenCalledWith({ status: 'withdrawn' })
    expect(calls).toContainEqual(['eq', ['account_id', accountId]])
    expect(calls).toContainEqual(['eq', ['status', 'pending']])
  })

  it('404 when nothing pending matched', async () => {
    query.maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    expect((await withdraw()).status).toBe(404)
  })
})

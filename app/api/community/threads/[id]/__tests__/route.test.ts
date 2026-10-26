/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditTrail } from '@/lib/audit/audit-trail'
import { DELETE, PATCH } from '../route'

jest.mock('server-only', () => ({}))
jest.mock('@/lib/archive/writer', () => ({ archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))
const limiter = jest.fn(async () => null as Response | null)
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: () => limiter() }) }))

const accountId = '11111111-1111-4111-8111-111111111111'
const threadId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
let query: Record<string, jest.Mock>

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  query = {}
  for (const method of ['from', 'update', 'eq', 'is', 'select'])
    query[method] = jest.fn(() => query)
  query.maybeSingle = jest.fn().mockResolvedValue({ data: { id: threadId }, error: null })
  jest.mocked(archiveWriter).mockReturnValue(query as any)
  jest.mocked(getAccount).mockResolvedValue({ id: accountId, displayName: '시험 회원' } as any)
})

const call = (method: 'PATCH' | 'DELETE', body?: unknown, id = threadId) => {
  const request = new NextRequest(`https://asca.example/api/community/threads/${id}`, {
    method,
    headers: { origin: 'https://asca.example' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const context = { params: Promise.resolve({ id }) }
  return method === 'PATCH' ? PATCH(request, context) : DELETE(request, context)
}

const ownVisibleGuards = () => {
  expect(query.eq).toHaveBeenCalledWith('id', threadId)
  expect(query.eq).toHaveBeenCalledWith('author_id', accountId)
  expect(query.is).toHaveBeenCalledWith('hidden_at', null)
  expect(query.is).toHaveBeenCalledWith('deleted_at', null)
}

describe.each(['PATCH', 'DELETE'] as const)('%s /api/community/threads/[id] guards', method => {
  const body = method === 'PATCH' ? { title: '제목', body: '본문' } : undefined

  it('rejects cross-site requests before reading the account', async () => {
    jest.mocked(checkOrigin).mockReturnValue({ ok: false } as any)
    expect((await call(method, body)).status).toBe(403)
    expect(getAccount).not.toHaveBeenCalled()
  })

  it('requires sign-in, a valid id and respects the rate limit', async () => {
    jest.mocked(getAccount).mockResolvedValueOnce(null)
    expect((await call(method, body)).status).toBe(401)
    expect((await call(method, body, 'nope')).status).toBe(400)
    limiter.mockResolvedValueOnce(new Response(null, { status: 429 }))
    expect((await call(method, body)).status).toBe(429)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('answers 404 for someone else’s, hidden or deleted thread', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null })
    const response = await call(method, body)
    expect(response.status).toBe(404)
    expect((await response.json()).code).toBe('THREAD_NOT_FOUND')
    expect(auditTrail.trackDataChange).not.toHaveBeenCalled()
  })

  it('fails closed on a database error', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: { message: 'boom' } })
    expect((await call(method, body)).status).toBe(500)
  })
})

describe('PATCH /api/community/threads/[id]', () => {
  it('validates fields', async () => {
    const response = await call('PATCH', { title: ' ', body: '본문' })
    expect(response.status).toBe(400)
    expect((await response.json()).code).toBe('INVALID_THREAD_FIELDS')
  })

  it('updates only title and body of my own visible thread, trimmed', async () => {
    const response = await call('PATCH', {
      title: ' 고친 제목 ',
      body: ' 고친 본문 ',
      author_id: '99999999-9999-4999-8999-999999999999',
      hidden_at: null,
    })
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(query.update).toHaveBeenCalledWith({ title: '고친 제목', body: '고친 본문' })
    ownVisibleGuards()
    expect(auditTrail.trackDataChange).toHaveBeenCalledWith(
      accountId,
      'update',
      'community_thread',
      threadId,
      undefined,
      undefined
    )
  })
})

describe('DELETE /api/community/threads/[id]', () => {
  it('soft-deletes my own visible thread', async () => {
    const response = await call('DELETE')
    expect(response.status).toBe(200)
    expect(query.update).toHaveBeenCalledWith({ deleted_at: expect.any(String) })
    ownVisibleGuards()
    expect(auditTrail.trackDataChange).toHaveBeenCalledWith(
      accountId,
      'delete',
      'community_thread',
      threadId,
      undefined,
      undefined
    )
  })
})

/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditTrail } from '@/lib/audit/audit-trail'
import { POST } from '../route'

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
  for (const method of ['from', 'insert', 'select']) query[method] = jest.fn(() => query)
  query.single = jest.fn().mockResolvedValue({ data: { id: threadId }, error: null })
  jest.mocked(archiveWriter).mockReturnValue(query as any)
})

const signIn = (overrides: Record<string, unknown> = {}) =>
  jest.mocked(getAccount).mockResolvedValue({
    id: accountId,
    email: 'member@example.test',
    displayName: '시험 회원',
    role: 'member',
    artistIds: [],
    ...overrides,
  } as any)

const create = (body: unknown) =>
  POST(
    new NextRequest('https://asca.example/api/community/threads', {
      method: 'POST',
      headers: { origin: 'https://asca.example' },
      body: JSON.stringify(body),
    })
  )

describe('POST /api/community/threads', () => {
  it('rejects cross-site requests before anything else', async () => {
    jest.mocked(checkOrigin).mockReturnValue({ ok: false } as any)
    expect((await create({ title: 't', body: 'b' })).status).toBe(403)
    expect(getAccount).not.toHaveBeenCalled()
  })

  it('requires a signed-in member', async () => {
    jest.mocked(getAccount).mockResolvedValue(null)
    expect((await create({ title: 't', body: 'b' })).status).toBe(401)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('validates title and body', async () => {
    signIn()
    const response = await create({ title: ' ', body: 'b' })
    expect(response.status).toBe(400)
    expect((await response.json()).code).toBe('INVALID_THREAD_FIELDS')
  })

  it('asks for a display name before posting publicly', async () => {
    signIn({ displayName: '  ' })
    const response = await create({ title: '제목', body: '본문' })
    expect(response.status).toBe(409)
    expect((await response.json()).code).toBe('DISPLAY_NAME_REQUIRED')
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('honours the rate limit', async () => {
    signIn()
    limiter.mockResolvedValueOnce(new Response(null, { status: 429 }))
    expect((await create({ title: '제목', body: '본문' })).status).toBe(429)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('stores the post under the signed-in account only, trimmed', async () => {
    signIn()
    const response = await create({
      title: ' 제목 ',
      body: ' 본문 ',
      author_id: '99999999-9999-4999-8999-999999999999',
    })
    expect(response.status).toBe(201)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect((await response.json()).data).toEqual({ id: threadId })
    expect(query.from).toHaveBeenCalledWith('community_threads')
    expect(query.insert).toHaveBeenCalledWith({ author_id: accountId, title: '제목', body: '본문' })
    expect(auditTrail.trackDataChange).toHaveBeenCalledWith(
      accountId,
      'create',
      'community_thread',
      threadId,
      undefined,
      undefined
    )
  })

  it('fails closed on a database error', async () => {
    signIn()
    query.single.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const response = await create({ title: '제목', body: '본문' })
    expect(response.status).toBe(500)
    expect((await response.json()).code).toBe('COMMUNITY_UNAVAILABLE')
  })
})

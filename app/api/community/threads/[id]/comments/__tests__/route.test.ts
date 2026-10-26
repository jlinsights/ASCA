/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditTrail } from '@/lib/audit/audit-trail'
import { isOpenThread } from '@/lib/community/feed'
import { POST } from '../route'

jest.mock('server-only', () => ({}))
jest.mock('@/lib/archive/writer', () => ({ archiveWriter: jest.fn() }))
jest.mock('@/lib/community/feed', () => ({ isOpenThread: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))
const limiter = jest.fn(async () => null as Response | null)
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: () => limiter() }) }))

const accountId = '11111111-1111-4111-8111-111111111111'
const threadId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const commentId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
let query: Record<string, jest.Mock>

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(isOpenThread).mockResolvedValue(true)
  query = {}
  for (const method of ['from', 'insert', 'select']) query[method] = jest.fn(() => query)
  query.single = jest.fn().mockResolvedValue({ data: { id: commentId }, error: null })
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

const comment = (body: unknown, id = threadId) =>
  POST(
    new NextRequest(`https://asca.example/api/community/threads/${id}/comments`, {
      method: 'POST',
      headers: { origin: 'https://asca.example' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  )

describe('POST /api/community/threads/[id]/comments', () => {
  it('rejects cross-site requests before anything else', async () => {
    jest.mocked(checkOrigin).mockReturnValue({ ok: false } as any)
    expect((await comment({ body: 'b' })).status).toBe(403)
    expect(getAccount).not.toHaveBeenCalled()
  })

  it('requires a signed-in member', async () => {
    jest.mocked(getAccount).mockResolvedValue(null)
    expect((await comment({ body: 'b' })).status).toBe(401)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('validates the thread id and the body', async () => {
    signIn()
    expect((await comment({ body: 'b' }, 'not-a-uuid')).status).toBe(400)
    const empty = await comment({ body: '   ' })
    expect(empty.status).toBe(400)
    expect((await empty.json()).code).toBe('INVALID_COMMENT_FIELDS')
    expect((await comment({ body: 'x'.repeat(2001) })).status).toBe(400)
  })

  it('asks for a display name before commenting publicly', async () => {
    signIn({ displayName: ' ' })
    const response = await comment({ body: '댓글' })
    expect(response.status).toBe(409)
    expect((await response.json()).code).toBe('DISPLAY_NAME_REQUIRED')
  })

  it('honours the rate limit', async () => {
    signIn()
    limiter.mockResolvedValueOnce(new Response(null, { status: 429 }))
    expect((await comment({ body: '댓글' })).status).toBe(429)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('refuses hidden, deleted or missing threads', async () => {
    signIn()
    jest.mocked(isOpenThread).mockResolvedValue(false)
    const response = await comment({ body: '댓글' })
    expect(response.status).toBe(404)
    expect((await response.json()).code).toBe('THREAD_NOT_FOUND')
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('stores the comment under the signed-in account only, trimmed, without logging the body', async () => {
    signIn()
    const response = await comment({
      body: ' 좋은 글입니다 ',
      author_id: '99999999-9999-4999-8999-999999999999',
    })
    expect(response.status).toBe(201)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect((await response.json()).data).toEqual({ id: commentId })
    expect(query.from).toHaveBeenCalledWith('community_comments')
    expect(query.insert).toHaveBeenCalledWith({
      thread_id: threadId,
      author_id: accountId,
      body: '좋은 글입니다',
    })
    expect(auditTrail.trackDataChange).toHaveBeenCalledWith(
      accountId,
      'create',
      'community_comment',
      commentId,
      undefined,
      { thread_id: threadId }
    )
  })

  it('fails closed on a database error', async () => {
    signIn()
    query.single.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const response = await comment({ body: '댓글' })
    expect(response.status).toBe(500)
    expect((await response.json()).code).toBe('COMMUNITY_UNAVAILABLE')
  })
})

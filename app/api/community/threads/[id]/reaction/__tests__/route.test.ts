/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { getReactions, isOpenThread } from '@/lib/community/feed'
import { POST } from '../route'

jest.mock('server-only', () => ({}))
jest.mock('@/lib/archive/writer', () => ({ archiveWriter: jest.fn() }))
jest.mock('@/lib/community/feed', () => ({ isOpenThread: jest.fn(), getReactions: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
const limiter = jest.fn(async () => null as Response | null)
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: () => limiter() }) }))

const accountId = '11111111-1111-4111-8111-111111111111'
const threadId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
let query: Record<string, jest.Mock>

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(isOpenThread).mockResolvedValue(true)
  jest.mocked(getReactions).mockResolvedValue({ count: 3, liked: true })
  query = {}
  for (const method of ['from', 'delete', 'eq']) query[method] = jest.fn(() => query)
  query.upsert = jest.fn().mockResolvedValue({ error: null })
  // delete().eq().eq() 의 끝을 await 하면 결과가 나온다
  query.then = jest.fn((resolve: (v: unknown) => unknown) => resolve({ error: null }))
  jest.mocked(archiveWriter).mockReturnValue(query as any)
  jest.mocked(getAccount).mockResolvedValue({ id: accountId, displayName: '' } as any)
})

const react = (body: unknown, id = threadId) =>
  POST(
    new NextRequest(`https://asca.example/api/community/threads/${id}/reaction`, {
      method: 'POST',
      headers: { origin: 'https://asca.example' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  )

describe('POST /api/community/threads/[id]/reaction', () => {
  it('rejects cross-site requests and anonymous visitors', async () => {
    jest.mocked(checkOrigin).mockReturnValueOnce({ ok: false } as any)
    expect((await react({ liked: true })).status).toBe(403)
    jest.mocked(getAccount).mockResolvedValueOnce(null)
    expect((await react({ liked: true })).status).toBe(401)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('validates the id and the desired state', async () => {
    expect((await react({ liked: true }, 'nope')).status).toBe(400)
    const bad = await react({ liked: 'yes' })
    expect(bad.status).toBe(400)
    expect((await bad.json()).code).toBe('INVALID_REACTION')
  })

  it('refuses hidden, deleted or missing threads', async () => {
    jest.mocked(isOpenThread).mockResolvedValue(false)
    expect((await react({ liked: true })).status).toBe(404)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('likes idempotently without needing a display name, and returns the new state', async () => {
    const response = await react({ liked: true })
    expect(response.status).toBe(200)
    expect(query.from).toHaveBeenCalledWith('community_reactions')
    expect(query.upsert).toHaveBeenCalledWith(
      { thread_id: threadId, account_id: accountId },
      { onConflict: 'thread_id,account_id', ignoreDuplicates: true }
    )
    expect((await response.json()).data).toEqual({ count: 3, liked: true })
    expect(getReactions).toHaveBeenCalledWith(threadId, accountId)
  })

  it('unlikes only the caller’s own reaction', async () => {
    jest.mocked(getReactions).mockResolvedValue({ count: 2, liked: false })
    const response = await react({ liked: false })
    expect(response.status).toBe(200)
    expect(query.delete).toHaveBeenCalled()
    expect(query.eq).toHaveBeenCalledWith('thread_id', threadId)
    expect(query.eq).toHaveBeenCalledWith('account_id', accountId)
    expect(query.upsert).not.toHaveBeenCalled()
  })

  it('honours the rate limit and fails closed on database errors', async () => {
    limiter.mockResolvedValueOnce(new Response(null, { status: 429 }))
    expect((await react({ liked: true })).status).toBe(429)
    query.upsert.mockResolvedValue({ error: { message: 'boom' } })
    expect((await react({ liked: true })).status).toBe(500)
  })
})

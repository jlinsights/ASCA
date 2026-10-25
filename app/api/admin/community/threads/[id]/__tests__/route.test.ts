/** @jest-environment node */
import { NextRequest } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { POST } from '../route'

jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: async () => null }) }))

const threadId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const admin = { userId: '22222222-2222-4222-8222-222222222222', admin: true }
let calls: [string, unknown[]][]
let query: Record<string, jest.Mock>

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(archiveIdentity).mockResolvedValue(admin)
  calls = []
  query = {}
  for (const method of ['from', 'update', 'eq', 'is', 'not', 'select']) {
    query[method] = jest.fn((...args: unknown[]) => {
      calls.push([method, args])
      return query
    })
  }
  query.maybeSingle = jest.fn().mockResolvedValue({ data: { id: threadId }, error: null })
  jest.mocked(archiveWriter).mockReturnValue(query as any)
})

const moderate = (body: unknown, id = threadId) =>
  POST(
    new NextRequest(`https://asca.example/api/admin/community/threads/${id}`, {
      method: 'POST',
      headers: { origin: 'https://asca.example' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  )

describe('POST /api/admin/community/threads/[id]', () => {
  it('is for admins with a verified second factor only', async () => {
    jest.mocked(archiveIdentity).mockResolvedValue(null)
    expect((await moderate({ action: 'hide' })).status).toBe(401)
    jest.mocked(archiveIdentity).mockResolvedValue({ userId: admin.userId, admin: false })
    expect((await moderate({ action: 'hide' })).status).toBe(403)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('rejects a bad id or action', async () => {
    expect((await moderate({ action: 'hide' }, 'nope')).status).toBe(400)
    expect((await moderate({ action: 'delete' })).status).toBe(400)
  })

  it('hides a visible post and records who hid it and why', async () => {
    const response = await moderate({ action: 'hide', reason: '광고' })
    expect(response.status).toBe(200)
    const update = calls.find(([method]) => method === 'update')?.[1][0] as Record<string, unknown>
    expect(update).toMatchObject({ hidden_by: admin.userId, hidden_reason: '광고' })
    expect(typeof update.hidden_at).toBe('string')
    expect(calls).toContainEqual(['eq', ['id', threadId]])
    expect(calls).toContainEqual(['is', ['hidden_at', null]])
    expect(calls).toContainEqual(['is', ['deleted_at', null]])
  })

  it('restores a hidden post and clears the moderation fields', async () => {
    const response = await moderate({ action: 'restore' })
    expect(response.status).toBe(200)
    expect(calls).toContainEqual([
      'update',
      [{ hidden_at: null, hidden_by: null, hidden_reason: null }],
    ])
    expect(calls).toContainEqual(['not', ['hidden_at', 'is', null]])
  })

  it('reports a post that is missing or already in that state', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null })
    const response = await moderate({ action: 'hide' })
    expect(response.status).toBe(409)
    expect((await response.json()).code).toBe('THREAD_STATE_CHANGED')
  })
})

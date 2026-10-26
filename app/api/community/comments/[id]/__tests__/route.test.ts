/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditTrail } from '@/lib/audit/audit-trail'
import { DELETE } from '../route'

jest.mock('server-only', () => ({}))
jest.mock('@/lib/archive/writer', () => ({ archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))
const limiter = jest.fn(async () => null as Response | null)
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: () => limiter() }) }))

const accountId = '11111111-1111-4111-8111-111111111111'
const commentId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
let query: Record<string, jest.Mock>

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  query = {}
  for (const method of ['from', 'update', 'eq', 'is', 'select'])
    query[method] = jest.fn(() => query)
  query.maybeSingle = jest.fn().mockResolvedValue({ data: { id: commentId }, error: null })
  jest.mocked(archiveWriter).mockReturnValue(query as any)
  jest.mocked(getAccount).mockResolvedValue({ id: accountId, displayName: '시험 회원' } as any)
})

const remove = (id = commentId) =>
  DELETE(
    new NextRequest(`https://asca.example/api/community/comments/${id}`, {
      method: 'DELETE',
      headers: { origin: 'https://asca.example' },
    }),
    { params: Promise.resolve({ id }) }
  )

describe('DELETE /api/community/comments/[id]', () => {
  it('rejects cross-site requests', async () => {
    jest.mocked(checkOrigin).mockReturnValue({ ok: false } as any)
    expect((await remove()).status).toBe(403)
    expect(getAccount).not.toHaveBeenCalled()
  })

  it('requires a signed-in member and a valid id', async () => {
    jest.mocked(getAccount).mockResolvedValueOnce(null)
    expect((await remove()).status).toBe(401)
    expect((await remove('nope')).status).toBe(400)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('soft-deletes only the caller’s own, still-visible comment', async () => {
    const response = await remove()
    expect(response.status).toBe(200)
    expect(query.from).toHaveBeenCalledWith('community_comments')
    expect(query.update).toHaveBeenCalledWith({ deleted_at: expect.any(String) })
    expect(query.eq).toHaveBeenCalledWith('id', commentId)
    expect(query.eq).toHaveBeenCalledWith('author_id', accountId)
    expect(query.is).toHaveBeenCalledWith('deleted_at', null)
    expect(auditTrail.trackDataChange).toHaveBeenCalledWith(
      accountId,
      'delete',
      'community_comment',
      commentId,
      undefined,
      undefined
    )
  })

  it('answers 404 for someone else’s or an already deleted comment', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null })
    const response = await remove()
    expect(response.status).toBe(404)
    expect((await response.json()).code).toBe('COMMENT_NOT_FOUND')
    expect(auditTrail.trackDataChange).not.toHaveBeenCalled()
  })

  it('fails closed on a database error', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: { message: 'boom' } })
    expect((await remove()).status).toBe(500)
  })
})

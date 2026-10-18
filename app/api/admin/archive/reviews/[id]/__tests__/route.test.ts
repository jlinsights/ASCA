/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../route'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { executeReview } from '@/lib/archive/review-service'
import { checkOrigin } from '@/lib/security/origin-check'
jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/archive/review-service', () => ({ executeReview: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn(() => ({ ok: true })) }))
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: async () => null }) }))
jest.mock('@/lib/security/security-middleware', () => ({
  sanitizeInput: (x: unknown) => x,
  SecurityMiddleware: { validateOperation: async () => ({ isValid: true }) },
}))
jest.mock('@/lib/audit/audit-trail', () => ({
  auditTrail: { trackAccess: jest.fn(), trackDataChange: jest.fn() },
}))
const id = 'c497df6b-4907-4fb0-811b-eedfa050fb77'
const rpc = jest.fn()
const operation = {
  cleanup_paths: [],
  id,
  artwork_id: id,
  action: 'publish' as const,
  state: 'completed' as const,
  reason: '',
  lease_token: id,
  images: [],
}
const context = { params: Promise.resolve({ id }) }
const request = (changes = {}) =>
  new NextRequest('http://localhost/api/admin/archive/reviews/' + id, {
    method: 'POST',
    body: JSON.stringify({
      operationId: id,
      action: 'publish',
      reason: '',
      expectedUpdatedAt: null,
      ...changes,
    }),
  })
beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(archiveIdentity).mockResolvedValue({ userId: 'admin', admin: true })
  jest.mocked(archiveWriter).mockReturnValue({ rpc } as never)
  rpc.mockResolvedValue({ error: null, data: operation })
  jest.mocked(executeReview).mockResolvedValue(operation)
})
it('denies cross-origin, anonymous and non-admin callers before database or storage', async () => {
  jest.mocked(checkOrigin).mockReturnValue({ ok: false })
  expect((await POST(request(), context)).status).toBe(403)
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(archiveIdentity).mockResolvedValue(null)
  expect((await POST(request(), context)).status).toBe(401)
  jest.mocked(archiveIdentity).mockResolvedValue({ userId: 'artist', admin: false })
  expect((await POST(request(), context)).status).toBe(403)
  expect(rpc).not.toHaveBeenCalled()
  expect(executeReview).not.toHaveBeenCalled()
})
it('requires return/unpublish reasons and rejects forged verification or file keys', async () => {
  for (const changes of [
    { action: 'return' },
    { action: 'unpublish' },
    { is_asca_verified: true },
    { original_path: 'x' },
  ])
    expect((await POST(request(changes), context)).status).toBe(400)
  expect(rpc).not.toHaveBeenCalled()
})
it('returns only an operation receipt and uses server identity', async () => {
  const response = await POST(request(), context)
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ id, state: 'completed' })
  expect(rpc).toHaveBeenCalledWith(
    'prepare_archive_review',
    expect.objectContaining({ p_reviewer_id: 'admin' })
  )
})
it('reports conflicts without starting storage work', async () => {
  rpc.mockResolvedValue({ error: { message: 'BUSY' } })
  expect((await POST(request(), context)).status).toBe(409)
  expect(executeReview).not.toHaveBeenCalled()
})

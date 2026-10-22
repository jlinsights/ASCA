/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../route'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { archiveReader } from '@/lib/archive/queries'
import { checkOrigin } from '@/lib/security/origin-check'
jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/archive/queries', () => ({ archiveReader: jest.fn() }))
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
const upsert = jest.fn(),
  remove = jest.fn(),
  from = jest.fn()
let isPublic = true
const context = { params: Promise.resolve({ id }) }
const request = (changes = {}) =>
  new NextRequest('http://localhost/api/admin/archive/exhibitions/' + id, {
    method: 'POST',
    body: JSON.stringify({ artworkId: id, link: true, ...changes }),
  })
beforeEach(() => {
  jest.clearAllMocks()
  isPublic = true
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(archiveIdentity).mockResolvedValue({ userId: 'admin', admin: true })
  const parent = { eq: () => parent, maybeSingle: async () => ({ data: { id }, error: null }) }
  const deletion = {
    eq: () => deletion,
    then: (resolve: (x: unknown) => unknown) => resolve({ error: null }),
  }
  from.mockImplementation((table: string) =>
    table === 'exhibitions' ? { select: () => parent } : { upsert, delete: remove }
  )
  upsert.mockResolvedValue({ error: null })
  remove.mockReturnValue(deletion)
  jest.mocked(archiveWriter).mockReturnValue({ from } as never)
  const work = {
    eq: () => work,
    maybeSingle: async () => ({ data: isPublic ? { id } : null, error: null }),
  }
  jest.mocked(archiveReader).mockReturnValue({ from: () => ({ select: () => work }) } as never)
})
it('denies anonymous, non-admin and cross-origin mutations', async () => {
  jest.mocked(checkOrigin).mockReturnValue({ ok: false })
  expect((await POST(request(), context)).status).toBe(403)
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(archiveIdentity).mockResolvedValue(null)
  expect((await POST(request(), context)).status).toBe(401)
  jest.mocked(archiveIdentity).mockResolvedValue({ userId: 'artist', admin: false })
  expect((await POST(request(), context)).status).toBe(403)
  expect(from).not.toHaveBeenCalled()
})
it('cannot link draft or hidden-artist works rejected by public RLS', async () => {
  isPublic = false
  expect((await POST(request(), context)).status).toBe(409)
  expect(upsert).not.toHaveBeenCalled()
})
it('links only IDs idempotently without overwriting exhibition notes or artwork metadata', async () => {
  expect((await POST(request(), context)).status).toBe(200)
  expect(upsert).toHaveBeenCalledWith(
    { exhibition_id: id, artwork_id: id },
    { onConflict: 'exhibition_id,artwork_id', ignoreDuplicates: true }
  )
  expect((await POST(request({ title: 'forged copy' }), context)).status).toBe(400)
})
it('can unlink a now-private artwork without modifying its source', async () => {
  isPublic = false
  expect((await POST(request({ link: false }), context)).status).toBe(200)
  expect(archiveReader).not.toHaveBeenCalled()
  expect(remove).toHaveBeenCalled()
  expect(upsert).not.toHaveBeenCalled()
})

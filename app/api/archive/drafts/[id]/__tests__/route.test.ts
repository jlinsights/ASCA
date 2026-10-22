/** @jest-environment node */
import { NextRequest } from 'next/server'
import { PATCH } from '../route'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { ownedWorks } from '@/lib/archive/owned'
import { checkOrigin } from '@/lib/security/origin-check'
jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/archive/owned', () => ({ ownedWorks: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn(() => ({ ok: true })) }))
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: async () => null }) }))
jest.mock('@/lib/security/security-middleware', () => ({ sanitizeInput: (x: unknown) => x }))
jest.mock('@/lib/audit/audit-trail', () => ({
  auditTrail: { trackAccess: jest.fn(), trackDataChange: jest.fn() },
}))
const id = 'c497df6b-4907-4fb0-811b-eedfa050fb77'
const revision = '2026-10-18T00:00:00+00:00'
const input = {
  title: '작품',
  titleHanja: '',
  titleEn: '',
  style: '해서',
  width: 35,
  height: 135,
  year: 2024,
  materials: '먹',
  transcription: '',
  interpretation: '',
  interpretationEn: '',
  source: '',
  seal: '',
  status: 'draft',
  expectedUpdatedAt: revision,
}
let work: { artist_id: string; status: string } | null
let saved: { id: string; status: string } | null
const update = jest.fn()
const eq = jest.fn()
beforeEach(() => {
  jest.clearAllMocks()
  work = { artist_id: id, status: 'draft' }
  saved = { id, status: 'draft' }
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(archiveIdentity).mockResolvedValue({ userId: 'owner', admin: false })
  jest
    .mocked(ownedWorks)
    .mockImplementation(
      () => ({ eq: () => ({ maybeSingle: async () => ({ data: work, error: null }) }) }) as never
    )
  const chain = {
    eq,
    is: eq,
    select: () => ({ maybeSingle: async () => ({ data: saved, error: null }) }),
  }
  eq.mockReturnValue(chain)
  update.mockReturnValue(chain)
  jest.mocked(archiveWriter).mockReturnValue({ from: () => ({ update }) } as never)
})
const request = (change = {}) =>
  new NextRequest('http://localhost/api/archive/drafts/' + id, {
    method: 'PATCH',
    body: JSON.stringify({ ...input, ...change }),
  })
const context = { params: Promise.resolve({ id }) }
it('rejects anonymous and cross-origin writes', async () => {
  jest.mocked(checkOrigin).mockReturnValue({ ok: false })
  expect((await PATCH(request(), context)).status).toBe(403)
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(archiveIdentity).mockResolvedValue(null)
  expect((await PATCH(request(), context)).status).toBe(401)
  expect(update).not.toHaveBeenCalled()
})
it('hides works not owned by this user, including from admins in the personal workspace', async () => {
  work = null
  jest.mocked(archiveIdentity).mockResolvedValue({ userId: 'other', admin: true })
  expect((await PATCH(request(), context)).status).toBe(404)
  expect(ownedWorks).toHaveBeenCalledWith('other')
  expect(update).not.toHaveBeenCalled()
})
it('rejects publication, forged ownership, paths and verification', async () => {
  for (const change of [
    { status: 'published' },
    { artistId: id },
    { original_path: 'x' },
    { is_asca_verified: true },
  ])
    expect((await PATCH(request(change), context)).status).toBe(400)
  expect(update).not.toHaveBeenCalled()
})
it('locks pending and published works', async () => {
  for (const status of ['pending_review', 'published']) {
    work!.status = status
    expect((await PATCH(request(), context)).status).toBe(409)
  }
  expect(update).not.toHaveBeenCalled()
})
it('updates metadata with atomic status and revision guards and can request review', async () => {
  saved = { id, status: 'pending_review' }
  const response = await PATCH(request({ status: 'pending_review' }), context)
  expect(response.status).toBe(200)
  expect(eq).toHaveBeenCalledWith('status', 'draft')
  expect(eq).toHaveBeenCalledWith('updated_at', revision)
  expect(update).toHaveBeenCalledWith(
    expect.objectContaining({ status: 'pending_review', title: '작품' })
  )
  expect(update.mock.calls[0]![0]).not.toHaveProperty('artist_id')
  expect(await response.json()).toEqual(saved)
})
it('rejects stale revisions without overwriting', async () => {
  saved = null
  expect((await PATCH(request(), context)).status).toBe(409)
})

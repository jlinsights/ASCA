/** @jest-environment node */
import { NextRequest } from 'next/server'
import sharp from 'sharp'
import { POST } from '../route'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn(() => ({ ok: true })) }))
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: async () => null }) }))
jest.mock('@/lib/audit/audit-trail', () => ({
  auditTrail: { trackAccess: jest.fn(), trackDataChange: jest.fn() },
}))
jest.mock('@/lib/security/security-middleware', () => ({
  sanitizeInput: (value: unknown) => value,
  SecurityMiddleware: { validateOperation: async () => ({ isValid: true }) },
}))
const artistId = 'c497df6b-4907-4fb0-811b-eedfa050fb77'
const valid = {
  artistId,
  title: 'UI integration fixture',
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
  recordTitle: '',
  organizer: '',
  contestRef: '',
  status: 'pending_review',
}
let inserts: Record<string, unknown>[][] = []
let owner: string | null = 'user_a'
let failImage = false
let deleted: string[] = []
let cleanupRecordFails = false
const buckets: string[] = []
let publicBucket = false
const upload = jest.fn(async () => ({ error: null }))
const remove = jest.fn(async () => ({ error: null }))
function db() {
  return {
    storage: {
      getBucket: async () => ({ data: { public: publicBucket }, error: null }),
      from: (bucket: string) => {
        buckets.push(bucket)
        return { upload, remove }
      },
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { id: artistId, claimed_by_user_id: owner },
            error: null,
          }),
        }),
      }),
      insert: async (row: Record<string, unknown> | Record<string, unknown>[]) => {
        inserts.push(Array.isArray(row) ? row : [row])
        return {
          error: table === 'artwork_images' && failImage ? new Error('image insert failed') : null,
        }
      },
      delete: () => ({
        eq: async () => {
          deleted.push(table)
          return {
            error:
              table === 'artist_records' && cleanupRecordFails ? new Error('cleanup failed') : null,
          }
        },
      }),
    }),
  }
}
async function request(change: Record<string, unknown> = {}, badFile = false) {
  const bytes = badFile
    ? Buffer.from('not an image')
    : await sharp({ create: { width: 16, height: 32, channels: 3, background: '#ffffff' } })
        .png()
        .toBuffer()
  const form = new FormData()
  form.set('data', JSON.stringify({ ...valid, ...change }))
  form.set('images', new File([new Uint8Array(bytes)], 'test.png', { type: 'image/png' }))
  return new NextRequest('http://localhost/api/archive/submissions', {
    method: 'POST',
    headers: { origin: 'http://localhost', 'content-length': '2048' },
    body: form,
  })
}
beforeEach(() => {
  jest.clearAllMocks()
  inserts = []
  deleted = []
  cleanupRecordFails = false
  publicBucket = false
  buckets.length = 0
  owner = 'user_a'
  failImage = false
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(archiveIdentity).mockResolvedValue({ userId: 'user_a', admin: false })
  jest.mocked(archiveWriter).mockReturnValue(db() as unknown as ReturnType<typeof archiveWriter>)
})
it('rejects cross-origin and anonymous writes before storage', async () => {
  jest.mocked(checkOrigin).mockReturnValue({ ok: false })
  expect((await POST(await request())).status).toBe(403)
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(archiveIdentity).mockResolvedValue(null)
  expect((await POST(await request())).status).toBe(401)
  expect(upload).not.toHaveBeenCalled()
})
it('rejects another artist and unclaimed profiles', async () => {
  for (const deniedOwner of ['user_b', null]) {
    owner = deniedOwner
    expect((await POST(await request())).status).toBe(403)
  }
  expect(upload).not.toHaveBeenCalled()
})
it('cannot publish or forge verification', async () => {
  for (const change of [
    { status: 'published' },
    { is_asca_verified: true },
    { created_by: 'admin' },
  ])
    expect((await POST(await request(change))).status).toBe(400)
  expect(upload).not.toHaveBeenCalled()
})
it('creates only private originals/derivatives and an unverified review request', async () => {
  const response = await POST(await request({ recordTitle: 'Exhibition' }))
  expect(response.status).toBe(201)
  expect(upload).toHaveBeenCalledTimes(3)
  expect(buckets.every(bucket => bucket === 'archive-private')).toBe(true)
  expect(inserts[0]?.[0]).toMatchObject({
    artist_id: artistId,
    status: 'pending_review',
    created_by: 'artist',
    images: [],
  })
  expect(inserts[2]?.[0]).toMatchObject({ is_asca_verified: false, source: 'self_reported' })
  const json = await response.json()
  expect(Object.keys(json).sort()).toEqual(['id', 'status'])
})
it('removes newly created objects and rows when metadata save fails', async () => {
  failImage = true
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
  expect((await POST(await request())).status).toBe(500)
  expect(remove).toHaveBeenCalledTimes(1)
  expect(deleted).toEqual(['artist_records', 'artworks'])
  spy.mockRestore()
})
it('rejects forged image bytes before writing anything', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
  expect((await POST(await request({}, true))).status).toBe(500)
  expect(upload).not.toHaveBeenCalled()
  spy.mockRestore()
})

it('keeps the unpublished parent when record cleanup fails', async () => {
  failImage = true
  cleanupRecordFails = true
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
  expect((await POST(await request())).status).toBe(500)
  expect(deleted).toEqual(['artist_records'])
  spy.mockRestore()
})

it('refuses a public upload target even with service credentials', async () => {
  publicBucket = true
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
  expect((await POST(await request())).status).toBe(500)
  expect(upload).not.toHaveBeenCalled()
  spy.mockRestore()
})

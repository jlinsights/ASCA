/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { ImageRejected, processImage } from '@/lib/community/images'
import { sweepAfterResponse } from '@/lib/community/image-sweep'
import { POST } from '../route'
import { GET } from '../[id]/route'

jest.mock('server-only', () => ({}))
jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
const limiter = jest.fn(async () => null as Response | null)
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: () => limiter() }) }))
jest.mock('@/lib/community/image-sweep', () => ({ sweepAfterResponse: jest.fn() }))
jest.mock('@/lib/community/images', () => {
  const actual = jest.requireActual('@/lib/community/images')
  return { ...actual, processImage: jest.fn() }
})

const accountId = '11111111-1111-4111-8111-111111111111'
const imageId = 'aaaaaaaa-0000-4000-8000-000000000001'
const process = jest.mocked(processImage)

let query: Record<string, jest.Mock>
let bucket: Record<string, jest.Mock>
let pendingCount: number
beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(getAccount).mockResolvedValue({ id: accountId, displayName: '시험 회원' } as any)
  jest.mocked(archiveIdentity).mockResolvedValue({ userId: accountId, admin: false } as any)
  pendingCount = 0
  query = {}
  for (const method of ['from', 'select', 'eq', 'insert']) query[method] = jest.fn(() => query)
  query.is = jest.fn(() => query)
  // 대기 사진 수 세기(head) — gte() 가 끝
  query.gte = jest.fn(async () => ({ count: pendingCount, error: null }))
  query.single = jest.fn().mockResolvedValue({ data: { id: imageId }, error: null })
  query.maybeSingle = jest.fn()
  bucket = {
    upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
    remove: jest.fn().mockResolvedValue({ data: [], error: null }),
    download: jest
      .fn()
      .mockResolvedValue({ data: new Blob([new Uint8Array([1, 2, 3])]), error: null }),
  }
  ;(query as any).storage = { from: jest.fn(() => bucket) }
  jest.mocked(archiveWriter).mockReturnValue(query as any)
  process.mockResolvedValue({ data: Buffer.from('webp'), width: 1600, height: 1200 })
})

const upload = (file: Blob | null = new Blob([new Uint8Array(1000)], { type: 'image/jpeg' })) => {
  const form = new FormData()
  if (file) form.append('file', file, 'photo.jpg')
  return POST(
    new NextRequest('https://asca.example/api/community/images', {
      method: 'POST',
      headers: { origin: 'https://asca.example' },
      body: form,
    })
  )
}

describe('POST /api/community/images', () => {
  it('rejects cross-site requests and visitors without touching storage', async () => {
    jest.mocked(checkOrigin).mockReturnValueOnce({ ok: false } as any)
    expect((await upload()).status).toBe(403)
    jest.mocked(getAccount).mockResolvedValueOnce(null)
    expect((await upload()).status).toBe(401)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('asks for a display name first and honours the rate limit', async () => {
    jest.mocked(getAccount).mockResolvedValueOnce({ id: accountId, displayName: ' ' } as any)
    expect((await upload()).status).toBe(409)
    limiter.mockResolvedValueOnce(new Response(null, { status: 429 }))
    expect((await upload()).status).toBe(429)
    expect(process).not.toHaveBeenCalled()
  })

  it('requires a file and refuses ones over the upload limit', async () => {
    expect((await upload(null)).status).toBe(400)
    const big = new Blob([new Uint8Array(4 * 1024 * 1024 + 1)])
    const response = await upload(big)
    expect(response.status).toBe(413)
    expect((await response.json()).code).toBe('IMAGE_TOO_LARGE')
    expect(process).not.toHaveBeenCalled()
  })

  it('stops someone piling up unused photos', async () => {
    pendingCount = 12
    const response = await upload()
    expect(response.status).toBe(409)
    expect((await response.json()).code).toBe('TOO_MANY_PENDING_IMAGES')
    expect(query.eq).toHaveBeenCalledWith('uploader_id', accountId)
    expect(query.is).toHaveBeenCalledWith('thread_id', null)
    expect(bucket.upload).not.toHaveBeenCalled()
  })

  it('counts only recent unused photos, so old leftovers never lock a member out', async () => {
    const now = Date.parse('2026-10-27T12:00:00Z')
    jest.spyOn(Date, 'now').mockReturnValue(now)
    await upload()
    expect(query.gte).toHaveBeenCalledWith('created_at', '2026-10-26T12:00:00.000Z')
    jest.mocked(Date.now).mockRestore()
  })

  it('answers 415 for files that are not usable images', async () => {
    process.mockRejectedValueOnce(new ImageRejected('format'))
    const response = await upload()
    expect(response.status).toBe(415)
    expect((await response.json()).code).toBe('IMAGE_UNSUPPORTED')
    expect(bucket.upload).not.toHaveBeenCalled()
  })

  it('stores the re-encoded WebP under a random name with no account ID', async () => {
    const response = await upload()
    expect(response.status).toBe(201)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect((await response.json()).data).toEqual({ id: imageId, width: 1600, height: 1200 })
    const [path, data, options] = bucket.upload.mock.calls[0]!
    expect(path).toMatch(/^[0-9a-f-]{36}\.webp$/)
    expect(path).not.toContain(accountId)
    expect(data).toEqual(Buffer.from('webp'))
    expect(options).toEqual({ contentType: 'image/webp', upsert: false })
    expect(query.insert).toHaveBeenCalledWith({
      uploader_id: accountId,
      storage_path: path,
      width: 1600,
      height: 1200,
      byte_size: 4,
    })
    // 버려진 대기 사진 정리는 응답 뒤로 예약한다
    expect(sweepAfterResponse).toHaveBeenCalledWith(query)
  })

  it('removes the stored file when the row cannot be saved', async () => {
    query.single.mockResolvedValueOnce({ data: null, error: { message: 'boom' } })
    expect((await upload()).status).toBe(500)
    expect(bucket.remove).toHaveBeenCalledWith([bucket.upload.mock.calls[0]![0]])
    expect(sweepAfterResponse).not.toHaveBeenCalled()
  })
})

const read = (id = imageId) =>
  GET(new Request(`https://asca.example/api/community/images/${id}`), {
    params: Promise.resolve({ id }),
  })
const row = (thread: { hidden_at: string | null; deleted_at: string | null } | null) =>
  query.maybeSingle.mockResolvedValue({
    data: { storage_path: 'x.webp', uploader_id: accountId, thread },
    error: null,
  })

describe('GET /api/community/images/[id]', () => {
  it('404s for bad IDs and unknown images', async () => {
    expect((await read('nope')).status).toBe(404)
    query.maybeSingle.mockResolvedValue({ data: null, error: null })
    expect((await read()).status).toBe(404)
    expect(bucket.download).not.toHaveBeenCalled()
  })

  it('serves photos of visible threads to anyone, cached briefly in the browser only', async () => {
    row({ hidden_at: null, deleted_at: null })
    const response = await read()
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/webp')
    expect(response.headers.get('cache-control')).toBe('private, max-age=60')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(getAccount).not.toHaveBeenCalled()
    expect(bucket.download).toHaveBeenCalledWith('x.webp')
  })

  it('hides photos of hidden threads from everyone but admins', async () => {
    row({ hidden_at: '2026-10-27T00:00:00Z', deleted_at: null })
    expect((await read()).status).toBe(404)
    jest.mocked(archiveIdentity).mockResolvedValueOnce({ userId: 'x', admin: true } as any)
    const response = await read()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })

  it('never serves photos of deleted threads, not even to admins', async () => {
    row({ hidden_at: null, deleted_at: '2026-10-27T00:00:00Z' })
    jest.mocked(archiveIdentity).mockResolvedValue({ userId: 'x', admin: true } as any)
    expect((await read()).status).toBe(404)
    expect(bucket.download).not.toHaveBeenCalled()
  })

  it('shows an unattached photo only to the person who uploaded it', async () => {
    row(null)
    const mine = await read()
    expect(mine.status).toBe(200)
    expect(mine.headers.get('cache-control')).toBe('private, no-store')
    jest.mocked(getAccount).mockResolvedValueOnce({ id: 'someone-else' } as any)
    expect((await read()).status).toBe(404)
    jest.mocked(getAccount).mockResolvedValueOnce(null)
    expect((await read()).status).toBe(404)
  })
})

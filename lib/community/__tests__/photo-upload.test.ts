import { CLIENT_MAX_EDGE, PhotoUploadError, shrinkPhoto, uploadPhoto } from '../photo-upload'

const fetchMock = jest.fn()
const originalFetch = global.fetch
const json = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body })

let drawn: number[] = []
let blobOut: Blob | null = new Blob(['jpeg'], { type: 'image/jpeg' })
const close = jest.fn()

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
  drawn = []
  blobOut = new Blob(['jpeg'], { type: 'image/jpeg' })
  close.mockReset()
  ;(global as any).createImageBitmap = jest.fn(async () => ({ width: 4800, height: 3600, close }))
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () =>
      ({
        drawImage: (_b: unknown, _x: number, _y: number, w: number, h: number) => (drawn = [w, h]),
      }) as any
  )
  jest.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
    callback: BlobCallback
  ) {
    callback(blobOut)
  })
})
afterAll(() => {
  global.fetch = originalFetch
})

describe('shrinkPhoto', () => {
  it('draws the photo down to the client max edge as JPEG and frees the bitmap', async () => {
    const out = await shrinkPhoto(new Blob(['x']))
    expect(drawn).toEqual([CLIENT_MAX_EDGE, 1800])
    expect(out.type).toBe('image/jpeg')
    expect(close).toHaveBeenCalled()
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.88
    )
  })

  it('reports photos the browser cannot open (e.g. HEIC on Chrome)', async () => {
    ;(global as any).createImageBitmap = jest.fn(async () => {
      throw new Error('decode')
    })
    await expect(shrinkPhoto(new Blob(['x']))).rejects.toMatchObject({ reason: 'unreadable' })
  })

  it('reports a canvas that produced nothing', async () => {
    blobOut = null
    await expect(shrinkPhoto(new Blob(['x']))).rejects.toBeInstanceOf(PhotoUploadError)
    expect(close).toHaveBeenCalled()
  })
})

describe('uploadPhoto', () => {
  it('posts the photo as multipart and returns the stored image', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { id: 'i1', width: 10, height: 8 } }, 201))
    expect(await uploadPhoto(new Blob(['x']))).toEqual({ id: 'i1', width: 10, height: 8 })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/community/images')
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(FormData)
    expect((init.body as FormData).get('file')).toBeInstanceOf(Blob)
  })

  it.each([
    [415, 'IMAGE_UNSUPPORTED', 'unreadable'],
    [413, 'IMAGE_TOO_LARGE', 'tooLarge'],
    [409, 'TOO_MANY_PENDING_IMAGES', 'pending'],
    [409, 'DISPLAY_NAME_REQUIRED', 'needName'],
    [429, undefined, 'rate'],
    [500, 'COMMUNITY_UNAVAILABLE', 'generic'],
  ])('maps %s %s to %s', async (status, code, reason) => {
    fetchMock.mockResolvedValueOnce(json(code ? { code } : {}, status))
    await expect(uploadPhoto(new Blob(['x']))).rejects.toMatchObject({ reason })
  })

  it('treats a network failure as generic', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'))
    await expect(uploadPhoto(new Blob(['x']))).rejects.toMatchObject({ reason: 'generic' })
  })
})

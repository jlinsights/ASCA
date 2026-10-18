/** @jest-environment node */
import { executeReview } from '../review-service'
import type { archiveWriter } from '../writer'
import type { ReviewOperation } from '../review'
jest.mock('server-only', () => ({}), { virtual: true })
jest.mock('../writer', () => ({}))
const id = 'c497df6b-4907-4fb0-811b-eedfa050fb77'
const operation: ReviewOperation = {
  cleanup_paths: [],
  id,
  artwork_id: id,
  action: 'publish',
  state: 'processing',
  reason: '',
  lease_token: id,
  images: [
    {
      id,
      private_thumb: 'private/thumb.webp',
      private_web: 'private/web.webp',
      public_thumb: 'public/thumb.webp',
      public_web: 'public/web.webp',
    },
  ],
}
const upload = jest.fn(),
  download = jest.fn(),
  remove = jest.fn(),
  rpc = jest.fn()
let privateIsPublic = false
const db = {
  storage: {
    getBucket: async (name: string) => ({
      data: { public: name === 'archive-public' || privateIsPublic },
      error: null,
    }),
    from: (bucket: string) => ({
      download: (path: string) => download(bucket, path),
      upload: (path: string, blob: Blob, options: unknown) => upload(bucket, path, blob, options),
      remove: (paths: string[]) => remove(bucket, paths),
    }),
  },
  rpc,
} as unknown as ReturnType<typeof archiveWriter>
beforeEach(() => {
  jest.clearAllMocks()
  privateIsPublic = false
  download.mockResolvedValue({ data: new Blob(['webp']), error: null })
  upload.mockResolvedValue({ error: null })
  remove.mockResolvedValue({ error: null })
  rpc.mockImplementation(async (_name, args) => ({
    error: null,
    data: { ...operation, state: args.p_success ? 'completed' : 'failed' },
  }))
})
it('copies only private derivatives and finalizes after both copies', async () => {
  await executeReview(db, operation)
  expect(download.mock.calls.map(c => c.slice(0, 2))).toEqual([
    ['archive-private', 'private/thumb.webp'],
    ['archive-private', 'private/web.webp'],
  ])
  expect(upload).toHaveBeenCalledTimes(2)
  expect(upload.mock.calls[0]?.[3]).toMatchObject({ contentType: 'image/webp', cacheControl: '0' })
  expect(rpc).toHaveBeenLastCalledWith(
    'finish_archive_review',
    expect.objectContaining({ p_success: true })
  )
  expect(upload.mock.invocationCallOrder[1]).toBeLessThan(rpc.mock.invocationCallOrder[0]!)
})
it('removes partial copies before releasing a failed operation for retry', async () => {
  upload
    .mockResolvedValueOnce({ error: null })
    .mockResolvedValueOnce({ error: Error('upload failed') })
  await expect(executeReview(db, operation)).rejects.toThrow('upload failed')
  expect(remove).toHaveBeenCalledWith('archive-public', ['public/thumb.webp'])
  expect(remove.mock.invocationCallOrder[0]).toBeLessThan(rpc.mock.invocationCallOrder[0]!)
  expect(rpc).toHaveBeenLastCalledWith(
    'finish_archive_review',
    expect.objectContaining({ p_success: false })
  )
})
it('never deletes after an ambiguous finalization and recognizes a lost success response', async () => {
  rpc
    .mockResolvedValueOnce({ error: Error('network lost') })
    .mockResolvedValueOnce({ error: null, data: { ...operation, state: 'completed' } })
  expect((await executeReview(db, operation)).state).toBe('completed')
  expect(remove).not.toHaveBeenCalled()
})
it('keeps an unpublish failure recoverable and does not finalize success', async () => {
  remove.mockResolvedValue({ error: Error('delete failed') })
  await expect(executeReview(db, { ...operation, action: 'unpublish' })).rejects.toThrow(
    'delete failed'
  )
  expect(upload).not.toHaveBeenCalled()
  expect(rpc).not.toHaveBeenCalledWith(
    'finish_archive_review',
    expect.objectContaining({ p_success: true })
  )
})
it('requires the original bucket to be private, even with service credentials', async () => {
  privateIsPublic = true
  await expect(executeReview(db, operation)).rejects.toThrow('configuration')
  expect(download).not.toHaveBeenCalled()
  expect(upload).not.toHaveBeenCalled()
})
it('does no storage work for return or an already completed idempotent request', async () => {
  await executeReview(db, { ...operation, action: 'return', images: [] })
  await executeReview(db, { ...operation, state: 'completed' })
  expect(download).not.toHaveBeenCalled()
  expect(upload).not.toHaveBeenCalled()
  expect(remove).not.toHaveBeenCalled()
})

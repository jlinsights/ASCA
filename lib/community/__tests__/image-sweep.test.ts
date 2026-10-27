/** @jest-environment node */
import { PENDING_WINDOW_MS } from '../images'
import { SWEEP_BATCH, sweepExpiredPendingImages } from '../image-sweep'

jest.mock('server-only', () => ({}))

const NOW = Date.parse('2026-10-28T00:00:00Z')
const CUTOFF = new Date(NOW - PENDING_WINDOW_MS).toISOString()

/** 고른 행(select)과 지운 행(delete … select) 결과를 정해 두는 가짜 클라이언트 */
function fakeDb(picked: { id: string }[], removed: { storage_path: string }[]) {
  const calls: string[] = []
  const chain = (result: unknown) => {
    const q: Record<string, jest.Mock> & { then?: unknown } = {}
    for (const m of ['select', 'is', 'lt', 'order', 'in'])
      q[m] = jest.fn((...args: unknown[]) => {
        calls.push(`${m}(${JSON.stringify(args)})`)
        return q
      })
    q.limit = jest.fn(async (...args: unknown[]) => {
      calls.push(`limit(${JSON.stringify(args)})`)
      return result
    })
    q.delete = jest.fn(() => {
      calls.push('delete()')
      // delete 사슬은 마지막 select 가 끝
      q.select = jest.fn(async (...args: unknown[]) => {
        calls.push(`select(${JSON.stringify(args)})`)
        return { data: removed, error: null }
      })
      return q
    })
    return q
  }
  const remove = jest.fn().mockResolvedValue({ data: [], error: null })
  const db = {
    from: jest.fn(() => chain({ data: picked, error: null })),
    storage: { from: jest.fn(() => ({ remove })) },
  }
  return { db: db as any, calls, remove }
}

describe('sweepExpiredPendingImages', () => {
  it('picks only unattached photos older than the pending window, oldest first, in a batch', async () => {
    const { db, calls } = fakeDb([], [])
    expect(await sweepExpiredPendingImages(db, NOW)).toBe(0)
    expect(calls).toEqual([
      'select(["id"])',
      'is(["thread_id",null])',
      `lt(["created_at","${CUTOFF}"])`,
      'order(["created_at",{"ascending":true}])',
      `limit([${SWEEP_BATCH}])`,
    ])
  })

  it('deletes rows first — only if still unattached — then removes exactly those files', async () => {
    const { db, calls, remove } = fakeDb([{ id: 'a' }, { id: 'b' }], [{ storage_path: 'a.webp' }])
    // b 는 그 사이 글에 붙었다 — 행이 지워지지 않았으니 파일도 남긴다
    expect(await sweepExpiredPendingImages(db, NOW)).toBe(1)
    const tail = calls.slice(calls.indexOf('delete()'))
    expect(tail).toEqual([
      'delete()',
      'in(["id",["a","b"]])',
      'is(["thread_id",null])',
      `lt(["created_at","${CUTOFF}"])`,
      'select(["storage_path"])',
    ])
    expect(db.storage.from).toHaveBeenCalledWith('community-images')
    expect(remove).toHaveBeenCalledWith(['a.webp'])
  })

  it('touches no files when nothing was deleted', async () => {
    const { db, remove } = fakeDb([{ id: 'a' }], [])
    expect(await sweepExpiredPendingImages(db, NOW)).toBe(0)
    expect(remove).not.toHaveBeenCalled()
  })
})

/**
 * getArtist 가 uuid·slug·옛 주소(slug_aliases) 순서로 찾는지 — 실제 작가 이름 대신 지어낸 slug 를 쓴다
 */
type Result = { data: unknown; error: { code: string } | null }

const calls: Array<{ method: string; args: unknown[] }> = []
let responses: Result[] = []

function builder() {
  const next = (): Promise<Result> => Promise.resolve(responses.shift() ?? { data: null, error: null })
  const chain = {
    select: (...args: unknown[]) => (calls.push({ method: 'select', args }), chain),
    eq: (...args: unknown[]) => (calls.push({ method: 'eq', args }), chain),
    contains: (...args: unknown[]) => (calls.push({ method: 'contains', args }), chain),
    maybeSingle: () => next(),
    limit: () => next(),
  }
  return chain
}

jest.mock('../../supabase', () => ({ ensureSupabase: () => ({ from: () => builder() }) }))
jest.mock('@/lib/utils/logger', () => ({ log: { error: jest.fn() } }))

import { getArtist, parseArtistKey } from '../artists'

const UUID = '0b6f2a8e-1c3d-4e5f-8a9b-0c1d2e3f4a5b'

beforeEach(() => {
  calls.length = 0
  responses = []
})

describe('parseArtistKey', () => {
  it('uuid 와 slug 를 가른다', () => {
    expect(parseArtistKey(UUID)).toEqual({ kind: 'id', value: UUID })
    expect(parseArtistKey(UUID.toUpperCase())).toEqual({ kind: 'id', value: UUID })
    expect(parseArtistKey('test-artist')).toEqual({ kind: 'slug', value: 'test-artist' })
    expect(parseArtistKey('Test-Artist')).toEqual({ kind: 'slug', value: 'test-artist' })
  })

  // uuid 컬럼에 아무 문자열이나 넣으면 22P02 로 500 이 난다 — 모양이 틀리면 조회하지 않는다
  it('slug 모양이 아니면 invalid', () => {
    for (const raw of ['', 'a--b', '-a', 'a b', '김작가', 'x,id.eq.1']) {
      expect(parseArtistKey(raw)).toEqual({ kind: 'invalid' })
    }
  })
})

describe('getArtist', () => {
  it('uuid 는 id 로만 찾고 옛 주소는 보지 않는다', async () => {
    responses = [{ data: null, error: null }]
    await expect(getArtist(UUID)).resolves.toBeNull()
    expect(calls.filter(c => c.method === 'eq')).toEqual([{ method: 'eq', args: ['id', UUID] }])
    expect(calls.some(c => c.method === 'contains')).toBe(false)
  })

  it('대표 slug 로 찾는다', async () => {
    responses = [{ data: { id: UUID, slug: 'test-artist' }, error: null }]
    await expect(getArtist('test-artist')).resolves.toEqual({ id: UUID, slug: 'test-artist' })
    expect(calls.filter(c => c.method === 'eq')).toEqual([
      { method: 'eq', args: ['slug', 'test-artist'] },
    ])
    expect(calls.some(c => c.method === 'contains')).toBe(false)
  })

  it('대표 slug 가 없으면 옛 주소(slug_aliases)로 찾는다', async () => {
    responses = [
      { data: null, error: null },
      { data: [{ id: UUID, slug: 'test-artist' }], error: null },
    ]
    await expect(getArtist('test-artist-2')).resolves.toEqual({ id: UUID, slug: 'test-artist' })
    expect(calls).toContainEqual({ method: 'contains', args: ['slug_aliases', ['test-artist-2']] })
  })

  it('어디에도 없으면 null', async () => {
    responses = [
      { data: null, error: null },
      { data: [], error: null },
    ]
    await expect(getArtist('no-such-artist')).resolves.toBeNull()
  })

  it('모양이 틀린 주소는 DB 를 부르지 않고 null', async () => {
    await expect(getArtist('x,id.eq.1')).resolves.toBeNull()
    expect(calls).toEqual([])
  })

  it('DB 오류는 삼키지 않는다', async () => {
    responses = [{ data: null, error: { code: '42501' } }]
    await expect(getArtist('test-artist')).rejects.toThrow()
  })
})

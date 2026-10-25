/** @jest-environment node */
import { getAccount } from '@/lib/auth/server'
import { archiveWriter } from '@/lib/archive/writer'
import { MEMBER_ENTRY_COLUMNS } from '@/lib/contests/member-entries'
import { GET } from '../route'

jest.mock('server-only', () => ({}))
jest.mock('@/lib/archive/writer', () => ({ archiveWriter: jest.fn() }))

const accountId = '11111111-1111-4111-8111-111111111111'
const artistId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const row = (id: string, year: number) => ({
  id,
  contest_year: year,
  contest_name: '공모전',
  title: `작품 ${id}`,
  division: null,
  script_style: null,
  fee_status: 'confirmed',
  result_status: 'pending',
  result_raw: null,
  submitted_at: null,
  synced_at: '2026-10-25T00:00:00.000Z',
})

let calls: [string, unknown[]][]
let results: { data: unknown; error: unknown }[]
beforeEach(() => {
  jest.clearAllMocks()
  calls = []
  results = [
    { data: [row('a', 2024), row('b', 2025)], error: null },
    { data: [row('b', 2025), row('c', 2023)], error: null },
  ]
  // 쿼리마다 새 빌더 — limit() 가 결과를 돌려준다
  jest.mocked(archiveWriter).mockImplementation(() => {
    const query: Record<string, jest.Mock> = {}
    for (const method of ['from', 'select', 'eq', 'in', 'order']) {
      query[method] = jest.fn((...args: unknown[]) => {
        calls.push([method, args])
        return query
      })
    }
    query.limit = jest.fn(async () => results.shift())
    return query as any
  })
})

const signIn = (overrides: Record<string, unknown> = {}) =>
  jest.mocked(getAccount).mockResolvedValue({
    id: accountId,
    email: 'Artist@Example.test',
    role: 'member',
    artistIds: [artistId],
    ...overrides,
  } as any)

describe('GET /api/profile/contest-entries', () => {
  it('requires a signed-in member', async () => {
    jest.mocked(getAccount).mockResolvedValue(null)
    const response = await GET()
    expect(response.status).toBe(401)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('finds entries by verified email and by linked artist, merged without duplicates', async () => {
    signIn()
    const response = await GET()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    const body = await response.json()
    expect(body.data.map((entry: { id: string }) => entry.id)).toEqual(['b', 'a', 'c'])
    expect(calls).toContainEqual(['eq', ['entrant_email', 'artist@example.test']])
    expect(calls).toContainEqual(['in', ['artist_id', [artistId]]])
  })

  it('selects only member-safe columns — never the entrant email or names', async () => {
    signIn()
    await GET()
    const selects = calls.filter(([method]) => method === 'select').map(([, args]) => args[0])
    expect(selects.length).toBeGreaterThan(0)
    for (const columns of selects) {
      expect(columns).toBe(MEMBER_ENTRY_COLUMNS)
      expect(columns).not.toMatch(/entrant_|email/)
    }
  })

  it('skips the artist lookup when no artist page is linked', async () => {
    signIn({ artistIds: [] })
    const body = await (await GET()).json()
    expect(calls.some(([method]) => method === 'in')).toBe(false)
    expect(body.data.map((entry: { id: string }) => entry.id)).toEqual(['b', 'a'])
  })

  it('fails closed on a database error', async () => {
    signIn()
    results = [
      { data: null, error: { message: 'boom' } },
      { data: [], error: null },
    ]
    const response = await GET()
    expect(response.status).toBe(500)
    expect((await response.json()).code).toBe('ENTRIES_UNAVAILABLE')
  })
})

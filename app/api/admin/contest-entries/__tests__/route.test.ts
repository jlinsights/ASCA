/** @jest-environment node */
import { NextRequest } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditTrail } from '@/lib/audit/audit-trail'
import { ADMIN_ENTRY_COLUMNS } from '@/lib/contests/admin-entries'
import { GET } from '../route'
import { POST } from '../[id]/route'

jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: async () => null }) }))

const identity = jest.mocked(archiveIdentity)
const entryId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const artistId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const admin = { userId: '22222222-2222-4222-8222-222222222222', admin: true }

type Result = { data: unknown; error: unknown }
interface Call {
  table: string
  ops: [string, unknown[]][]
}

/** 표마다 결과를 줄 세워 두고, 끝에 await 되는 사슬을 기록하는 가짜 DB */
let calls: Call[]
let results: Record<string, Result[]>
function fakeDb() {
  return {
    from(table: string) {
      const call: Call = { table, ops: [] }
      calls.push(call)
      const builder: Record<string, unknown> = {}
      for (const op of [
        'select',
        'eq',
        'is',
        'not',
        'in',
        'order',
        'limit',
        'update',
        'maybeSingle',
      ])
        builder[op] = (...args: unknown[]) => {
          call.ops.push([op, args])
          return builder
        }
      builder.then = (resolve: (r: Result) => unknown) =>
        resolve(results[table]?.shift() ?? { data: [], error: null })
      return builder
    },
  }
}
const opsOf = (table: string, nth = 0) => calls.filter(c => c.table === table)[nth]?.ops ?? []

beforeEach(() => {
  jest.clearAllMocks()
  calls = []
  results = {}
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  identity.mockResolvedValue(admin)
  jest.mocked(archiveWriter).mockReturnValue(fakeDb() as never)
})

const list = (qs = '') =>
  GET(new NextRequest(`https://asca.example/api/admin/contest-entries${qs}`))
const decide = (body: unknown, id = entryId) =>
  POST(
    new NextRequest(`https://asca.example/api/admin/contest-entries/${id}`, {
      method: 'POST',
      headers: { origin: 'https://asca.example' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  )

const entry = (over: Record<string, unknown> = {}) => ({
  id: 'e1',
  contest_year: 2026,
  contest_name: '대한민국 동양서예대전',
  entrant_name: '김 정 례',
  entrant_name_hanja: '金貞禮',
  entrant_email: 'someone@example.test',
  artist_id: null,
  ...over,
})

describe('GET /api/admin/contest-entries', () => {
  it('MFA 관리자가 아니면 401/403 이고 DB 를 열지 않는다', async () => {
    identity.mockResolvedValueOnce(null)
    expect((await list()).status).toBe(401)
    identity.mockResolvedValueOnce({ userId: 'member', admin: false } as never)
    expect((await list()).status).toBe(403)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('기본은 연결 대기 — 허용 칸만 읽고, 잘못된 조건은 400', async () => {
    expect((await list()).status).toBe(200)
    expect(opsOf('contest_entries')).toEqual(
      expect.arrayContaining([
        ['select', [ADMIN_ENTRY_COLUMNS]],
        ['is', ['artist_id', null]],
      ])
    )
    expect(ADMIN_ENTRY_COLUMNS).not.toMatch(/airtable_record_id|fee_status_raw/)
    expect((await list('?status=all')).status).toBe(400)
    expect((await list('?year=abc')).status).toBe(400)
  })

  it('이름·한자가 같은 작가를 .in() 값으로 찾아 후보로 붙인다', async () => {
    results.contest_entries = [{ data: [entry()], error: null }]
    results.artists = [
      {
        data: [{ id: 'a1', name: '김정례', name_zh: null, membership_type: '초대작가' }],
        error: null,
      },
      {
        data: [{ id: 'a1', name: '김정례', name_zh: '金貞禮', membership_type: '초대작가' }],
        error: null,
      },
    ]
    const body = await (await list('?year=2026')).json()
    expect(opsOf('contest_entries')).toContainEqual(['eq', ['contest_year', 2026]])
    expect(opsOf('artists', 0)).toContainEqual(['in', ['name', ['김 정 례', '김정례']]])
    expect(opsOf('artists', 1)).toContainEqual(['in', ['name_zh', ['金貞禮']]])
    expect(body.data[0].candidates).toEqual([expect.objectContaining({ id: 'a1', reason: 'both' })])
  })

  it('연결됨 목록은 이어진 작가를 붙이고 후보는 비운다', async () => {
    results.contest_entries = [{ data: [entry({ artist_id: artistId })], error: null }]
    results.artists = [{ data: [{ id: artistId, name: '김정례', name_zh: '金貞禮' }], error: null }]
    const body = await (await list('?status=matched')).json()
    expect(opsOf('contest_entries')).toContainEqual(['not', ['artist_id', 'is', null]])
    expect(opsOf('artists')).toContainEqual(['in', ['id', [artistId]]])
    expect(body.data[0].artist).toEqual(expect.objectContaining({ id: artistId }))
    expect(body.data[0].candidates).toEqual([])
  })

  it('DB 오류면 500', async () => {
    results.contest_entries = [{ data: null, error: { code: 'XX000' } }]
    expect((await list()).status).toBe(500)
  })
})

describe('POST /api/admin/contest-entries/[id]', () => {
  it('Origin·관리자·본문·ID 를 쓰기 전에 거른다', async () => {
    jest.mocked(checkOrigin).mockReturnValueOnce({ ok: false } as never)
    expect((await decide({ action: 'unlink' })).status).toBe(403)
    identity.mockResolvedValueOnce({ userId: 'member', admin: false } as never)
    expect((await decide({ action: 'unlink' })).status).toBe(403)
    expect((await decide({ action: 'link' })).status).toBe(400)
    expect((await decide({ action: 'link', artistId, matchedBy: 'someone' })).status).toBe(400)
    expect((await decide({ action: 'unlink' }, 'nope')).status).toBe(400)
    expect(calls).toEqual([])
  })

  it('잇기 — 비어 있을 때만 바꾸고, 관리자·시각을 남기고, 감사 기록을 쓴다', async () => {
    results.contest_entries = [
      { data: { id: entryId, artist_id: null }, error: null },
      { data: [{ id: entryId }], error: null },
    ]
    results.artists = [{ data: { id: artistId }, error: null }]
    expect((await decide({ action: 'link', artistId })).status).toBe(200)
    const update = opsOf('contest_entries', 1)
    expect(update[0]).toEqual([
      'update',
      [
        expect.objectContaining({
          artist_id: artistId,
          match_method: 'admin',
          matched_by: admin.userId,
          matched_at: expect.any(String),
        }),
      ],
    ])
    expect(update).toContainEqual(['is', ['artist_id', null]])
    expect(auditTrail.trackDataChange).toHaveBeenCalledWith(
      admin.userId,
      'update',
      'contest_entry',
      entryId,
      undefined,
      { action: 'link', artist_id: artistId }
    )
  })

  it('이미 이어졌으면 409, 없는 출품·작가는 404', async () => {
    results.contest_entries = [
      { data: { id: entryId, artist_id: artistId }, error: null },
      { data: [], error: null },
    ]
    results.artists = [{ data: { id: artistId }, error: null }]
    const taken = await decide({ action: 'link', artistId })
    expect(taken.status).toBe(409)
    expect((await taken.json()).code).toBe('ENTRY_ALREADY_LINKED')

    results.contest_entries = [{ data: null, error: null }]
    expect((await decide({ action: 'unlink' })).status).toBe(404)

    results.contest_entries = [{ data: { id: entryId, artist_id: null }, error: null }]
    results.artists = [{ data: null, error: null }]
    const noArtist = await decide({ action: 'link', artistId })
    expect(noArtist.status).toBe(404)
    expect((await noArtist.json()).code).toBe('ARTIST_NOT_FOUND')
  })

  it('풀기 — 이어져 있을 때만 artist_id 를 비운다(이력 칸은 그대로)', async () => {
    results.contest_entries = [
      { data: { id: entryId, artist_id: artistId }, error: null },
      { data: [{ id: entryId }], error: null },
    ]
    expect((await decide({ action: 'unlink' })).status).toBe(200)
    const update = opsOf('contest_entries', 1)
    expect(update[0]).toEqual(['update', [{ artist_id: null }]])
    expect(update).toContainEqual(['not', ['artist_id', 'is', null]])

    results.contest_entries = [
      { data: { id: entryId, artist_id: null }, error: null },
      { data: [], error: null },
    ]
    expect((await (await decide({ action: 'unlink' })).json()).code).toBe('ENTRY_NOT_LINKED')
  })
})

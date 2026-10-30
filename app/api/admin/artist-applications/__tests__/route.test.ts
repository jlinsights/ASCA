/** @jest-environment node */
import { NextRequest } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditTrail } from '@/lib/audit/audit-trail'
import { ADMIN_APPLICATION_COLUMNS, REVIEWED_COLUMNS } from '@/lib/applications/admin-applications'
import { GET } from '../route'
import { POST } from '../[id]/route'

jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: async () => null }) }))

const identity = jest.mocked(archiveIdentity)
const appId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const admin = { userId: '22222222-2222-4222-8222-222222222222', admin: true }

type Result = { data: unknown; error: unknown; count?: number }
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
      for (const op of ['select', 'eq', 'is', 'in', 'order', 'range', 'update', 'maybeSingle'])
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
const opsOf = (nth = 0) => calls.filter(c => c.table === 'artist_applications')[nth]?.ops ?? []

beforeEach(() => {
  jest.clearAllMocks()
  calls = []
  results = {}
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  identity.mockResolvedValue(admin)
  jest.mocked(archiveWriter).mockReturnValue(fakeDb() as never)
})

const list = (qs = '') =>
  GET(new NextRequest(`https://asca.example/api/admin/artist-applications${qs}`))
const send = (body: unknown, id = appId) =>
  POST(
    new NextRequest(`https://asca.example/api/admin/artist-applications/${id}`, {
      method: 'POST',
      headers: { origin: 'https://asca.example' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  )
/** 화면이 보내는 모양 — 처리된 적 없는 신청이면 seen 은 null */
const seenAt = '2026-10-30T03:00:00.123+00:00'
const decide = (body: Record<string, unknown>, id = appId) => send({ seen: null, ...body }, id)

describe('GET /api/admin/artist-applications', () => {
  it('MFA 관리자가 아니면 401/403 이고 DB 를 열지 않는다', async () => {
    identity.mockResolvedValueOnce(null)
    expect((await list()).status).toBe(401)
    identity.mockResolvedValueOnce({ userId: 'member', admin: false } as never)
    expect((await list()).status).toBe(403)
    expect(archiveWriter).not.toHaveBeenCalled()
  })

  it('기본은 접수·심사 중을 오래된 것부터 — Tally ID 는 읽지 않는다', async () => {
    expect((await list()).status).toBe(200)
    expect(opsOf()).toEqual(
      expect.arrayContaining([
        ['select', [ADMIN_APPLICATION_COLUMNS, { count: 'exact' }]],
        ['in', ['status', ['received', 'reviewing']]],
        ['order', ['submitted_at', { ascending: true }]],
        ['range', [0, 49]],
      ])
    )
    expect(ADMIN_APPLICATION_COLUMNS).not.toMatch(/tally_/)
  })

  it('끝난 탭은 그 상태만 최근 순서로, 잘못된 탭은 400', async () => {
    await list('?view=approved')
    expect(opsOf()).toEqual(
      expect.arrayContaining([
        ['in', ['status', ['approved']]],
        ['order', ['submitted_at', { ascending: false }]],
      ])
    )
    expect((await list('?view=all')).status).toBe(400)
    expect((await list('?page=0')).status).toBe(400)
  })

  it('쪽을 나눠 읽고 전체 건수를 함께 준다 — 100건이 넘어도 오래된 신청에 닿는다', async () => {
    results.artist_applications = [{ data: [], error: null, count: 120 }]
    const body = await (await list('?view=approved&page=3')).json()
    expect(opsOf()).toContainEqual(['range', [100, 149]])
    expect(body).toEqual({ data: [], page: 3, limit: 50, total: 120 })
  })

  it('DB 오류면 500', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    results.artist_applications = [{ data: null, error: { code: 'XX000' } }]
    expect((await list()).status).toBe(500)
  })
})

describe('POST /api/admin/artist-applications/[id]', () => {
  it('Origin·관리자·본문·ID 를 쓰기 전에 거른다', async () => {
    jest.mocked(checkOrigin).mockReturnValueOnce({ ok: false } as never)
    expect((await decide({ from: 'received', to: 'reviewing' })).status).toBe(403)
    identity.mockResolvedValueOnce({ userId: 'member', admin: false } as never)
    expect((await decide({ from: 'received', to: 'reviewing' })).status).toBe(403)
    expect((await decide({ from: 'received', to: 'selected' })).status).toBe(400)
    expect((await decide({ from: 'received', to: 'received' })).status).toBe(400)
    expect(
      (await decide({ from: 'received', to: 'approved', reviewed_by: 'someone' })).status
    ).toBe(400)
    expect(
      (await decide({ from: 'received', to: 'approved', note: 'x'.repeat(2001) })).status
    ).toBe(400)
    expect((await decide({ from: 'received', to: 'reviewing' }, 'nope')).status).toBe(400)
    expect((await send({ from: 'received', to: 'reviewing' })).status).toBe(400)
    expect((await decide({ from: 'received', to: 'reviewing', seen: 'yesterday' })).status).toBe(
      400
    )
    expect(calls).toEqual([])
  })

  it('본 상태일 때만 바꾸고, 관리자·시각·메모를 남기고, 감사 기록엔 메모 본문을 싣지 않는다', async () => {
    const saved = {
      id: appId,
      status: 'approved',
      review_note: '이사회 의결 완료',
      reviewed_at: '2026-10-30T05:00:00.000+00:00',
    }
    results.artist_applications = [{ data: [saved], error: null }]
    const res = await decide({ from: 'reviewing', to: 'approved', note: ' 이사회 의결 완료 ' })
    expect(res.status).toBe(200)
    // 바뀐 행을 돌려준다 — 화면이 다시 읽기 없이 이 행을 고친다
    expect(await res.json()).toEqual({ data: saved })
    expect(opsOf()).toContainEqual(['select', [REVIEWED_COLUMNS]])
    const ops = opsOf()
    expect(ops[0]).toEqual([
      'update',
      [
        {
          status: 'approved',
          reviewed_by: admin.userId,
          reviewed_at: expect.any(String),
          review_note: '이사회 의결 완료',
        },
      ],
    ])
    expect(ops).toContainEqual(['eq', ['id', appId]])
    expect(ops).toContainEqual(['eq', ['status', 'reviewing']])
    expect(ops).toContainEqual(['is', ['reviewed_at', null]])
    expect(auditTrail.trackDataChange).toHaveBeenCalledWith(
      admin.userId,
      'update',
      'artist_application',
      appId,
      { status: 'reviewing' },
      { status: 'approved', note_changed: true }
    )
    expect(JSON.stringify(jest.mocked(auditTrail.trackDataChange).mock.calls)).not.toContain(
      '이사회'
    )
  })

  it('메모만 바꾸거나 지울 수 있고, 메모를 빼면 그대로 둔다', async () => {
    results.artist_applications = [{ data: [{ id: appId }], error: null }]
    await decide({ from: 'reviewing', to: 'reviewing', note: '   ' })
    expect(opsOf()[0][1][0]).toEqual(expect.objectContaining({ review_note: null }))

    results.artist_applications = [{ data: [{ id: appId }], error: null }]
    await decide({ from: 'received', to: 'reviewing' })
    expect(opsOf(1)[0][1][0]).not.toHaveProperty('review_note')
  })

  it('메모 저장도 본 처리 시각일 때만 — 앞선 관리자의 메모를 덮지 않는다', async () => {
    results.artist_applications = [
      { data: [], error: null },
      { data: { id: appId }, error: null },
    ]
    const res = await decide({ from: 'reviewing', seen: seenAt, to: 'reviewing', note: '두 번째' })
    expect(opsOf()).toContainEqual(['eq', ['reviewed_at', seenAt]])
    expect(res.status).toBe(409)
  })

  it('다른 관리자가 먼저 바꿨으면 409, 없는 신청은 404', async () => {
    results.artist_applications = [
      { data: [], error: null },
      { data: { id: appId }, error: null },
    ]
    const taken = await decide({ from: 'received', to: 'reviewing' })
    expect(taken.status).toBe(409)
    expect((await taken.json()).code).toBe('APPLICATION_CHANGED')

    results.artist_applications = [
      { data: [], error: null },
      { data: null, error: null },
    ]
    expect((await decide({ from: 'received', to: 'reviewing' })).status).toBe(404)
    expect(auditTrail.trackDataChange).not.toHaveBeenCalled()
  })

  it('감사 기록이 실패해도 저장은 끝났으므로 200, DB 오류는 500', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    results.artist_applications = [{ data: [{ id: appId }], error: null }]
    jest.mocked(auditTrail.trackDataChange).mockRejectedValueOnce(new Error('audit down'))
    expect((await decide({ from: 'received', to: 'reviewing' })).status).toBe(200)

    results.artist_applications = [{ data: null, error: { code: 'XX000' } }]
    expect((await decide({ from: 'received', to: 'reviewing' })).status).toBe(500)
  })
})

/** @jest-environment node */
import { NextRequest } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { auditTrail } from '@/lib/audit/audit-trail'
import { GET } from '../route'
import { PATCH } from '../[id]/route'

jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn(() => ({ ok: true })) }))
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: async () => null }) }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))

const identity = archiveIdentity as jest.Mock
const writer = archiveWriter as jest.Mock
const ID = 'c497df6b-4907-4fb0-811b-eedfa050fb77'
const admin = { userId: 'user_admin', admin: true }

/** 체이닝된 호출을 기록하고, 끝(range/maybeSingle/single)에서 정해 둔 결과를 돌려주는 가짜 쿼리 */
function fakeDb(results: { list?: unknown; before?: unknown; after?: unknown }) {
  const calls: [string, unknown[]][] = []
  const builder: Record<string, unknown> = {}
  for (const method of ['from', 'select', 'or', 'ilike', 'eq', 'order', 'update']) {
    builder[method] = (...args: unknown[]) => {
      calls.push([method, args])
      return builder
    }
  }
  builder.range = async (...args: unknown[]) => {
    calls.push(['range', args])
    return results.list
  }
  builder.maybeSingle = async () => results.before
  builder.single = async () => results.after
  writer.mockReturnValue(builder)
  return calls
}

const list = (qs = '') => GET(new NextRequest(`http://localhost/api/admin/artists${qs}`))
const patch = (body: unknown, id = ID) =>
  PATCH(
    new NextRequest(`http://localhost/api/admin/artists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  )

beforeEach(() => {
  jest.clearAllMocks()
  ;(checkOrigin as jest.Mock).mockReturnValue({ ok: true })
})

describe('GET /api/admin/artists', () => {
  it('로그인하지 않으면 401, 관리자가 아니면 403 — DB 를 열지 않는다', async () => {
    identity.mockResolvedValueOnce(null)
    expect((await list()).status).toBe(401)
    identity.mockResolvedValueOnce({ userId: 'user_b', admin: false })
    expect((await list()).status).toBe(403)
    expect(writer).not.toHaveBeenCalled()
  })

  it('허용 외 회비 상태로 거르면 400', async () => {
    identity.mockResolvedValue(admin)
    expect((await list('?dues=미납')).status).toBe(400)
  })

  it('검색·등급·회비 조건과 페이지를 쿼리에 반영한다', async () => {
    identity.mockResolvedValue(admin)
    const calls = fakeDb({
      list: { data: [{ id: ID, name: '김작가' }], error: null, count: 31 },
    })
    const response = await list('?q=김&grade=초대작가&dues=자격 정지&page=2')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      artists: [{ id: ID, name: '김작가' }],
      total: 31,
      page: 2,
      pageSize: 30,
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        ['or', ['name.ilike.*김*,name_zh.ilike.*김*,name_en.ilike.*김*']],
        ['ilike', ['membership_type', '%초%대%작%가%']],
        ['eq', ['dues_status', '자격 정지']],
        ['range', [30, 59]],
      ])
    )
  })
})

describe('PATCH /api/admin/artists/[id]', () => {
  it('출처 검사 실패·비로그인·비관리자는 막는다', async () => {
    ;(checkOrigin as jest.Mock).mockReturnValueOnce({ ok: false })
    expect((await patch({ dues_status: '정상' })).status).toBe(403)
    identity.mockResolvedValueOnce(null)
    expect((await patch({ dues_status: '정상' })).status).toBe(401)
    identity.mockResolvedValueOnce({ userId: 'user_b', admin: false })
    expect((await patch({ dues_status: '정상' })).status).toBe(403)
    expect(writer).not.toHaveBeenCalled()
  })

  it('허용 외 값·추가 필드·잘못된 ID 는 400 — visibility 를 직접 바꿀 수 없다', async () => {
    identity.mockResolvedValue(admin)
    expect((await patch({ dues_status: '미납' })).status).toBe(400)
    expect((await patch({ dues_status: '정상', visibility: 'public' })).status).toBe(400)
    expect((await patch({ dues_status: '정상' }, 'not-a-uuid')).status).toBe(400)
    expect(writer).not.toHaveBeenCalled()
  })

  it('없는 작가는 404', async () => {
    identity.mockResolvedValue(admin)
    fakeDb({ before: { data: null, error: null } })
    expect((await patch({ dues_status: '정상' })).status).toBe(404)
  })

  it('회비 상태만 갱신하고, 트리거가 정한 공개 여부를 돌려주며 변경을 기록한다', async () => {
    identity.mockResolvedValue(admin)
    const saved = { id: ID, name: '김작가', dues_status: '자격 정지', visibility: 'hidden' }
    const calls = fakeDb({
      before: { data: { dues_status: '정상', visibility: 'public' }, error: null },
      after: { data: saved, error: null },
    })
    const response = await patch({ dues_status: '자격 정지' })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ artist: saved })
    expect(calls).toContainEqual(['update', [{ dues_status: '자격 정지' }]])
    expect(auditTrail.trackDataChange).toHaveBeenCalledWith(
      'user_admin',
      'update',
      'artist_dues_status',
      ID,
      { dues_status: '정상', visibility: 'public' },
      { dues_status: '자격 정지', visibility: 'hidden' }
    )
  })
})

/** @jest-environment node */
import { NextRequest } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { ADMIN_INQUIRY_COLUMNS } from '@/lib/inquiries/schema'
import { GET } from '../route'
import { DELETE, POST } from '../[id]/route'

jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
jest.mock('@/lib/security/rate-limit', () => ({ rateLimit: () => ({ check: async () => null }) }))

const identity = jest.mocked(archiveIdentity)
const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const admin = { userId: '22222222-2222-4222-8222-222222222222', admin: true }

type Result = { data: unknown; error: unknown }
let ops: [string, unknown[]][]
let result: Result
function fakeDb() {
  return {
    from(table: string) {
      expect(table).toBe('inquiries')
      const builder: Record<string, unknown> = {}
      for (const op of ['select', 'eq', 'order', 'limit', 'update', 'delete'])
        builder[op] = (...args: unknown[]) => {
          ops.push([op, args])
          return builder
        }
      builder.then = (resolve: (r: Result) => unknown) => resolve(result)
      return builder
    },
  }
}
const op = (name: string) => ops.find(([n]) => n === name)?.[1]

beforeEach(() => {
  jest.clearAllMocks()
  ops = []
  result = { data: [{ id }], error: null }
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  identity.mockResolvedValue(admin)
  jest.mocked(archiveWriter).mockReturnValue(fakeDb() as never)
})

const url = (path = '') => `https://orientalcalligraphy.org/api/admin/inquiries${path}`
const ctx = (value = id) => ({ params: Promise.resolve({ id: value }) })
const decide = (body: unknown, value = id) =>
  POST(
    new NextRequest(url(`/${value}`), {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    }),
    ctx(value)
  )

describe('GET /api/admin/inquiries', () => {
  it('관리자에게 새 문의를 최신 순으로 정해진 칸만 보여 준다', async () => {
    const response = await GET(new NextRequest(url()))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(op('select')).toEqual([ADMIN_INQUIRY_COLUMNS])
    expect(op('eq')).toEqual(['status', 'new'])
    expect(op('order')).toEqual(['created_at', { ascending: false }])
  })

  it('전체를 고르면 상태로 거르지 않는다', async () => {
    await GET(new NextRequest(url('?status=all')))
    expect(op('eq')).toBeUndefined()
  })

  it('로그인 안 함 401 · 관리자 아님(또는 MFA 전) 403 · 잘못된 상태 400', async () => {
    identity.mockResolvedValueOnce(null)
    expect((await GET(new NextRequest(url()))).status).toBe(401)
    identity.mockResolvedValueOnce({ ...admin, admin: false })
    expect((await GET(new NextRequest(url()))).status).toBe(403)
    expect((await GET(new NextRequest(url('?status=spam')))).status).toBe(400)
  })
})

describe('POST /api/admin/inquiries/[id]', () => {
  it('답함으로 옮기면 처리한 관리자·시각과 메모를 남긴다', async () => {
    expect((await decide({ status: 'answered', note: '전화로 답함' })).status).toBe(200)
    expect(op('update')?.[0]).toMatchObject({
      status: 'answered',
      handled_by: admin.userId,
      staff_note: '전화로 답함',
    })
    expect((op('update')?.[0] as { handled_at: string }).handled_at).toEqual(expect.any(String))
    expect(op('eq')).toEqual(['id', id])
  })

  it('새 문의로 되돌리면 처리 기록을 지우고, 메모를 안 보내면 메모는 그대로 둔다', async () => {
    await decide({ status: 'new' })
    expect(op('update')?.[0]).toEqual({ status: 'new', handled_at: null, handled_by: null })
  })

  it('없는 문의 404 · 잘못된 ID·상태 400 · 다른 출처 403', async () => {
    result = { data: [], error: null }
    expect((await decide({ status: 'closed' })).status).toBe(404)
    expect((await decide({ status: 'closed' }, 'not-a-uuid')).status).toBe(400)
    expect((await decide({ status: 'spam' })).status).toBe(400)
    jest.mocked(checkOrigin).mockReturnValue({ ok: false } as never)
    expect((await decide({ status: 'closed' })).status).toBe(403)
  })
})

describe('DELETE /api/admin/inquiries/[id]', () => {
  it('관리자만 지울 수 있다', async () => {
    const remove = () => DELETE(new NextRequest(url(`/${id}`), { method: 'DELETE' }), ctx())
    expect((await remove()).status).toBe(200)
    expect(op('delete')).toEqual([])
    identity.mockResolvedValueOnce({ ...admin, admin: false })
    expect((await remove()).status).toBe(403)
  })
})

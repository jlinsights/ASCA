/** @jest-environment node */
jest.mock('server-only', () => ({}))
jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn() }))
import { NextRequest } from 'next/server'
import { archiveIdentity } from '@/lib/archive/writer'
import { POST } from '../route'

const identity = jest.mocked(archiveIdentity)
const body = {
  quote: { applicationType: 'solo', membership: 'member', approvedWorks: 20, paidCopies: 100 },
}
const post = () =>
  POST(
    new NextRequest('http://localhost/api/admin/catalog-quote/cost', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  )

beforeEach(() => {
  process.env.CATALOG_QUOTE_PREVIEW = 'on'
  identity.mockReset()
})
afterAll(() => {
  delete process.env.CATALOG_QUOTE_PREVIEW
})

describe('POST /api/admin/catalog-quote/cost', () => {
  it('비활성이면 인증 전에 404', async () => {
    delete process.env.CATALOG_QUOTE_PREVIEW
    expect((await post()).status).toBe(404)
    expect(identity).not.toHaveBeenCalled()
  })

  it('로그인 안 함 401, 관리자 아님(또는 MFA 미완료) 403 — 원가를 싣지 않는다', async () => {
    identity.mockResolvedValueOnce(null as never)
    const anon = await post()
    expect(anon.status).toBe(401)
    identity.mockResolvedValueOnce({ userId: 'u', admin: false } as never)
    const member = await post()
    expect(member.status).toBe(403)
    expect(JSON.stringify(await member.json())).not.toMatch(/revenue|paymentFee|cost"/)
  })

  it('관리자는 원가 검토 결과를 받는다 (no-store)', async () => {
    identity.mockResolvedValueOnce({ userId: 'u', admin: true } as never)
    const response = await post()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    const json = await response.json()
    expect(json.cost.status).toBe('NO_VENDOR_QUOTE')
    expect(json.cost.revenue).toBe(2_907_600)
  })
})

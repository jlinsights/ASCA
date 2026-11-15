/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../route'

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/catalog-quote', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  )
const input = { applicationType: 'solo', membership: 'member', approvedWorks: 20, paidCopies: 100 }

afterEach(() => {
  delete process.env.CATALOG_QUOTE_PREVIEW
})

describe('POST /api/catalog-quote', () => {
  it('기본 비활성: 404', async () => {
    expect((await post(input)).status).toBe(404)
  })

  it('켜면 서버가 다시 계산한다 — 보낸 단가는 무시', async () => {
    process.env.CATALOG_QUOTE_PREVIEW = 'on'
    const response = await post({ ...input, unitPrice: 1, amount: 1 })
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    const body = await response.json()
    expect(body.quote.catalog.amount).toBe(1_938_400)
    expect(JSON.stringify(body)).not.toMatch(/cost|margin|profit/i)
  })

  it('오입력은 422 와 검증 오류, 깨진 JSON 은 400', async () => {
    process.env.CATALOG_QUOTE_PREVIEW = 'on'
    const bad = await post({ ...input, paidCopies: 120 })
    expect(bad.status).toBe(422)
    expect((await bad.json()).errors).toEqual(['COPIES_NOT_OPTION'])
    expect((await post('{')).status).toBe(400)
  })

  it('혼합 단체는 200 별도 견적', async () => {
    process.env.CATALOG_QUOTE_PREVIEW = 'on'
    const body = await (
      await post({ ...input, applicationType: 'groupBooth', membership: 'mixed' })
    ).json()
    expect(body).toEqual({ ok: false, status: 'separateQuote', reasons: ['MIXED_MEMBERSHIP'] })
  })
})

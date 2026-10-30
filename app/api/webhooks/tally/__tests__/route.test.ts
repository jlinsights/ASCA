/** @jest-environment node */
import { createHmac } from 'crypto'
import { NextRequest } from 'next/server'
import { archiveWriter } from '@/lib/archive/writer'
import { auditTrail } from '@/lib/audit/audit-trail'
import { tallyPayload } from '@/lib/applications/__fixtures__/tally-payload'
import { POST } from '../route'

jest.mock('@/lib/archive/writer', () => ({ archiveWriter: jest.fn() }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))

const secret = 'test-secret'
const sign = (body: string) => createHmac('sha256', secret).update(body).digest('base64')

let upserts: { row: unknown; options: unknown }[]
let result: { data: unknown; error: unknown }

function request(body: string, signature: string | null = sign(body)) {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (signature) headers['tally-signature'] = signature
  return new NextRequest('http://localhost/api/webhooks/tally', { method: 'POST', body, headers })
}

const audit = jest.mocked(auditTrail.trackDataChange)

beforeEach(() => {
  jest.clearAllMocks()
  process.env.TALLY_SIGNING_SECRET = secret
  delete process.env.TALLY_APPLICATION_FORM_ID
  upserts = []
  result = { data: [{ id: 'x' }], error: null }
  jest.mocked(archiveWriter).mockReturnValue({
    from: (table: string) => {
      expect(table).toBe('artist_applications')
      return {
        upsert: (row: unknown, options: unknown) => {
          upserts.push({ row, options })
          return { select: async () => result }
        },
      }
    },
  } as unknown as ReturnType<typeof archiveWriter>)
})

describe('POST /api/webhooks/tally', () => {
  const body = JSON.stringify(tallyPayload())

  it('서명 비밀이 없으면 503', async () => {
    delete process.env.TALLY_SIGNING_SECRET
    expect((await POST(request(body))).status).toBe(503)
    expect(upserts).toHaveLength(0)
  })

  it('서명이 틀리면 401 이고 저장하지 않는다', async () => {
    const res = await POST(request(body, 'bad'))
    expect(res.status).toBe(401)
    expect(upserts).toHaveLength(0)
  })

  it('맞는 서명이면 허용 칸만 응답 ID 기준으로 넣는다', async () => {
    const res = await POST(request(body))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, result: 'stored' })
    expect(upserts).toHaveLength(1)
    expect(upserts[0].options).toEqual({ onConflict: 'tally_response_id', ignoreDuplicates: true })
    expect(upserts[0].row).toMatchObject({
      tally_response_id: 'resp01',
      requested_grade: 'invited',
    })
    expect(JSON.stringify(upserts[0].row)).not.toContain('+821000000000')
  })

  it('새 행은 개인정보 없이 감사 기록에 남긴다', async () => {
    await POST(request(body))
    expect(audit).toHaveBeenCalledTimes(1)
    expect(audit).toHaveBeenCalledWith(
      'system:tally-webhook',
      'create',
      'artist_application',
      'x',
      null,
      { requested_grade: 'invited', route: 'special', track: 'traditional' },
      { source: 'tally_webhook' }
    )
    expect(JSON.stringify(audit.mock.calls)).not.toMatch(/홍길동|example\.com/i)
  })

  it('감사 기록이 실패해도 저장은 끝났으므로 200', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    audit.mockRejectedValueOnce(new Error('audit down'))
    const res = await POST(request(body))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, result: 'stored' })
  })

  it('같은 응답이 다시 오면 duplicate 이고 감사 기록을 다시 남기지 않는다', async () => {
    result = { data: [], error: null }
    expect(await (await POST(request(body))).json()).toEqual({ ok: true, result: 'duplicate' })
    expect(audit).not.toHaveBeenCalled()
  })

  it('다른 폼의 웹훅은 저장하지 않는다', async () => {
    const other = JSON.stringify(tallyPayload({ formId: 'other1' }))
    expect(await (await POST(request(other))).json()).toMatchObject({ result: 'ignored' })
    expect(upserts).toHaveLength(0)
  })

  it('동의하지 않은 응답은 저장하지 않는다', async () => {
    const base = tallyPayload()
    const fields = base.data.fields.map(f =>
      f.key === 'question_consent'
        ? { ...f, value: ['no'], options: [{ id: 'no', text: '아니오, 동의하지 않습니다.' }] }
        : f
    )
    const refused = JSON.stringify(tallyPayload({ fields }))
    expect(await (await POST(request(refused))).json()).toEqual({
      ok: true,
      result: 'ignored',
      reason: 'NO_CONSENT',
    })
    expect(upserts).toHaveLength(0)
  })

  it('형식이 틀리면 400', async () => {
    const bad = JSON.stringify({ eventType: 'FORM_RESPONSE' })
    expect((await POST(request(bad))).status).toBe(400)
  })

  it('DB 오류는 500 — Tally 가 다시 보내게', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    result = { data: null, error: { message: 'boom' } }
    expect((await POST(request(body))).status).toBe(500)
  })
})

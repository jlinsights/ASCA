/** @jest-environment node */
import { NextRequest } from 'next/server'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { MAX_INQUIRY_BYTES } from '@/lib/inquiries/schema'
import { POST } from '../route'

jest.mock('@/lib/archive/writer', () => ({ archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
let limited: Response | null = null
jest.mock('@/lib/security/rate-limit', () => ({
  rateLimit: () => ({ check: async () => limited }),
}))

let inserted: unknown[]
let insertResult: { data: unknown; error: unknown }
function fakeDb() {
  return {
    from: (table: string) => {
      expect(table).toBe('inquiries')
      return {
        insert: (row: unknown) => {
          inserted.push(row)
          return { select: () => ({ single: async () => insertResult }) }
        },
      }
    },
  }
}

const valid = {
  topic: 'commission',
  name: '  홍길동 ',
  email: ' Hong@Example.COM ',
  phone: '',
  subject: '현판',
  plan: '2027년 3월',
  message: '  현판 휘호를 부탁드립니다. ',
  language: 'en',
  consent: true,
  website: '',
}

function send(body: unknown, init: { length?: number } = {}) {
  const text = JSON.stringify(body)
  return POST(
    new NextRequest('https://orientalcalligraphy.org/api/inquiries', {
      method: 'POST',
      body: text,
      headers: {
        'content-type': 'application/json',
        'content-length': String(init.length ?? Buffer.byteLength(text)),
      },
    })
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  inserted = []
  limited = null
  insertResult = { data: { id: '11111111-1111-4111-8111-111111111111' }, error: null }
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  jest.mocked(archiveWriter).mockReturnValue(fakeDb() as never)
})

describe('POST /api/inquiries', () => {
  it('다듬고 소문자로 바꾼 값만 저장하고 201 과 id 를 돌려준다', async () => {
    const response = await send(valid)
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      ok: true,
      id: '11111111-1111-4111-8111-111111111111',
    })
    expect(inserted).toEqual([
      {
        topic: 'commission',
        name: '홍길동',
        email: 'hong@example.com',
        phone: null,
        subject: '현판',
        plan: '2027년 3월',
        message: '현판 휘호를 부탁드립니다.',
        language: 'en',
      },
    ])
  })

  it('예산·일정 칸이 없는 용건이면 plan 을 서버에서 버린다', async () => {
    await send({ ...valid, topic: 'academy' })
    expect(inserted[0]).toMatchObject({ topic: 'academy', plan: null })
  })

  it('덫 칸이 채워지면 저장하지 않고 성공처럼 답한다', async () => {
    const response = await send({ ...valid, website: 'https://spam.example' })
    expect(response.status).toBe(201)
    expect(inserted).toHaveLength(0)
  })

  it.each([
    ['동의 없음', { consent: false }],
    ['연락처 없음', { email: '', phone: '  ' }],
    ['이메일 형식', { email: 'hong@' }],
    ['모르는 용건', { topic: 'hack' }],
    ['빈 내용', { message: '   ' }],
    ['너무 긴 내용', { message: '가'.repeat(5001) }],
    ['모르는 칸', { admin: true }],
  ])('%s 이면 400 이고 저장하지 않는다', async (_label, patch) => {
    const response = await send({ ...valid, ...patch })
    expect(response.status).toBe(400)
    expect(inserted).toHaveLength(0)
  })

  it('다른 출처는 403', async () => {
    jest.mocked(checkOrigin).mockReturnValue({ ok: false, reason: 'host_mismatch' } as never)
    expect((await send(valid)).status).toBe(403)
    expect(inserted).toHaveLength(0)
  })

  it('출처 확인 설정이 깨져 던지면 503 으로 닫는다', async () => {
    jest.mocked(checkOrigin).mockImplementation(() => {
      throw new Error('CSRF_ENV_MISCONFIGURED')
    })
    expect((await send(valid)).status).toBe(503)
  })

  it('속도 제한에 걸리면 그 응답을 그대로 돌려준다', async () => {
    limited = new Response(null, { status: 429 })
    expect((await send(valid)).status).toBe(429)
    expect(inserted).toHaveLength(0)
  })

  it('본문이 너무 크면 읽기 전에 413', async () => {
    expect((await send(valid, { length: MAX_INQUIRY_BYTES + 1 })).status).toBe(413)
  })

  it('저장이 실패하면 503 — 화면이 메일·카카오톡을 권한다', async () => {
    insertResult = { data: null, error: { message: 'relation "inquiries" does not exist' } }
    const response = await send(valid)
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ code: 'UNAVAILABLE' })
  })
})

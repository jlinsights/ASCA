/** @jest-environment node */
import { createDonusClient, DonusApiError, MIN_INTERVAL_MS, PAGE_SIZE } from '../client'

const KEY = 'test-donus-key-123'

function fakeFetch(pages: unknown[], status = 200) {
  const urls: URL[] = []
  const impl = jest.fn(async (input: URL | RequestInfo) => {
    urls.push(new URL(String(input)))
    const body = pages[Math.min(urls.length - 1, pages.length - 1)]
    return new Response(JSON.stringify(body), { status })
  }) as unknown as typeof fetch
  return { impl, urls }
}

function clock() {
  let t = 0
  const waits: number[] = []
  return {
    now: () => t,
    sleep: async (ms: number) => {
      waits.push(ms)
      t += ms
    },
    waits,
  }
}

describe('createDonusClient', () => {
  it('sends the key as the apikey query parameter to the members endpoint', async () => {
    const { impl, urls } = fakeFetch([{ members: [], hasMore: false }])
    const c = clock()
    await createDonusClient({ apiKey: KEY, fetchImpl: impl, ...c }).membersCreated(
      '2026-01-01',
      '2026-01-30'
    )
    expect(urls[0].origin + urls[0].pathname).toBe(
      'https://cloud.donus.org/api/members/v0/members/recent/created'
    )
    expect(urls[0].searchParams.get('apikey')).toBe(KEY)
    expect(urls[0].searchParams.get('startDate')).toBe('2026-01-01')
    expect(urls[0].searchParams.get('endDate')).toBe('2026-01-30')
    expect(urls[0].searchParams.get('count')).toBe(String(PAGE_SIZE))
    expect(urls[0].searchParams.has('memberIdxOffset')).toBe(false)
  })

  it('follows memberIdxOffset until hasMore is false', async () => {
    const { impl, urls } = fakeFetch([
      { members: [{ memberIdx: 1, memberCode: 'A' }], hasMore: true, memberIdxOffset: 1 },
      { members: [{ memberIdx: 2, memberCode: 'B' }], hasMore: false, memberIdxOffset: 2 },
    ])
    const c = clock()
    const members = await createDonusClient({ apiKey: KEY, fetchImpl: impl, ...c }).membersCreated(
      '2026-01-01',
      '2026-01-30'
    )
    expect(members.map(m => m.memberIdx)).toEqual([1, 2])
    expect(urls[1].searchParams.get('memberIdxOffset')).toBe('1')
  })

  it('stops when the offset does not advance', async () => {
    const { impl, urls } = fakeFetch([{ members: [], hasMore: true, memberIdxOffset: 5 }])
    const c = clock()
    await createDonusClient({ apiKey: KEY, fetchImpl: impl, ...c }).membersCreated(
      '2026-01-01',
      '2026-01-30'
    )
    expect(urls).toHaveLength(2)
  })

  it('spaces calls at least MIN_INTERVAL_MS apart (Donus allows 5 per second)', async () => {
    const { impl } = fakeFetch([{ memberIdx: 1, memberCode: 'A' }])
    const c = clock()
    const client = createDonusClient({ apiKey: KEY, fetchImpl: impl, ...c })
    await client.member(1)
    await client.member(2)
    await client.member(3)
    expect(c.waits).toEqual([MIN_INTERVAL_MS, MIN_INTERVAL_MS])
    expect(client.callCount()).toBe(3)
  })

  it('reads payments for one member with payDate and the offset cursor', async () => {
    const { impl, urls } = fakeFetch([
      { payments: [{ paymentIdx: 10, memberIdx: 7 }], hasMore: true, paymentIdxOffset: 10 },
      { payments: [{ paymentIdx: 11, memberIdx: 7 }], hasMore: false },
    ])
    const c = clock()
    const rows = await createDonusClient({ apiKey: KEY, fetchImpl: impl, ...c }).payments(
      7,
      '2026-01-01',
      '2026-11-13'
    )
    expect(rows.map(r => r.paymentIdx)).toEqual([10, 11])
    expect(urls[0].pathname).toBe('/api/payments/v0/payments')
    expect(urls[0].searchParams.get('memberIdx')).toBe('7')
    expect(urls[0].searchParams.get('dateType')).toBe('payDate')
    expect(urls[1].searchParams.get('paymentIdxOffset')).toBe('10')
  })

  it('throws DonusApiError without leaking the key or the URL', async () => {
    const { impl } = fakeFetch([{ status: 'error', message: 'invalid apikey' }], 401)
    const c = clock()
    const error = await createDonusClient({ apiKey: KEY, fetchImpl: impl, ...c })
      .member(1)
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(DonusApiError)
    expect((error as DonusApiError).status).toBe(401)
    expect((error as Error).message).toContain('invalid apikey')
    expect((error as Error).message).not.toContain(KEY)
    expect((error as Error).message).not.toContain('cloud.donus.org')
  })

  it('refuses an empty key', () => {
    expect(() => createDonusClient({ apiKey: '  ' })).toThrow('DONUS_API_KEY is empty')
  })
})

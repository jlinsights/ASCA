import { searchAllContent, searchNotices, toIlikeTerm } from '../search'

// ASCA-2026 에는 search_* RPC 가 없다 — 검색은 테이블을 직접 읽어야 한다(예전엔 rpc 호출이 늘 실패했다)
const calls: { table: string; or?: string }[] = []
const rows: Record<string, unknown[]> = {
  notices: [
    {
      id: 'n1',
      title: '제22회 대한민국 동양서예대전',
      excerpt: '입상작 전시',
      content: '본문',
      published_at: '2025-06-18',
    },
  ],
  public_events: [
    { id: 'e1', title: '석당 손윤기 서예 개인전', description: '개인전', event_date: '2025-09-28' },
  ],
}

function builder(table: string) {
  const call: { table: string; or?: string } = { table }
  calls.push(call)
  const result = { data: rows[table] ?? [], error: null, count: (rows[table] ?? []).length }
  const chain: Record<string, unknown> = {}
  for (const method of ['select', 'eq', 'order', 'limit', 'range']) {
    chain[method] = () => chain
  }
  chain.or = (filter: string) => {
    call.or = filter
    return chain
  }
  chain.then = (resolve: (value: typeof result) => unknown) => resolve(result)
  return chain
}

const rpc = jest.fn()
jest.mock('../../supabase', () => ({
  ensureSupabase: () => ({ from: (table: string) => builder(table), rpc }),
}))

beforeEach(() => {
  calls.length = 0
  rpc.mockReset()
})

describe('toIlikeTerm', () => {
  it('PostgREST or() 를 깨는 문자를 지운다', () => {
    expect(toIlikeTerm('a,b)c(%d*_e')).toBe('a b c d e')
    expect(toIlikeTerm('  서예  ')).toBe('서예')
    expect(toIlikeTerm('%,()')).toBe('')
  })
})

describe('searchAllContent', () => {
  it('공지·행사는 테이블에서, 전시는 연혁에서 찾고 RPC 는 부르지 않는다', async () => {
    const results = await searchAllContent('大韓民國')
    expect(rpc).not.toHaveBeenCalled()
    expect(calls.map(c => c.table).sort()).toStrictEqual(['notices', 'public_events'])
    expect(calls.find(c => c.table === 'notices')?.or).toBe(
      'title.ilike.%大韓民國%,content.ilike.%大韓民國%'
    )
    // 행사는 본문이 비어 있을 수 있어 요약(description)도 찾는다
    expect(calls.find(c => c.table === 'public_events')?.or).toBe(
      'title.ilike.%大韓民國%,description.ilike.%大韓民國%,content.ilike.%大韓民國%'
    )
    expect(results.find(r => r.content_type === 'notice')?.url).toBe('/notice/n1')
    expect(results.find(r => r.content_type === 'event')?.url).toBe('/events/e1')
    const exhibitions = results.filter(r => r.content_type === 'exhibition')
    expect(exhibitions.length).toBeGreaterThan(10)
    expect(exhibitions.every(r => r.url === '/exhibitions')).toBe(true)
  })

  it('빈 검색어는 아무것도 조회하지 않는다', async () => {
    expect(await searchAllContent('  ,  ')).toStrictEqual([])
    expect(calls).toStrictEqual([])
  })
})

describe('searchNotices', () => {
  it('공지 테이블을 부분 일치로 읽는다', async () => {
    const { data, total } = await searchNotices('서예대전')
    expect(rpc).not.toHaveBeenCalled()
    expect(calls).toStrictEqual([
      { table: 'notices', or: 'title.ilike.%서예대전%,content.ilike.%서예대전%' },
    ])
    expect(data).toHaveLength(1)
    expect(total).toBe(1)
  })
})

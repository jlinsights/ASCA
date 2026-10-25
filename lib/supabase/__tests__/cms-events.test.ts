import { getEventById, getRelatedEvents } from '../cms'

// public_events 뷰의 실제 열 — 날짜는 event_date·end_date 뿐이고 start_date 는 없다.
// 없는 열로 정렬·필터하면 PostgREST 가 400(42703)을 내므로, 가짜 클라이언트도 똑같이 실패시킨다.
const PUBLIC_EVENT_COLUMNS = new Set([
  'id',
  'title',
  'event_date',
  'end_date',
  'event_type',
  'status',
  'is_published',
  'is_featured',
])

function builder(columnsUsed: string[]) {
  const result = { data: [{ id: 'e1', title: '가상 행사' }], error: null as unknown }
  const chain: Record<string, unknown> = {}
  const track = (column: string) => {
    columnsUsed.push(column)
    if (!PUBLIC_EVENT_COLUMNS.has(column)) {
      result.error = { code: '42703', message: `column public_events.${column} does not exist` }
    }
    return chain
  }
  chain.select = () => chain
  chain.limit = () => chain
  chain.eq = (column: string) => track(column)
  chain.neq = (column: string) => track(column)
  chain.order = (column: string) => track(column)
  chain.single = () => ({
    then: (resolve: (v: unknown) => unknown) => resolve({ ...result, data: result.data[0] }),
  })
  chain.then = (resolve: (value: typeof result) => unknown) => resolve(result)
  return chain
}

const columnsUsed: string[] = []
const rpc = jest.fn()
jest.mock('../../supabase', () => ({
  ensureSupabase: () => ({ from: () => builder(columnsUsed), rpc }),
}))

beforeEach(() => {
  columnsUsed.length = 0
  rpc.mockReset()
})

describe('행사 CMS 조회', () => {
  // 회귀: start_date 로 정렬해 관련 행사 요청이 늘 400 이었고, 상세 페이지 전체가 오류 화면이 됐다
  it('관련 행사는 public_events 에 있는 열로만 정렬·필터한다', async () => {
    await expect(getRelatedEvents('e0', 'meeting')).resolves.toHaveLength(1)
    expect(columnsUsed).toContain('event_date')
    expect(columnsUsed).not.toContain('start_date')
  })

  // 회귀: getEventById 와 상세 페이지가 각각 조회수를 올려 한 번 방문에 2씩 올랐다
  it('행사 하나를 읽을 때 조회수를 올리지 않는다', async () => {
    await getEventById('e1')
    expect(rpc).not.toHaveBeenCalled()
  })
})

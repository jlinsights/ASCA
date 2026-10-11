const rpc = jest.fn()
const insert = jest.fn()
const from = jest.fn(() => ({ insert }))

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ rpc, from }),
}))

// Airtable 샘플: 기존에 없는 필드(new_field) 1개 + 기존 text 컬럼과 타입이 다르게 추론되는 필드(name: 42 → number) 1개
jest.mock('airtable', () =>
  jest.fn().mockImplementation(() => ({
    base: () => () => ({
      select: () => ({
        firstPage: async () => [{ fields: { name: 42, new_field: 'x' } }],
      }),
    }),
  }))
)

import { SyncEngine } from '../sync-engine'

describe('SyncEngine schema sync', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    process.env.AIRTABLE_API_KEY = 'key'
    process.env.AIRTABLE_BASE_ID = 'base'
    rpc.mockReset()
    insert.mockReset()
    rpc.mockImplementation(async (fn: string) =>
      fn === 'get_table_columns'
        ? { data: [{ column_name: 'name', data_type: 'text' }], error: null }
        : { data: null, error: null }
    )
    insert.mockResolvedValue({ error: null })
  })

  // 샘플 10건으로 추론한 타입으로 운영 테이블을 ALTER/DROP 하면 안 된다 — 구조 변경은 마이그레이션으로만
  it('never runs DDL through the execute_sql RPC', async () => {
    await new SyncEngine().syncTableSchema('Artists')
    expect(rpc).not.toHaveBeenCalledWith('execute_sql', expect.anything())
  })

  it('records detected differences in sync_logs instead of applying them', async () => {
    await new SyncEngine().syncTableSchema('Artists')
    expect(from).toHaveBeenCalledWith('sync_logs')
    const logged = insert.mock.calls.map(([row]) => row)
    expect(logged.length).toBeGreaterThan(0)
    expect(logged.every(row => row.status === 'detected' && row.sync_type === 'schema')).toBe(true)
    expect(logged.map(row => row.operation)).toEqual(
      expect.arrayContaining(['add_column', 'modify_column'])
    )
  })
})

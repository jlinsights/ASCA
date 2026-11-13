/** @jest-environment node */
import { createSupabaseSignupStore } from '../signup-store'

jest.mock('server-only', () => ({}))

type Call = { table: string; op: string; args: unknown[] }

function fakeAdmin(tables: Record<string, Record<string, unknown>[]>, users: unknown[]) {
  const calls: Call[] = []
  const from = (table: string) => {
    const chain: Record<string, unknown> = {}
    let range: [number, number] = [0, Infinity]
    for (const op of ['select', 'order', 'upsert']) {
      chain[op] = (...args: unknown[]) => {
        calls.push({ table, op, args })
        return chain
      }
    }
    chain.range = (a: number, b: number) => {
      range = [a, b]
      return chain
    }
    chain.then = (resolve: (v: unknown) => unknown) =>
      resolve({ data: (tables[table] ?? []).slice(range[0], range[1] + 1), error: null })
    return chain
  }
  const listUsers = jest.fn(async ({ page }: { page: number }) => ({
    data: { users: page === 1 ? users : [] },
    error: null,
  }))
  return { admin: { from, auth: { admin: { listUsers } } } as never, calls }
}

describe('createSupabaseSignupStore', () => {
  it('joins confirmed users with their profile name and disabled flag', async () => {
    const { admin } = fakeAdmin(
      {
        account_profiles: [
          { id: 'u1', display_name: '홍길동', disabled_at: null },
          { id: 'u2', display_name: '정지', disabled_at: '2026-11-01T00:00:00Z' },
          { id: 'u3', display_name: '미확인', disabled_at: null },
        ],
      },
      [
        { id: 'u1', email: 'a@x.org', email_confirmed_at: 'x', created_at: '2026-11-02T00:00:00Z' },
        { id: 'u2', email: 'b@x.org', email_confirmed_at: 'x', created_at: '2026-11-02T00:00:00Z' },
        {
          id: 'u3',
          email: 'c@x.org',
          email_confirmed_at: null,
          created_at: '2026-11-02T00:00:00Z',
        },
        { id: 'u4', email: 'd@x.org', email_confirmed_at: 'x', created_at: '2026-11-02T00:00:00Z' },
        {
          id: 'u5',
          email_confirmed_at: 'x',
          is_anonymous: true,
          created_at: '2026-11-02T00:00:00Z',
        },
      ]
    )
    const accounts = await createSupabaseSignupStore(admin).listSignupAccounts()
    expect(accounts).toEqual([
      {
        id: 'u1',
        email: 'a@x.org',
        name: '홍길동',
        createdAt: '2026-11-02T00:00:00Z',
        disabled: false,
      },
      {
        id: 'u2',
        email: 'b@x.org',
        name: '정지',
        createdAt: '2026-11-02T00:00:00Z',
        disabled: true,
      },
    ])
  })

  it('treats linked and already-submitted accounts as handled, paging past 1000 rows', async () => {
    const links = Array.from({ length: 1001 }, (_, i) => ({ account_id: `l${i}` }))
    const { admin } = fakeAdmin(
      { donus_member_links: links, donus_signup_submissions: [{ account_id: 's1' }] },
      []
    )
    const handled = await createSupabaseSignupStore(admin).listHandledAccountIds()
    expect(handled.size).toBe(1002)
    expect(handled.has('l1000')).toBe(true)
    expect(handled.has('s1')).toBe(true)
  })

  it('upserts submission records on account_id without contact details', async () => {
    const { admin, calls } = fakeAdmin({}, [])
    await createSupabaseSignupStore(admin).recordSubmissions([
      { account_id: 'u1', member_idx: 5, is_new: true },
    ])
    const upsert = calls.find(c => c.op === 'upsert')
    expect(upsert?.table).toBe('donus_signup_submissions')
    expect(upsert?.args[1]).toEqual({ onConflict: 'account_id' })
    const row = (upsert?.args[0] as Record<string, unknown>[])[0]
    expect(Object.keys(row).sort()).toEqual(['account_id', 'is_new', 'member_idx', 'submitted_at'])
  })
})

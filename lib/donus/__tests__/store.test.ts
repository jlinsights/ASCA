/** @jest-environment node */
import { createSupabaseLinkStore } from '../store'

jest.mock('server-only', () => ({}))

type Call = { op: string; args: unknown[] }

function fakeAdmin(
  userPages: {
    id: string
    email?: string
    email_confirmed_at?: string | null
    is_anonymous?: boolean
  }[][]
) {
  const calls: Call[] = []
  const query = (result: unknown = { data: [], error: null }) => {
    const chain: Record<string, unknown> = {}
    for (const op of ['select', 'delete', 'upsert', 'update', 'in', 'eq', 'order']) {
      chain[op] = (...args: unknown[]) => {
        calls.push({ op, args })
        return chain
      }
    }
    chain.then = (resolve: (v: unknown) => unknown) => resolve(result)
    return chain
  }
  const listUsers = jest.fn(async ({ page }: { page: number }) => ({
    data: { users: userPages[page - 1] ?? [] },
    error: null,
  }))
  const admin = {
    auth: { admin: { listUsers } },
    from: (table: string) => {
      calls.push({ op: 'from', args: [table] })
      return query()
    },
  }
  return { admin: admin as never, calls, listUsers }
}

describe('createSupabaseLinkStore', () => {
  it('pages through auth users and keeps only confirmed, non-anonymous emails', async () => {
    const full = Array.from({ length: 1000 }, (_, i) => ({
      id: `u${i}`,
      email: `u${i}@x.org`,
      email_confirmed_at: '2026-01-01',
    }))
    const { admin, listUsers } = fakeAdmin([
      full,
      [
        { id: 'unconfirmed', email: 'n@x.org', email_confirmed_at: null },
        { id: 'anon', email_confirmed_at: '2026-01-01', is_anonymous: true },
        { id: 'ok', email: 'ok@x.org', email_confirmed_at: '2026-01-01' },
      ],
    ])
    const accounts = await createSupabaseLinkStore(admin).listAccounts()
    expect(listUsers).toHaveBeenCalledTimes(2)
    expect(accounts).toHaveLength(1001)
    expect(accounts.at(-1)).toEqual({ id: 'ok', email: 'ok@x.org' })
    expect(accounts.find(a => a.id === 'unconfirmed' || a.id === 'anon')).toBeUndefined()
  })

  it('reads every link page by page in a stable order', async () => {
    const calls: { op: string; args: unknown[] }[] = []
    const page = (from: number, size: number) =>
      Array.from({ length: size }, (_, i) => ({
        account_id: `a${from + i}`,
        member_idx: from + i + 1,
        member_code: 'C',
        link_source: i === 0 ? 'manual' : 'email',
        dues_paid_year: null,
        synced_at: '2026-01-01',
      }))
    const admin = {
      from: () => {
        const chain: Record<string, unknown> = {}
        let result: unknown
        chain.select = () => chain
        chain.order = (...args: unknown[]) => {
          calls.push({ op: 'order', args })
          return chain
        }
        chain.range = (from: number, to: number) => {
          calls.push({ op: 'range', args: [from, to] })
          result = { data: page(from, from === 0 ? 1000 : 3), error: null }
          return chain
        }
        chain.then = (resolve: (v: unknown) => unknown) => resolve(result)
        return chain
      },
    }
    const links = await createSupabaseLinkStore(admin as never).listLinks()
    expect(links).toHaveLength(1003)
    expect(calls.filter(c => c.op === 'range').map(c => c.args)).toEqual([
      [0, 999],
      [1000, 1999],
    ])
    expect(calls.find(c => c.op === 'order')?.args[0]).toBe('account_id')
    expect(links[1000].link_source).toBe('manual')
  })

  it('only ever deletes email links', async () => {
    const { admin, calls } = fakeAdmin([])
    await createSupabaseLinkStore(admin).removeLinks(['a', 'b'])
    expect(calls).toEqual([
      { op: 'from', args: ['donus_member_links'] },
      { op: 'delete', args: [] },
      { op: 'in', args: ['account_id', ['a', 'b']] },
      { op: 'eq', args: ['link_source', 'email'] },
    ])
  })

  it('upserts on account_id and updates statuses one row at a time', async () => {
    const { admin, calls } = fakeAdmin([])
    const store = createSupabaseLinkStore(admin)
    await store.upsertLinks([
      { account_id: 'a', member_idx: 1, member_code: 'C1', link_source: 'email' },
    ])
    const upsert = calls.find(c => c.op === 'upsert')
    expect(upsert?.args[1]).toEqual({ onConflict: 'account_id' })
    expect((upsert?.args[0] as { member_idx: number }[])[0]).toMatchObject({
      account_id: 'a',
      member_idx: 1,
    })

    await store.updateStatuses([
      { account_id: 'a', lifecycle: 3, last_pay_date: null, dues_paid_year: 2026 },
      { account_id: 'b', lifecycle: null, last_pay_date: null, dues_paid_year: null },
    ])
    const updates = calls.filter(c => c.op === 'update')
    expect(updates).toHaveLength(2)
    expect(updates[0].args[0]).toMatchObject({ lifecycle: 3, dues_paid_year: 2026 })
    expect(updates[0].args[0]).not.toHaveProperty('account_id')
  })
})

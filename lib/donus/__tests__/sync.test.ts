/** @jest-environment node */
import type { DonusMemberDetail, DonusMemberSummary, DonusPayment } from '../client'
import type { AccountEmail, MemberLink } from '../member-links'
import {
  DUES_LOOKBACK_YEARS,
  kstToday,
  runDonusSync,
  STATUS_BATCH,
  type LinkStore,
  type MemberStatus,
} from '../sync'

type Row = MemberLink & Partial<Omit<MemberStatus, 'account_id'>> & { synced_at?: string }

function memoryStore(accounts: AccountEmail[], rows: Row[] = []) {
  const table = new Map(rows.map(r => [r.account_id, { ...r }]))
  const calls: string[] = []
  const store: LinkStore = {
    listAccounts: async () => accounts,
    listLinks: async () =>
      [...table.values()].map(
        ({
          account_id,
          member_idx,
          member_code,
          link_source,
          dues_paid_year,
          dues_history_checked,
          synced_at,
        }) => ({
          account_id,
          member_idx,
          member_code,
          link_source,
          dues_paid_year: dues_paid_year ?? null,
          dues_history_checked: dues_history_checked ?? false,
          synced_at: synced_at ?? '2026-01-01T00:00:00Z',
        })
      ),
    removeLinks: async ids => {
      calls.push('remove')
      for (const id of ids) if (table.get(id)?.link_source === 'email') table.delete(id)
    },
    upsertLinks: async links => {
      calls.push('upsert')
      for (const l of links) {
        const clash = [...table.values()].find(
          r => r.member_idx === l.member_idx && r.account_id !== l.account_id
        )
        if (clash) throw new Error('member_idx unique violation')
        table.set(l.account_id, { ...table.get(l.account_id), ...l })
      }
    },
    updateStatuses: async statuses => {
      calls.push('status')
      for (const { account_id, ...s } of statuses) {
        const row = table.get(account_id)
        if (row) table.set(account_id, { ...row, ...s })
      }
    },
  }
  return { store, table, calls }
}

function fakeClient({
  members = [] as DonusMemberSummary[],
  details = {} as Record<number, DonusMemberDetail | Error>,
  payments = {} as Record<number, DonusPayment[]>,
  failWindow = -1,
} = {}) {
  let calls = 0
  let window = 0
  const windows: string[] = []
  return {
    windows,
    client: {
      membersCreated: jest.fn(async (start: string, end: string, _stopAt?: number) => {
        calls++
        windows.push(`${start}..${end}`)
        if (window++ === failWindow) throw new Error('Donus down')
        return window === 1 ? members : []
      }),
      member: jest.fn(async (idx: number) => {
        calls++
        const d = details[idx]
        if (d instanceof Error) throw d
        return d ?? { memberIdx: idx, memberCode: `C${idx}` }
      }),
      payments: jest.fn(async (idx: number, start: string) => {
        calls++
        return (payments[idx] ?? []).filter(p => p.payDate?.slice(0, 4) === start.slice(0, 4))
      }),
      callCount: () => calls,
    },
  }
}

const since = '2026-01-01'
const today = '2026-03-15'
const noDues = new Set<string>()

describe('runDonusSync', () => {
  it('reads every 30-day window from since to today before writing', async () => {
    const { client, windows } = fakeClient()
    const { store } = memoryStore([])
    await runDonusSync({ client, store, since, today, duesCodes: noDues })
    expect(windows).toEqual([
      '2026-01-01..2026-01-30',
      '2026-01-31..2026-03-01',
      '2026-03-02..2026-03-15',
    ])
  })

  it('writes nothing when any Donus window fails', async () => {
    const { client } = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
      failWindow: 2,
    })
    const { store, calls, table } = memoryStore(
      [{ id: 'acc-a', email: 'a@x.org' }],
      [{ account_id: 'acc-old', member_idx: 9, member_code: 'C9', link_source: 'email' }]
    )
    await expect(runDonusSync({ client, store, since, today, duesCodes: noDues })).rejects.toThrow(
      'Donus down'
    )
    expect(calls).toEqual([])
    expect(table.has('acc-old')).toBe(true)
  })

  it('links by email, stores lifecycle and last pay date, and reports counts only', async () => {
    const { client } = fakeClient({
      members: [
        { memberIdx: 1, memberCode: 'C1', email: 'A@x.org', name: '홍길동', cellphone: '010' },
        { memberIdx: 2, memberCode: 'C2', email: 'dup@x.org' },
        { memberIdx: 3, memberCode: 'C3', email: 'dup@x.org' },
      ],
      details: { 1: { memberIdx: 1, memberCode: 'C1', lifecycle: 3, lastPayDate: '2026-01-20' } },
    })
    const { store, table } = memoryStore([
      { id: 'acc-a', email: 'a@x.org' },
      { id: 'acc-d', email: 'dup@x.org' },
    ])
    const report = await runDonusSync({ client, store, since, today, duesCodes: noDues })
    expect(table.get('acc-a')).toMatchObject({
      member_idx: 1,
      lifecycle: 3,
      last_pay_date: '2026-01-20',
    })
    expect(table.has('acc-d')).toBe(false)
    expect(report).toMatchObject({
      donusMembers: 3,
      ambiguousEmails: 1,
      matched: 1,
      unmatched: 1,
      linksUpserted: 1,
      statusesUpdated: 1,
      duesConfigured: false,
    })
    expect(JSON.stringify(report)).not.toMatch(/홍길동|@x\.org|010/)
  })

  it('removes before upserting so a member can move between accounts', async () => {
    const { client } = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'b@x.org' }],
    })
    const { store, table, calls } = memoryStore(
      [
        { id: 'acc-a', email: 'a@x.org' },
        { id: 'acc-b', email: 'b@x.org' },
      ],
      [{ account_id: 'acc-a', member_idx: 1, member_code: 'C1', link_source: 'email' }]
    )
    await runDonusSync({ client, store, since, today, duesCodes: noDues })
    expect(calls.slice(0, 2)).toEqual(['remove', 'upsert'])
    expect(table.has('acc-a')).toBe(false)
    expect(table.get('acc-b')?.member_idx).toBe(1)
  })

  it('computes the dues year from this year, then falls back to last year', async () => {
    const paid = (payDate: string) => ({
      paymentIdx: 1,
      memberIdx: 1,
      payDate,
      productCode: 'DUES',
      incomeStatus: 3,
    })
    const { client } = fakeClient({
      members: [
        { memberIdx: 1, memberCode: 'C1', email: 'a@x.org' },
        { memberIdx: 2, memberCode: 'C2', email: 'b@x.org' },
      ],
      payments: { 1: [paid('2026-01-10')], 2: [paid('2025-01-28')] },
    })
    const { store, table } = memoryStore([
      { id: 'acc-a', email: 'a@x.org' },
      { id: 'acc-b', email: 'b@x.org' },
    ])
    const report = await runDonusSync({ client, store, since, today, duesCodes: new Set(['DUES']) })
    expect(table.get('acc-a')?.dues_paid_year).toBe(2026)
    expect(table.get('acc-b')?.dues_paid_year).toBe(2025)
    expect(report.duesConfigured).toBe(true)
  })

  it('keeps the previous dues year while dues codes are not configured', async () => {
    const { client } = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
    })
    const { store, table } = memoryStore(
      [{ id: 'acc-a', email: 'a@x.org' }],
      [
        {
          account_id: 'acc-a',
          member_idx: 1,
          member_code: 'C1',
          link_source: 'email',
          dues_paid_year: 2025,
        },
      ]
    )
    await runDonusSync({ client, store, since, today, duesCodes: noDues })
    expect(table.get('acc-a')?.dues_paid_year).toBe(2025)
    expect(client.payments).not.toHaveBeenCalled()
  })

  it('keeps going when one member detail fails, and keeps manual links', async () => {
    const { client } = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
      details: { 1: new Error('404'), 5: { memberIdx: 5, memberCode: 'C5', lifecycle: 5 } },
    })
    const { store, table } = memoryStore(
      [
        { id: 'acc-a', email: 'a@x.org' },
        { id: 'acc-m', email: null },
      ],
      [{ account_id: 'acc-m', member_idx: 5, member_code: 'C5', link_source: 'manual' }]
    )
    const report = await runDonusSync({ client, store, since, today, duesCodes: noDues })
    expect(report.statusFailures).toBe(1)
    expect(report.manualLinks).toBe(1)
    expect(table.get('acc-m')).toMatchObject({ link_source: 'manual', lifecycle: 5 })
    expect(table.get('acc-a')?.lifecycle).toBeUndefined()
  })

  it('drops an out-of-range lifecycle and a malformed pay date', async () => {
    const { client } = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
      details: { 1: { memberIdx: 1, memberCode: 'C1', lifecycle: 9, lastPayDate: 'soon' } },
    })
    const { store, table } = memoryStore([{ id: 'acc-a', email: 'a@x.org' }])
    await runDonusSync({ client, store, since, today, duesCodes: noDues })
    expect(table.get('acc-a')).toMatchObject({ lifecycle: null, last_pay_date: null })
  })
})

describe('runDonusSync — review fixes', () => {
  const email = (n: number) => ({ memberIdx: n, memberCode: `C${n}`, email: `m${n}@x.org` })

  it('lets two accounts swap members without a unique-key failure', async () => {
    const { client } = fakeClient({
      members: [
        { memberIdx: 1, memberCode: 'C1', email: 'b@x.org' },
        { memberIdx: 2, memberCode: 'C2', email: 'a@x.org' },
      ],
    })
    const { store, table } = memoryStore(
      [
        { id: 'acc-a', email: 'a@x.org' },
        { id: 'acc-b', email: 'b@x.org' },
      ],
      [
        { account_id: 'acc-a', member_idx: 1, member_code: 'C1', link_source: 'email' },
        { account_id: 'acc-b', member_idx: 2, member_code: 'C2', link_source: 'email' },
      ]
    )
    await runDonusSync({ client, store, since, today, duesCodes: noDues })
    expect(table.get('acc-a')?.member_idx).toBe(2)
    expect(table.get('acc-b')?.member_idx).toBe(1)
  })

  it('does not carry the old dues year or status to a different member', async () => {
    const { client } = fakeClient({
      members: [{ memberIdx: 2, memberCode: 'C2', email: 'a@x.org' }],
      details: { 2: new Error('detail down') },
    })
    const { store, table } = memoryStore(
      [{ id: 'acc-a', email: 'a@x.org' }],
      [
        {
          account_id: 'acc-a',
          member_idx: 1,
          member_code: 'C1',
          link_source: 'email',
          dues_paid_year: 2025,
          lifecycle: 3,
        },
      ]
    )
    await runDonusSync({ client, store, since, today, duesCodes: noDues })
    const row = table.get('acc-a')
    expect(row?.member_idx).toBe(2)
    expect(row?.dues_paid_year).toBeUndefined()
    expect(row?.lifecycle).toBeUndefined()
  })

  it('stops at the deadline, saves what it read, and starts with the stalest next time', async () => {
    const accounts = [1, 2, 3, 4].map(n => ({ id: `acc-${n}`, email: `m${n}@x.org` }))
    const rows = [1, 2, 3, 4].map(n => ({
      account_id: `acc-${n}`,
      member_idx: n,
      member_code: `C${n}`,
      link_source: 'email' as const,
      synced_at: `2026-03-0${5 - n}T00:00:00Z`, // acc-4 is the stalest
    }))
    const { client } = fakeClient({ members: [1, 2, 3, 4].map(email) })
    const { store, table } = memoryStore(accounts, rows)
    let t = 0
    const now = () => {
      t += 1
      return t
    }
    const report = await runDonusSync({
      client,
      store,
      since,
      today,
      duesCodes: noDues,
      // 구성원 조회(3구간 + 끝난 뒤 한 번)가 시계를 1~4 로 돌린 뒤, 상태는 5·6 에서 두 명만 한다
      deadline: 6,
      now,
    })
    expect(report.statusesUpdated).toBe(2)
    expect(report.statusesDeferred).toBe(2)
    expect(client.member.mock.calls.map(c => c[0])).toEqual([4, 3])
    expect(table.get('acc-4')).toHaveProperty('lifecycle')
    expect(table.get('acc-1')).not.toHaveProperty('lifecycle')
  })

  it('saves statuses in batches while it goes', async () => {
    const n = STATUS_BATCH + 5
    const ids = Array.from({ length: n }, (_, i) => i + 1)
    const { client } = fakeClient({ members: ids.map(email) })
    const { store, calls } = memoryStore(ids.map(i => ({ id: `acc-${i}`, email: `m${i}@x.org` })))
    const report = await runDonusSync({ client, store, since, today, duesCodes: noDues })
    expect(report.statusesUpdated).toBe(n)
    expect(calls.filter(c => c === 'status')).toHaveLength(2)
  })
})

describe('runDonusSync — second review fixes', () => {
  it('keeps a stored dues year older than last year for the same member', async () => {
    const { client } = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
    })
    const { store, table } = memoryStore(
      [{ id: 'acc-a', email: 'a@x.org' }],
      [
        {
          account_id: 'acc-a',
          member_idx: 1,
          member_code: 'C1',
          link_source: 'email',
          dues_paid_year: 2023,
        },
      ]
    )
    await runDonusSync({ client, store, since, today, duesCodes: new Set(['DUES']) })
    expect(table.get('acc-a')?.dues_paid_year).toBe(2023)
  })

  it('fails without writing when the member read runs past its budget', async () => {
    const { client } = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
    })
    const { store, calls } = memoryStore([{ id: 'acc-a', email: 'a@x.org' }])
    let t = 0
    await expect(
      runDonusSync({
        client,
        store,
        since,
        today,
        duesCodes: noDues,
        readDeadline: 1,
        now: () => ++t,
      })
    ).rejects.toThrow('DONUS_SYNC_SINCE')
    expect(calls).toEqual([])
  })
})

describe('runDonusSync — third review fixes', () => {
  it('keeps the link of a member registered before the since date', async () => {
    const { client } = fakeClient({ members: [] })
    const { store, table } = memoryStore(
      [{ id: 'acc-a', email: 'a@x.org' }],
      [
        {
          account_id: 'acc-a',
          member_idx: 7,
          member_code: 'C7',
          link_source: 'email',
          dues_paid_year: 2025,
        },
      ]
    )
    const report = await runDonusSync({ client, store, since, today, duesCodes: noDues })
    expect(table.get('acc-a')?.member_idx).toBe(7)
    expect(report).toMatchObject({ keptUnseen: 1, linksRemoved: 0, statusesUpdated: 1 })
  })

  it('looks back further for a new link, but only two years for an existing one', async () => {
    const paid = (payDate: string) => ({
      paymentIdx: 1,
      memberIdx: 1,
      payDate,
      productCode: 'DUES',
      incomeStatus: 3,
    })
    const { client } = fakeClient({
      members: [
        { memberIdx: 1, memberCode: 'C1', email: 'new@x.org' },
        { memberIdx: 2, memberCode: 'C2', email: 'old@x.org' },
      ],
      payments: { 1: [paid('2021-01-20')], 2: [paid('2021-01-20')] },
    })
    const { store, table } = memoryStore(
      [
        { id: 'acc-new', email: 'new@x.org' },
        { id: 'acc-old', email: 'old@x.org' },
      ],
      [
        {
          account_id: 'acc-old',
          member_idx: 2,
          member_code: 'C2',
          link_source: 'email',
          dues_history_checked: true,
        },
      ]
    )
    await runDonusSync({ client, store, since: '2015-01-01', today, duesCodes: new Set(['DUES']) })
    expect(table.get('acc-new')?.dues_paid_year).toBe(2021)
    expect(table.get('acc-old')?.dues_paid_year).toBeNull()
    const years = (idx: number) =>
      client.payments.mock.calls
        .filter(c => c[0] === idx)
        .map(c => Number(String(c[1]).slice(0, 4)))
    expect(years(1)).toEqual([2026, 2025, 2024, 2023, 2022, 2021])
    expect(years(2)).toEqual([2026, 2025])
  })

  it('never looks back more than DUES_LOOKBACK_YEARS or before the since year', async () => {
    const { client } = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
    })
    const { store } = memoryStore([{ id: 'acc-a', email: 'a@x.org' }])
    await runDonusSync({ client, store, since: '2000-01-01', today, duesCodes: new Set(['DUES']) })
    expect(client.payments).toHaveBeenCalledTimes(DUES_LOOKBACK_YEARS)
    // 가짜 클라이언트는 첫 구간에만 구성원을 주므로 두 번째 실행은 새로 만든다
    const again = fakeClient({ members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }] })
    const second = memoryStore([{ id: 'acc-a', email: 'a@x.org' }])
    await runDonusSync({
      client: again.client,
      store: second.store,
      since: '2025-06-01',
      today,
      duesCodes: new Set(['DUES']),
    })
    expect(again.client.payments).toHaveBeenCalledTimes(2)
  })
})

describe('runDonusSync — fourth review fixes', () => {
  const paid = (payDate: string) => ({
    paymentIdx: 1,
    memberIdx: 1,
    payDate,
    productCode: 'DUES',
    incomeStatus: 3,
  })
  const years = (client: ReturnType<typeof fakeClient>['client']) =>
    client.payments.mock.calls.map(c => Number(String(c[1]).slice(0, 4)))

  it('retries the long dues lookup on the next run when it failed the first time', async () => {
    const first = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
      details: { 1: new Error('detail down') },
    })
    const { store, table } = memoryStore([{ id: 'acc-a', email: 'a@x.org' }])
    await runDonusSync({
      client: first.client,
      store,
      since: '2015-01-01',
      today,
      duesCodes: new Set(['DUES']),
    })
    expect(table.get('acc-a')?.dues_history_checked).toBeUndefined()

    const second = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
      payments: { 1: [paid('2021-01-20')] },
    })
    await runDonusSync({
      client: second.client,
      store,
      since: '2015-01-01',
      today,
      duesCodes: new Set(['DUES']),
    })
    expect(table.get('acc-a')).toMatchObject({ dues_paid_year: 2021, dues_history_checked: true })
    expect(years(second.client)).toEqual([2026, 2025, 2024, 2023, 2022, 2021])
  })

  it('does the long lookup once dues codes are configured, then only two years', async () => {
    const run = async (codes: Set<string>) => {
      const c = fakeClient({
        members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
        payments: { 1: [paid('2020-01-20')] },
      })
      await runDonusSync({ client: c.client, store, since: '2015-01-01', today, duesCodes: codes })
      return c.client
    }
    const { store, table } = memoryStore([{ id: 'acc-a', email: 'a@x.org' }])
    await run(new Set())
    expect(table.get('acc-a')?.dues_history_checked).toBe(false)
    const withCodes = await run(new Set(['DUES']))
    expect(years(withCodes)).toHaveLength(7)
    expect(table.get('acc-a')).toMatchObject({ dues_paid_year: 2020, dues_history_checked: true })
    const later = await run(new Set(['DUES']))
    expect(years(later)).toEqual([2026, 2025])
    expect(table.get('acc-a')?.dues_paid_year).toBe(2020)
  })
})

describe('runDonusSync — member read budget', () => {
  it('does not write when the last window finishes after the read budget', async () => {
    let t = 0
    const { client } = fakeClient({
      members: [{ memberIdx: 1, memberCode: 'C1', email: 'a@x.org' }],
    })
    // 각 구간 조회가 시계를 크게 돌린다 — 마지막 구간은 예산 안에서 시작해 넘겨서 끝난다
    const slow = client.membersCreated.getMockImplementation()!
    client.membersCreated.mockImplementation(async (...args: Parameters<typeof slow>) => {
      t += 10
      return slow(...args)
    })
    const { store, calls } = memoryStore([{ id: 'acc-a', email: 'a@x.org' }])
    await expect(
      runDonusSync({
        client,
        store,
        since,
        today,
        duesCodes: noDues,
        readDeadline: 25,
        now: () => t,
      })
    ).rejects.toThrow('DONUS_SYNC_SINCE')
    expect(client.membersCreated).toHaveBeenCalledTimes(3)
    expect(calls).toEqual([])
  })

  it('passes the read deadline to each window so pages stop too', async () => {
    const { client } = fakeClient()
    const { store } = memoryStore([])
    await runDonusSync({
      client,
      store,
      since,
      today,
      duesCodes: noDues,
      readDeadline: 12345,
      now: () => 0,
    })
    expect(client.membersCreated.mock.calls.every(c => c[2] === 12345)).toBe(true)
  })
})

describe('kstToday', () => {
  it('uses Korean time, not UTC', () => {
    expect(kstToday(new Date('2026-11-13T16:30:00Z'))).toBe('2026-11-14')
    expect(kstToday(new Date('2026-11-13T14:59:00Z'))).toBe('2026-11-13')
  })
})

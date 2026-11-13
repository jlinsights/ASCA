/** @jest-environment node */
import { DonusApiError, TIME_BUDGET_USED } from '../client'
import {
  planSignups,
  RECORD_BATCH,
  runDonusSignups,
  type SignupAccount,
  type SignupStore,
  type SignupSubmission,
} from '../signups'

const account = (n: number, over: Partial<SignupAccount> = {}): SignupAccount => ({
  id: `acc-${n}`,
  email: `m${n}@x.org`,
  name: `회원${n}`,
  createdAt: `2026-11-${String(10 + n).padStart(2, '0')}T03:00:00Z`,
  disabled: false,
  ...over,
})

function memoryStore(accounts: SignupAccount[], handled: string[] = []) {
  const recorded: SignupSubmission[] = []
  const calls: string[] = []
  const store: SignupStore = {
    listSignupAccounts: async () => accounts,
    listHandledAccountIds: async () => new Set(handled),
    recordSubmissions: async rows => {
      calls.push('record')
      recorded.push(...rows)
    },
  }
  return { store, recorded, calls }
}

function fakeClient(fail: Record<string, Error> = {}) {
  let calls = 0
  const submitMember = jest.fn(async ({ email }: { name: string; email: string }) => {
    calls++
    if (fail[email]) throw fail[email]
    return { memberIdx: 100 + calls, isNew: !email.startsWith('old') }
  })
  return { submitMember, callCount: () => calls }
}

const since = '2026-11-01'

describe('planSignups', () => {
  it('sends confirmed, enabled, unhandled accounts created since the KST date, oldest first', () => {
    const { send } = planSignups(
      [
        account(3),
        account(1),
        account(2, { disabled: true }),
        account(4),
        // 2026-11-01 00:00 KST 는 2026-10-31T15:00Z — 그 직전 가입은 보내지 않는다
        account(5, { createdAt: '2026-10-31T14:59:59Z' }),
        account(6, { createdAt: '2026-10-31T15:00:00Z' }),
        account(7, { email: null }),
      ],
      new Set(['acc-4']),
      since
    )
    expect(send.map(s => s.accountId)).toEqual(['acc-6', 'acc-1', 'acc-3'])
    expect(send[1].member).toEqual({ name: '회원1', email: 'm1@x.org' })
  })

  it('normalizes the email, trims and cuts the name, and skips a blank name', () => {
    const { send, skippedNoName } = planSignups(
      [
        account(1, { email: '  M1@X.org ', name: `  ${'가'.repeat(40)}  ` }),
        account(2, { name: '   ' }),
      ],
      new Set(),
      since
    )
    expect(send).toEqual([
      { accountId: 'acc-1', member: { name: '가'.repeat(33), email: 'm1@x.org' } },
    ])
    expect(skippedNoName).toBe(1)
  })

  it('rejects a malformed since date', () => {
    expect(() => planSignups([], new Set(), '2026/11/01')).toThrow('YYYY-MM-DD')
    expect(() => planSignups([], new Set(), '2026-13-45')).toThrow('YYYY-MM-DD')
  })
})

describe('runDonusSignups', () => {
  it('records only what Donus accepted, so failures are sent again next run', async () => {
    const client = fakeClient({
      'm2@x.org': new DonusApiError('Donus form submit failed (500)', 500),
    })
    const { store, recorded } = memoryStore([account(1), account(2), account(3)])
    const report = await runDonusSignups({ client, store, since })
    expect(recorded.map(r => r.account_id)).toEqual(['acc-1', 'acc-3'])
    expect(recorded[0]).toEqual({ account_id: 'acc-1', member_idx: 101, is_new: true })
    expect(report).toMatchObject({ candidates: 3, submitted: 2, failures: 1, deferred: 0 })
  })

  it('counts an existing Donus member separately from a new one', async () => {
    const client = fakeClient()
    const { store } = memoryStore([account(1), account(2, { email: 'old@x.org' })])
    const report = await runDonusSignups({ client, store, since })
    expect(report).toMatchObject({ submitted: 2, newMembers: 1, matchedExisting: 1 })
  })

  it('defers, not fails, when the time budget stops a send', async () => {
    const client = fakeClient({ 'm1@x.org': new DonusApiError(TIME_BUDGET_USED, 0) })
    const { store, recorded } = memoryStore([account(1)])
    const report = await runDonusSignups({ client, store, since })
    expect(report).toMatchObject({ failures: 0, deferred: 1, submitted: 0 })
    expect(recorded).toEqual([])
  })

  it('stops at the deadline and at the per-run cap', async () => {
    const client = fakeClient()
    const { store } = memoryStore([1, 2, 3, 4].map(n => account(n)))
    let t = 0
    const atDeadline = await runDonusSignups({
      client,
      store,
      since,
      deadline: 2,
      now: () => ++t,
    })
    expect(atDeadline).toMatchObject({ submitted: 2, deferred: 2 })

    const capped = await runDonusSignups({ client: fakeClient(), store, since, maxPerRun: 3 })
    expect(capped).toMatchObject({ submitted: 3, deferred: 1 })
  })

  it('saves records in batches while it goes', async () => {
    const n = RECORD_BATCH + 3
    const { store, calls } = memoryStore(
      Array.from({ length: n }, (_, i) => account(i % 9, { id: `a${i}`, email: `u${i}@x.org` }))
    )
    const report = await runDonusSignups({ client: fakeClient(), store, since })
    expect(report.submitted).toBe(n)
    expect(calls).toEqual(['record', 'record'])
  })
})

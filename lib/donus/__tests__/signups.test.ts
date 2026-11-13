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
  const failedAt = new Map<string, string>()
  const calls: string[] = []
  // 쓸 때마다 늦어지는 시각
  let tick = 0
  const stamp = () => `2099-01-01T00:00:${String(tick++).padStart(2, '0')}Z`
  const store: SignupStore = {
    listSignupAccounts: async () => accounts,
    listHandledAccountIds: async () => new Set([...handled, ...recorded.map(r => r.account_id)]),
    listFailedAttempts: async () => new Map(failedAt),
    recordSubmissions: async rows => {
      calls.push('record')
      recorded.push(...rows)
      for (const row of rows) failedAt.delete(row.account_id)
    },
    recordFailures: async ids => {
      calls.push('fail')
      for (const id of ids) failedAt.set(id, stamp())
    },
  }
  return { store, recorded, calls, failedAt }
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

  it('puts accounts that failed before after first-time ones, oldest attempt first', () => {
    const { send } = planSignups(
      [account(1), account(2), account(3), account(4)],
      new Set(),
      since,
      new Map([
        ['acc-1', '2026-11-20T00:00:02Z'],
        ['acc-2', '2026-11-20T00:00:01Z'],
      ])
    )
    expect(send.map(s => s.accountId)).toEqual(['acc-3', 'acc-4', 'acc-2', 'acc-1'])
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

  it('moves a sign-up Donus keeps rejecting to the back so it cannot block later ones', async () => {
    const reject = { 'm1@x.org': new DonusApiError('Donus form submit failed (400)', 400) }
    const { store, recorded, failedAt } = memoryStore([account(1), account(2), account(3)])
    const first = fakeClient(reject)
    await runDonusSignups({ client: first, store, since, maxPerRun: 1 })
    expect(first.submitMember.mock.calls.map(c => c[0].email)).toEqual(['m1@x.org'])
    expect(failedAt.has('acc-1')).toBe(true)
    // 다음 실행은 거절된 acc-1 이 아니라 아직 안 보낸 가입부터
    const second = fakeClient(reject)
    await runDonusSignups({ client: second, store, since, maxPerRun: 1 })
    expect(second.submitMember.mock.calls.map(c => c[0].email)).toEqual(['m2@x.org'])
    expect(recorded.map(r => r.account_id)).toEqual(['acc-2'])
  })

  it('counts an existing Donus member separately from a new one', async () => {
    const client = fakeClient()
    const { store } = memoryStore([account(1), account(2, { email: 'old@x.org' })])
    const report = await runDonusSignups({ client, store, since })
    expect(report).toMatchObject({ submitted: 2, newMembers: 1, matchedExisting: 1 })
  })

  it('defers, not fails, when the time budget stops a send', async () => {
    const client = fakeClient({ 'm1@x.org': new DonusApiError(TIME_BUDGET_USED, 0) })
    const { store, recorded, failedAt, calls } = memoryStore([account(1)])
    const report = await runDonusSignups({ client, store, since })
    expect(report).toMatchObject({ failures: 0, deferred: 1, submitted: 0 })
    expect(recorded).toEqual([])
    // 연기는 실패로 남기지 않는다 — 자리를 지켜 다음 실행에 먼저 보낸다
    expect(failedAt.size).toBe(0)
    expect(calls).not.toContain('fail')
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

    const fresh = memoryStore([1, 2, 3, 4].map(n => account(n))).store
    const capped = await runDonusSignups({
      client: fakeClient(),
      store: fresh,
      since,
      maxPerRun: 3,
    })
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

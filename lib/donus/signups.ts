/**
 * 홈페이지 신규 가입 → 도너스 구성원 등록(역방향, 신규 가입만).
 * 이메일 확인을 마친 계정 중 기준일 이후 가입·비활성 아님·도너스 연결 없음·아직 안 보낸 계정만 보낸다.
 */
import { DonusApiError, TIME_BUDGET_USED } from './client'
import { NAME_MAX_BYTES, truncateUtf8, type DonusFormsClient } from './forms-client'
import { normalizeEmail } from './member-links'

export interface SignupAccount {
  id: string
  email: string | null
  name: string
  /** ISO 시각 */
  createdAt: string
  disabled: boolean
}

export interface SignupSubmission {
  account_id: string
  member_idx: number
  is_new: boolean
}

export interface SignupStore {
  /** 이메일 확인을 마친, 익명이 아닌 계정 */
  listSignupAccounts(): Promise<SignupAccount[]>
  /** 이미 도너스 연결이 있거나 이미 보낸 계정 */
  listHandledAccountIds(): Promise<Set<string>>
  recordSubmissions(rows: SignupSubmission[]): Promise<void>
}

export interface SignupOptions {
  client: Pick<DonusFormsClient, 'submitMember' | 'callCount'>
  store: SignupStore
  /** 이 날짜(YYYY-MM-DD, KST) 이후 가입만 보낸다 — 기존 계정을 한꺼번에 보내지 않게 */
  since: string
  /** 한 실행에서 보낼 최대 인원(하루 호출 한도 보호) */
  maxPerRun?: number
  /** 이 시각이 지나면 새로 보내지 않는다 */
  deadline?: number
  now?: () => number
}

export interface SignupReport {
  candidates: number
  submitted: number
  newMembers: number
  matchedExisting: number
  skippedNoName: number
  failures: number
  deferred: number
  apiCalls: number
}

export const MAX_SIGNUPS_PER_RUN = 200
/** 보낸 기록을 이만큼 모을 때마다 저장한다 */
export const RECORD_BATCH = 20

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** KST 기준 날짜(YYYY-MM-DD) 시작 시각 */
function kstStart(date: string): number {
  if (!ISO_DATE.test(date)) throw new Error('DONUS_SIGNUP_SINCE must be YYYY-MM-DD')
  const at = Date.parse(`${date}T00:00:00+09:00`)
  if (Number.isNaN(at)) throw new Error('DONUS_SIGNUP_SINCE must be YYYY-MM-DD')
  return at
}

/** 보낼 계정과 이름 — 오래된 가입부터 */
export function planSignups(
  accounts: readonly SignupAccount[],
  handled: ReadonlySet<string>,
  since: string
): {
  send: { accountId: string; member: { name: string; email: string } }[]
  skippedNoName: number
} {
  const from = kstStart(since)
  const send: { accountId: string; member: { name: string; email: string } }[] = []
  let skippedNoName = 0
  const eligible = accounts
    .filter(account => !account.disabled && !handled.has(account.id))
    .filter(account => Date.parse(account.createdAt) >= from)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  for (const account of eligible) {
    const email = normalizeEmail(account.email)
    if (!email) continue
    // 이름이 없으면 지어내지 않는다(이메일 앞부분 등) — 세어 두고 보내지 않는다
    const name = truncateUtf8(account.name.trim(), NAME_MAX_BYTES).trim()
    if (!name) {
      skippedNoName++
      continue
    }
    send.push({ accountId: account.id, member: { name, email } })
  }
  return { send, skippedNoName }
}

export async function runDonusSignups({
  client,
  store,
  since,
  maxPerRun = MAX_SIGNUPS_PER_RUN,
  deadline = Infinity,
  now = () => Date.now(),
}: SignupOptions): Promise<SignupReport> {
  const [accounts, handled] = await Promise.all([
    store.listSignupAccounts(),
    store.listHandledAccountIds(),
  ])
  const { send, skippedNoName } = planSignups(accounts, handled, since)

  let batch: SignupSubmission[] = []
  let submitted = 0
  let newMembers = 0
  let failures = 0
  let deferred = 0
  const flush = async () => {
    if (!batch.length) return
    await store.recordSubmissions(batch)
    submitted += batch.length
    batch = []
  }
  for (const [i, { accountId, member }] of send.entries()) {
    if (i >= maxPerRun || now() > deadline) {
      deferred++
      continue
    }
    try {
      const result = await client.submitMember(member)
      if (result.isNew) newMembers++
      batch.push({ account_id: accountId, member_idx: result.memberIdx, is_new: result.isNew })
    } catch (err) {
      // 보내는 도중 예산이 끝났으면 연기 — 실패한 건도 기록하지 않으니 다음 실행이 다시 보낸다
      if (err instanceof DonusApiError && err.message === TIME_BUDGET_USED) deferred++
      else failures++
    }
    if (batch.length >= RECORD_BATCH) await flush()
  }
  await flush()

  return {
    candidates: send.length,
    submitted,
    newMembers,
    matchedExisting: submitted - newMembers,
    skippedNoName,
    failures,
    deferred,
    apiCalls: client.callCount(),
  }
}

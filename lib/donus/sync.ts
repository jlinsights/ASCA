/**
 * 도너스 → 홈페이지 단방향 동기화.
 *
 * 순서가 계약이다.
 * 1. 도너스 구성원을 등록일 구간으로 끝까지 읽는다. 하나라도 실패하면 아무것도 쓰지 않는다
 *    (일부만 읽고 연결을 지우면 멀쩡한 회원이 끊긴다).
 * 2. 계정 이메일과 대조해 연결 계획을 세우고, 지울 연결을 먼저 지운 뒤 새 연결을 넣는다
 *    (구성원 이메일이 다른 계정으로 옮겨 가면 member_idx 유일 제약에 걸리지 않게).
 * 3. 연결된 구성원마다 생애주기·최근 납입일과 연회비 납부 연도를 갱신한다.
 *    한 사람의 조회가 실패해도 나머지는 계속하고, 그 사람의 기존 값은 그대로 둔다.
 * 결과에는 개수만 싣는다 — 이름·이메일을 로그나 응답에 남기지 않는다.
 */
import type { DonusClient, DonusMemberSummary, DonusPayment } from './client'
import {
  createdWindows,
  duesPaidYear,
  indexMembersByEmail,
  planLinks,
  type AccountEmail,
  type MemberLink,
} from './member-links'

export interface MemberStatus {
  account_id: string
  lifecycle: number | null
  last_pay_date: string | null
  dues_paid_year: number | null
}

export interface LinkStore {
  listAccounts(): Promise<AccountEmail[]>
  listLinks(): Promise<(MemberLink & { dues_paid_year: number | null })[]>
  removeLinks(accountIds: string[]): Promise<void>
  upsertLinks(links: MemberLink[]): Promise<void>
  updateStatuses(statuses: MemberStatus[]): Promise<void>
}

export interface SyncOptions {
  client: Pick<DonusClient, 'membersCreated' | 'member' | 'payments' | 'callCount'>
  store: LinkStore
  /** 도너스 구성원을 읽기 시작할 등록일(YYYY-MM-DD) */
  since: string
  /** 오늘(KST, YYYY-MM-DD) */
  today: string
  duesCodes: ReadonlySet<string>
}

export interface SyncReport {
  donusMembers: number
  ambiguousEmails: number
  accounts: number
  matched: number
  unmatched: number
  skippedClaimed: number
  linksUpserted: number
  linksRemoved: number
  manualLinks: number
  statusesUpdated: number
  statusFailures: number
  duesConfigured: boolean
  apiCalls: number
}

/** 도너스 구성원을 읽기 시작하는 등록일 기본값 — DONUS_SYNC_SINCE 로 바꾼다 */
export const DEFAULT_SINCE = '2015-01-01'

/** 한국 시간 기준 오늘(YYYY-MM-DD) */
export function kstToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now)
}

const LIFECYCLES = new Set([0, 1, 2, 3, 4, 5])
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const dateOrNull = (value: string | null | undefined) =>
  value && ISO_DATE.test(value.slice(0, 10)) ? value.slice(0, 10) : null

async function readAllMembers(client: SyncOptions['client'], since: string, today: string) {
  const members: DonusMemberSummary[] = []
  for (const { start, end } of createdWindows(since, today)) {
    members.push(...(await client.membersCreated(start, end)))
  }
  return members
}

/** 올해 납입을 보고, 연회비가 없으면 작년까지 본다(한 번 조회는 최장 1년) */
async function readDuesYear(
  client: SyncOptions['client'],
  memberIdx: number,
  today: string,
  duesCodes: ReadonlySet<string>
) {
  if (duesCodes.size === 0) return null
  const year = Number(today.slice(0, 4))
  const thisYear: DonusPayment[] = await client.payments(memberIdx, `${year}-01-01`, today)
  const paid = duesPaidYear(thisYear, duesCodes)
  if (paid !== null) return paid
  const lastYear = await client.payments(memberIdx, `${year - 1}-01-01`, `${year - 1}-12-31`)
  return duesPaidYear(lastYear, duesCodes)
}

export async function runDonusSync({
  client,
  store,
  since,
  today,
  duesCodes,
}: SyncOptions): Promise<SyncReport> {
  // 1. 도너스를 끝까지 읽은 뒤에만 쓴다
  const members = await readAllMembers(client, since, today)
  const { index, ambiguous } = indexMembersByEmail(members)
  const [accounts, existing] = await Promise.all([store.listAccounts(), store.listLinks()])

  // 2. 연결 — 지우고 넣는다
  const plan = planLinks(accounts, index, existing)
  if (plan.removals.length) await store.removeLinks(plan.removals)
  if (plan.upserts.length) await store.upsertLinks(plan.upserts)

  // 3. 연결된 구성원의 상태
  const removed = new Set(plan.removals)
  const linked = new Map<string, number>()
  for (const link of existing)
    if (!removed.has(link.account_id)) linked.set(link.account_id, link.member_idx)
  for (const link of plan.upserts) linked.set(link.account_id, link.member_idx)
  const previousDues = new Map(existing.map(link => [link.account_id, link.dues_paid_year]))

  const statuses: MemberStatus[] = []
  let statusFailures = 0
  for (const [accountId, memberIdx] of linked) {
    try {
      const detail = await client.member(memberIdx)
      const dues = await readDuesYear(client, memberIdx, today, duesCodes)
      const lifecycle =
        typeof detail.lifecycle === 'number' && LIFECYCLES.has(detail.lifecycle)
          ? detail.lifecycle
          : null
      statuses.push({
        account_id: accountId,
        lifecycle,
        last_pay_date: dateOrNull(detail.lastPayDate),
        // 연회비 코드를 아직 모르면 이전 값을 지우지 않는다
        dues_paid_year: duesCodes.size === 0 ? (previousDues.get(accountId) ?? null) : dues,
      })
    } catch {
      statusFailures++
    }
  }
  if (statuses.length) await store.updateStatuses(statuses)

  return {
    donusMembers: members.length,
    ambiguousEmails: ambiguous.size,
    accounts: accounts.length,
    matched: plan.stats.matched,
    unmatched: plan.stats.unmatched,
    skippedClaimed: plan.stats.skippedClaimed,
    linksUpserted: plan.upserts.length,
    linksRemoved: plan.removals.length,
    manualLinks: plan.kept.length,
    statusesUpdated: statuses.length,
    statusFailures,
    duesConfigured: duesCodes.size > 0,
    apiCalls: client.callCount(),
  }
}

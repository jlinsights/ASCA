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
  dues_history_checked: boolean
}

export type StoredLink = MemberLink & {
  dues_paid_year: number | null
  dues_history_checked: boolean
  synced_at: string
}

export interface LinkStore {
  listAccounts(): Promise<AccountEmail[]>
  listLinks(): Promise<StoredLink[]>
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
  /** 이 시각(epoch ms)이 지나면 상태 갱신을 멈추고 남은 회원은 다음 실행으로 넘긴다 */
  deadline?: number
  /** 도너스 구성원 전체 조회가 이 시각을 넘기면 아무것도 쓰지 않고 실패한다 */
  readDeadline?: number
  now?: () => number
}

/** 상태를 이만큼 모을 때마다 저장한다 — 시간이 다 돼도 그때까지 읽은 회원은 남는다 */
export const STATUS_BATCH = 20

export interface SyncReport {
  donusMembers: number
  ambiguousEmails: number
  accounts: number
  matched: number
  unmatched: number
  skippedClaimed: number
  keptUnseen: number
  keptAmbiguous: number
  linksUpserted: number
  linksRemoved: number
  manualLinks: number
  statusesUpdated: number
  statusFailures: number
  statusesDeferred: number
  duesConfigured: boolean
  apiCalls: number
}

/** 도너스 구성원을 읽기 시작하는 등록일 기본값 — DONUS_SYNC_SINCE 로 바꾼다 */
export const DEFAULT_SINCE = '2015-01-01'

/** 한국 시간 기준 오늘(YYYY-MM-DD) */
export function kstToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now)
}

const latestYear = (a: number | null, b: number | null) =>
  a === null ? b : b === null ? a : Math.max(a, b)

const LIFECYCLES = new Set([0, 1, 2, 3, 4, 5])
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const dateOrNull = (value: string | null | undefined) =>
  value && ISO_DATE.test(value.slice(0, 10)) ? value.slice(0, 10) : null

async function readAllMembers(
  client: SyncOptions['client'],
  since: string,
  today: string,
  readDeadline: number,
  now: () => number
) {
  const members: DonusMemberSummary[] = []
  for (const { start, end } of createdWindows(since, today)) {
    // 플랫폼이 함수를 끊기 전에 이유가 보이게 멈춘다(아무것도 쓰지 않은 상태)
    if (now() > readDeadline)
      throw new Error('Donus member read exceeded its time budget; set a later DONUS_SYNC_SINCE')
    members.push(...(await client.membersCreated(start, end)))
  }
  return members
}

/** 새 연결이 거슬러 올라가 보는 최대 연수 */
export const DUES_LOOKBACK_YEARS = 10

/**
 * 올해부터 한 해씩 거슬러 연회비 납부를 찾는다(한 번 조회는 최장 1년).
 * 평소에는 올해·작년 두 해만 보고, 새로 이은 연결은 years 만큼 본다 —
 * 그래서 연결을 지운 뒤 다시 넣기 전에 실패해도 다음 실행에서 마지막 납부 연도가 되살아난다.
 */
async function readDuesYear(
  client: SyncOptions['client'],
  memberIdx: number,
  today: string,
  duesCodes: ReadonlySet<string>,
  years: number
) {
  if (duesCodes.size === 0) return null
  const year = Number(today.slice(0, 4))
  for (let back = 0; back < years; back++) {
    const y = year - back
    const rows: DonusPayment[] = await client.payments(
      memberIdx,
      `${y}-01-01`,
      back === 0 ? today : `${y}-12-31`
    )
    const paid = duesPaidYear(rows, duesCodes)
    if (paid !== null) return paid
  }
  return null
}

export async function runDonusSync({
  client,
  store,
  since,
  today,
  duesCodes,
  deadline = Infinity,
  readDeadline = Infinity,
  now = () => Date.now(),
}: SyncOptions): Promise<SyncReport> {
  // 1. 도너스를 끝까지 읽은 뒤에만 쓴다
  const members = await readAllMembers(client, since, today, readDeadline, now)
  const { index, ambiguous } = indexMembersByEmail(members)
  const [accounts, existing] = await Promise.all([store.listAccounts(), store.listLinks()])

  // 2. 연결 — 지우고 넣는다
  const seen = new Set(members.map(member => member.memberIdx))
  const plan = planLinks(accounts, index, existing, seen, ambiguous)
  if (plan.removals.length) await store.removeLinks(plan.removals)
  if (plan.upserts.length) await store.upsertLinks(plan.upserts)

  // 3. 연결된 구성원의 상태 — 새 연결부터, 그다음 오래전에 갱신한 순서로(시간이 모자라면 다음 날 이어서)
  const removed = new Set(plan.removals)
  const kept = existing.filter(link => !removed.has(link.account_id))
  const fresh = new Set(plan.upserts.map(link => link.account_id))
  const linked = new Map<string, number>()
  for (const link of plan.upserts) linked.set(link.account_id, link.member_idx)
  for (const link of [...kept].sort((a, b) => a.synced_at.localeCompare(b.synced_at)))
    if (!fresh.has(link.account_id)) linked.set(link.account_id, link.member_idx)
  const freshLookback = Math.max(
    2,
    Math.min(DUES_LOOKBACK_YEARS, Number(today.slice(0, 4)) - Number(since.slice(0, 4)) + 1)
  )
  // 이전 연회비 값과 이력 확인 여부는 같은 구성원에 그대로 연결된 경우에만 이어 쓴다
  const previousDues = new Map(kept.map(link => [link.account_id, link.dues_paid_year]))
  const historyChecked = new Set(
    kept.filter(link => link.dues_history_checked).map(link => link.account_id)
  )

  let batch: MemberStatus[] = []
  let statusesUpdated = 0
  let statusFailures = 0
  let statusesDeferred = 0
  const flush = async () => {
    if (!batch.length) return
    await store.updateStatuses(batch)
    statusesUpdated += batch.length
    batch = []
  }
  for (const [accountId, memberIdx] of linked) {
    if (now() > deadline) {
      statusesDeferred++
      continue
    }
    try {
      const detail = await client.member(memberIdx)
      // 이력을 끝까지 본 적 없는 연결은 길게 찾는다 — 실패·연기되면 다음 실행에서 다시
      const needsHistory = !historyChecked.has(accountId)
      const lookback = needsHistory ? freshLookback : 2
      const dues = await readDuesYear(client, memberIdx, today, duesCodes, lookback)
      const lifecycle =
        typeof detail.lifecycle === 'number' && LIFECYCLES.has(detail.lifecycle)
          ? detail.lifecycle
          : null
      batch.push({
        account_id: accountId,
        lifecycle,
        last_pay_date: dateOrNull(detail.lastPayDate),
        // 연회비 코드를 아직 모르면 이전 값을 지우지 않는다
        // 올해·작년에 납부가 없으면 저장된 마지막 납부 연도를 지우지 않는다(같은 구성원일 때만 이어 쓴다)
        dues_paid_year: latestYear(dues, previousDues.get(accountId) ?? null),
        // 연회비 코드가 있어 실제로 거슬러 본 경우에만 확인 완료로 남긴다
        dues_history_checked: historyChecked.has(accountId) || duesCodes.size > 0,
      })
    } catch {
      statusFailures++
    }
    if (batch.length >= STATUS_BATCH) await flush()
  }
  await flush()

  return {
    donusMembers: members.length,
    ambiguousEmails: ambiguous.size,
    accounts: accounts.length,
    matched: plan.stats.matched,
    unmatched: plan.stats.unmatched,
    skippedClaimed: plan.stats.skippedClaimed,
    keptUnseen: plan.stats.keptUnseen,
    keptAmbiguous: plan.stats.keptAmbiguous,
    linksUpserted: plan.upserts.length,
    linksRemoved: plan.removals.length,
    manualLinks: plan.kept.length,
    statusesUpdated,
    statusFailures,
    statusesDeferred,
    duesConfigured: duesCodes.size > 0,
    apiCalls: client.callCount(),
  }
}

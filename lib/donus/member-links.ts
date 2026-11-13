/**
 * 홈페이지 계정 ↔ 도너스 구성원 연결 규칙 (순수 함수 — 네트워크·DB 없음)
 *
 * - 대조 키는 이메일 하나다(소문자·앞뒤 공백 제거). 이름 유사도로 잇지 않는다.
 * - 도너스에서 같은 이메일을 가진 구성원이 둘 이상이면 그 이메일은 잇지 않는다(누가 맞는지 모른다).
 * - 사무국이 직접 이은 연결(link_source='manual')은 동기화가 끊거나 바꾸지 않는다.
 */
import type { DonusMemberSummary, DonusPayment } from './client'

export type LinkSource = 'email' | 'manual'

export interface AccountEmail {
  id: string
  email: string | null
}

export interface MemberLink {
  account_id: string
  member_idx: number
  member_code: string
  link_source: LinkSource
}

export interface LinkPlan {
  upserts: MemberLink[]
  removals: string[]
  kept: MemberLink[]
  stats: { matched: number; unmatched: number; skippedClaimed: number }
}

/** 도너스 납입의 수입상태 3 = 수입완료 */
export const INCOME_COMPLETED = 3
/** 도너스 구성원 등록일 조회 한 번의 최장 기간(일) */
export const MAX_WINDOW_DAYS = 30

const DAY_MS = 86_400_000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function normalizeEmail(value: string | null | undefined): string | null {
  const email = value?.trim().toLowerCase()
  return email && email.includes('@') ? email : null
}

function parseDate(value: string): number {
  if (!ISO_DATE.test(value)) throw new Error(`Invalid date: ${value}`)
  const time = Date.parse(`${value}T00:00:00Z`)
  if (Number.isNaN(time)) throw new Error(`Invalid date: ${value}`)
  return time
}

const formatDate = (time: number) => new Date(time).toISOString().slice(0, 10)

/** since~today 를 도너스가 받는 30일 이하 구간으로 나눈다(양 끝 포함) */
export function createdWindows(since: string, today: string): { start: string; end: string }[] {
  const first = parseDate(since)
  const last = parseDate(today)
  if (first > last) throw new Error('since is after today')
  const windows: { start: string; end: string }[] = []
  for (let start = first; start <= last; start += MAX_WINDOW_DAYS * DAY_MS) {
    const end = Math.min(start + (MAX_WINDOW_DAYS - 1) * DAY_MS, last)
    windows.push({ start: formatDate(start), end: formatDate(end) })
  }
  return windows
}

/** 이메일 → 구성원. 같은 이메일의 서로 다른 구성원은 ambiguous 로 빼고 잇지 않는다 */
export function indexMembersByEmail(members: readonly DonusMemberSummary[]): {
  index: Map<string, DonusMemberSummary>
  ambiguous: Set<string>
} {
  const index = new Map<string, DonusMemberSummary>()
  const ambiguous = new Set<string>()
  for (const member of members) {
    const email = normalizeEmail(member.email)
    if (!email || ambiguous.has(email)) continue
    const seen = index.get(email)
    if (seen && seen.memberIdx !== member.memberIdx) {
      index.delete(email)
      ambiguous.add(email)
    } else if (!seen) {
      index.set(email, member)
    }
  }
  return { index, ambiguous }
}

const sameLink = (a: MemberLink, b: MemberLink) =>
  a.member_idx === b.member_idx &&
  a.member_code === b.member_code &&
  a.link_source === b.link_source

/** 지금 연결과 도너스 이메일 색인으로 바꿀 연결을 정한다 */
export function planLinks(
  accounts: readonly AccountEmail[],
  index: ReadonlyMap<string, DonusMemberSummary>,
  existing: readonly MemberLink[]
): LinkPlan {
  const current = new Map(existing.map(link => [link.account_id, link]))
  const manual = existing.filter(link => link.link_source === 'manual')
  const manualMembers = new Set(manual.map(link => link.member_idx))
  const upserts: MemberLink[] = []
  const removals: string[] = []
  const stats = { matched: 0, unmatched: 0, skippedClaimed: 0 }

  for (const account of accounts) {
    const before = current.get(account.id)
    if (before?.link_source === 'manual') continue
    const email = normalizeEmail(account.email)
    const member = email ? index.get(email) : undefined
    if (!member) {
      stats.unmatched++
      if (before) removals.push(account.id)
      continue
    }
    if (manualMembers.has(member.memberIdx)) {
      stats.skippedClaimed++
      if (before) removals.push(account.id)
      continue
    }
    stats.matched++
    const next: MemberLink = {
      account_id: account.id,
      member_idx: member.memberIdx,
      member_code: String(member.memberCode),
      link_source: 'email',
    }
    if (!before || !sameLink(before, next)) upserts.push(next)
  }

  // 계정이 지워졌는데 남은 이메일 연결(계정 삭제는 CASCADE 지만 목록이 어긋난 경우 대비)
  const accountIds = new Set(accounts.map(account => account.id))
  for (const link of existing) {
    if (link.link_source === 'email' && !accountIds.has(link.account_id))
      removals.push(link.account_id)
  }

  return { upserts, removals, kept: manual, stats }
}

/**
 * 연회비로 수입완료된 납입이 있는 가장 최근 연도. 연회비 코드를 모르면 null —
 * 다른 후원금을 연회비로 잘못 세지 않는다.
 */
export function duesPaidYear(
  payments: readonly DonusPayment[],
  duesCodes: ReadonlySet<string>
): number | null {
  if (duesCodes.size === 0) return null
  let latest: number | null = null
  for (const payment of payments) {
    if (payment.incomeStatus !== INCOME_COMPLETED || !payment.payDate) continue
    const isDues =
      (payment.productCode && duesCodes.has(payment.productCode)) ||
      (payment.purposeCode && duesCodes.has(payment.purposeCode))
    if (!isDues) continue
    const year = Number(payment.payDate.slice(0, 4))
    if (Number.isInteger(year) && (latest === null || year > latest)) latest = year
  }
  return latest
}

/** 쉼표로 이은 환경 변수 값을 코드 집합으로 */
export function parseCodeList(value: string | undefined): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map(code => code.trim())
      .filter(Boolean)
  )
}

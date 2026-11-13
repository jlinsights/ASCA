/**
 * 도너스 Open API v0 읽기 전용 클라이언트 — https://developer.donus.org/
 *
 * - API 키는 쿼리 문자열(apikey)로 보낸다. 키는 서버 환경 변수 DONUS_API_KEY 에만 둔다.
 *   오류 메시지에 요청 주소를 싣지 않는다(키가 새어 나간다).
 * - 도너스 한도: 모든 API 합산 초당 5회·하루 5,000회. 호출 사이를 MIN_INTERVAL_MS 로 띄운다.
 * - 단방향 동기화라 쓰기 API(PUT member·Forms)는 일부러 두지 않았다.
 */

export const DONUS_BASE_URL = 'https://cloud.donus.org/api'
/** 초당 5회 한도 아래로 — 호출 사이 최소 간격 */
export const MIN_INTERVAL_MS = 250
/** 한 페이지 최대 개수(도너스 상한) */
export const PAGE_SIZE = 100

export interface DonusMemberSummary {
  memberIdx: number
  memberCode: string
  name?: string
  email?: string | null
  cellphone?: string | null
  groups?: string[]
}

export interface DonusMemberDetail {
  memberIdx: number
  memberCode: string
  lifecycle?: number | null
  activeDate?: string | null
  lapseDate?: string | null
  lastPayDate?: string | null
}

export interface DonusPayment {
  paymentIdx: number
  memberIdx: number
  productCode?: string | null
  purposeCode?: string | null
  payPrice?: number | null
  payDate?: string | null
  incomeStatus?: number | null
}

interface MemberPage {
  members?: DonusMemberSummary[]
  hasMore?: boolean
  memberIdxOffset?: number
}

interface PaymentPage {
  payments?: DonusPayment[]
  hasMore?: boolean
  paymentIdxOffset?: number
}

export class DonusApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'DonusApiError'
  }
}

export interface DonusClientOptions {
  apiKey: string
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => number
  baseUrl?: string
}

export type DonusClient = ReturnType<typeof createDonusClient>

/** 한 번에 끝나지 않는 페이지가 무한히 이어지지 않도록 막는 상한 */
const MAX_PAGES = 1000

export function createDonusClient({
  apiKey,
  fetchImpl = fetch,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  now = () => Date.now(),
  baseUrl = DONUS_BASE_URL,
}: DonusClientOptions) {
  if (!apiKey.trim()) throw new Error('DONUS_API_KEY is empty')
  let lastCall = -Infinity
  let calls = 0

  async function get<T>(path: string, params: Record<string, string | number | undefined>) {
    const wait = lastCall + MIN_INTERVAL_MS - now()
    if (wait > 0) await sleep(wait)
    lastCall = now()
    calls++

    const url = new URL(`${baseUrl}${path}`)
    url.searchParams.set('apikey', apiKey)
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
    const response = await fetchImpl(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: unknown } | null
      const reason = typeof body?.message === 'string' ? body.message.slice(0, 200) : ''
      throw new DonusApiError(
        `Donus ${path} failed (${response.status}) ${reason}`.trim(),
        response.status
      )
    }
    return (await response.json()) as T
  }

  /** 등록일 기준 구성원 목록 한 구간(최장 30일)을 끝까지 넘긴다 */
  async function membersCreated(startDate: string, endDate: string) {
    const members: DonusMemberSummary[] = []
    let offset: number | undefined
    for (let page = 0; page < MAX_PAGES; page++) {
      const body = await get<MemberPage>('/members/v0/members/recent/created', {
        startDate,
        endDate,
        count: PAGE_SIZE,
        memberIdxOffset: offset,
      })
      members.push(...(body.members ?? []))
      if (!body.hasMore) return members
      // 더 있다는데 커서가 없거나 그대로면 끝까지 못 읽은 것 — 일부 목록으로 연결을 지우지 않게 실패시킨다
      if (body.memberIdxOffset === undefined || body.memberIdxOffset === offset)
        throw new DonusApiError('Donus member paging stalled', 0)
      offset = body.memberIdxOffset
    }
    throw new DonusApiError('Donus member paging did not finish', 0)
  }

  function member(memberIdx: number) {
    return get<DonusMemberDetail>(`/members/v0/member/idx/${encodeURIComponent(memberIdx)}`, {})
  }

  /** 한 구성원의 납입 목록(납입일 기준, 최장 1년) */
  async function payments(memberIdx: number, startDate: string, endDate: string) {
    const result: DonusPayment[] = []
    let offset: number | undefined
    for (let page = 0; page < MAX_PAGES; page++) {
      const body = await get<PaymentPage>('/payments/v0/payments', {
        memberIdx,
        startDate,
        endDate,
        dateType: 'payDate',
        count: PAGE_SIZE,
        paymentIdxOffset: offset,
      })
      result.push(...(body.payments ?? []))
      if (!body.hasMore) return result
      if (body.paymentIdxOffset === undefined || body.paymentIdxOffset === offset)
        throw new DonusApiError('Donus payment paging stalled', 0)
      offset = body.paymentIdxOffset
    }
    throw new DonusApiError('Donus payment paging did not finish', 0)
  }

  return { membersCreated, member, payments, callCount: () => calls }
}

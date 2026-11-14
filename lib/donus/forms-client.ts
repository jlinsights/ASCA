/**
 * 도너스 Forms API — 회원 등록 폼으로 구성원을 등록한다(홈페이지 → 도너스, 신규 가입만).
 *
 * - POST /forms/v0/submit/members/:formkey. API 키가 아니라 폼 키를 쓴다(경로에 실린다).
 * - 폼 키가 실린 주소·원래 오류 메시지는 로그·예외에 싣지 않는다.
 * - updateOnMatch 는 늘 false: 같은 이메일 구성원이 있으면 도너스 쪽 값을 바꾸지 않는다.
 * - 수신 동의(agreeEmail 등)·뉴스레터·사용자정의 칸은 보내지 않는다.
 * - 도너스 한도(모든 API 합산 초당 5회·하루 5,000회)에 맞춰 호출 사이를 MIN_INTERVAL_MS 로 띄운다.
 */
import { DONUS_BASE_URL, DonusApiError, MIN_INTERVAL_MS, TIME_BUDGET_USED } from './client'

/** 도너스가 받는 구성원명 최대 길이(UTF-8 바이트) */
export const NAME_MAX_BYTES = 100
export const FORM_TIMEOUT_MS = 20_000

export interface SignupMember {
  name: string
  email: string
}

export interface SubmitResult {
  memberIdx: number
  isNew: boolean
}

export interface DonusFormsClientOptions {
  formKey: string
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => number
  baseUrl?: string
  /** 이 시각(epoch ms)이 지나면 새 요청을 보내지 않는다 */
  deadline?: number
  requestTimeoutMs?: number
}

export type DonusFormsClient = ReturnType<typeof createDonusFormsClient>

/** 글자 중간을 자르지 않고 UTF-8 maxBytes 안으로 줄인다 */
export function truncateUtf8(value: string, maxBytes: number): string {
  const encoder = new TextEncoder()
  let bytes = 0
  let out = ''
  for (const char of value) {
    bytes += encoder.encode(char).length
    if (bytes > maxBytes) break
    out += char
  }
  return out
}

export function createDonusFormsClient({
  formKey,
  fetchImpl = fetch,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  now = () => Date.now(),
  baseUrl = DONUS_BASE_URL,
  deadline = Infinity,
  requestTimeoutMs = FORM_TIMEOUT_MS,
}: DonusFormsClientOptions) {
  const key = formKey.trim()
  if (!key) throw new Error('DONUS_FORM_KEY is empty')
  let lastCall = -Infinity
  let calls = 0

  /** 구성원 한 명을 등록한다. 한 명씩 보내 잘못된 한 건이 다른 가입을 막지 않게 한다 */
  async function submitMember(member: SignupMember): Promise<SubmitResult> {
    const wait = lastCall + MIN_INTERVAL_MS - now()
    if (wait > 0) await sleep(wait)
    if (now() > deadline) throw new DonusApiError(TIME_BUDGET_USED, 0)
    lastCall = now()
    calls++

    const url = `${baseUrl}/forms/v0/submit/members/${encodeURIComponent(key)}`
    let response: Response
    try {
      response = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(requestTimeoutMs),
        body: JSON.stringify({
          updateOnMatch: false,
          members: [{ name: member.name, email: member.email }],
        }),
      })
    } catch (err) {
      // 오류 메시지에 주소(=폼 키)가 실릴 수 있어 이유만 남긴다
      const name = typeof err === 'object' && err !== null && 'name' in err ? String(err.name) : ''
      const timedOut = name === 'TimeoutError' || name === 'AbortError'
      throw new DonusApiError(
        timedOut ? 'Donus form submit timed out' : 'Donus form submit unreachable',
        0
      )
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: unknown } | null
      const reason = typeof body?.message === 'string' ? body.message.slice(0, 200) : ''
      throw new DonusApiError(
        `Donus form submit failed (${response.status}) ${reason}`.trim(),
        response.status
      )
    }
    const body = (await response.json().catch(() => null)) as {
      members?: { memberIdx?: unknown; isNew?: unknown }[]
    } | null
    const row = Array.isArray(body?.members) && body.members.length === 1 ? body.members[0] : null
    // 200 이라도 모양이 다르면 보냈다고 기록하지 않는다 — 다음 실행이 다시 보낸다(같은 이메일은 바뀌지 않음)
    if (
      !row ||
      typeof row.memberIdx !== 'number' ||
      !Number.isInteger(row.memberIdx) ||
      row.memberIdx <= 0 ||
      typeof row.isNew !== 'boolean'
    )
      throw new DonusApiError('Donus form submit returned an unexpected shape', 0)
    return { memberIdx: row.memberIdx, isNew: row.isNew }
  }

  return { submitMember, callCount: () => calls }
}

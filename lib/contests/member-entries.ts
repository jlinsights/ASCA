// 회원 "내 출품" — 회원에게 돌려주는 칸과 두 경로(이메일·연결된 작가)의 결과 합치기.
import type { FeeStatus, ResultStatus } from './entry-mapper'
import { normalizeEmail } from './entry-mapper'

/**
 * 회원이 보는 칸. 출품 이메일·출품자 이름·원본 출품비 문구·연결 정보·Airtable ID 는 넣지 않는다 —
 * 본인 것만 골라 주더라도 응답에 남의 손을 탄 값(사무국 메모성 문구 등)을 싣지 않는다.
 */
export const MEMBER_ENTRY_COLUMNS =
  'id,contest_year,contest_name,title,division,script_style,fee_status,result_status,result_raw,submitted_at,synced_at'

export interface MemberEntry {
  id: string
  contest_year: number
  contest_name: string
  title: string | null
  division: string | null
  script_style: string | null
  fee_status: FeeStatus
  result_status: ResultStatus
  result_raw: string | null
  submitted_at: string | null
  synced_at: string
}

/** 확인된 로그인 이메일 → 사본에 저장된 형태(소문자·공백 제거). 동기화와 같은 규칙 */
export function memberEmail(email: string | null | undefined): string | null {
  return normalizeEmail(email ?? null)
}

/** 이메일로 찾은 것과 연결된 작가로 찾은 것을 합쳐 중복을 빼고, 최근 대회·최근 출품 순 */
export function mergeMemberEntries(
  byEmail: readonly MemberEntry[],
  byArtist: readonly MemberEntry[]
): MemberEntry[] {
  const unique = new Map<string, MemberEntry>()
  for (const row of [...byEmail, ...byArtist]) unique.set(row.id, row)
  return [...unique.values()].sort(
    (a, b) =>
      b.contest_year - a.contest_year ||
      (b.submitted_at ?? '').localeCompare(a.submitted_at ?? '') ||
      a.id.localeCompare(b.id)
  )
}

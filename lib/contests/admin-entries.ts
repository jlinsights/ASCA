// 관리자 "출품 작가 연결" — 이메일로 자동 연결되지 않는 출품을 사무국이 작가 행에 잇는다.
// 이름·한자 이름이 같은 작가를 후보로 제안할 뿐, 연결은 관리자가 눌러야 생긴다.
import { z } from 'zod'
import type { FeeStatus, ResultStatus } from './entry-mapper'

/** 관리자 화면이 보는 칸 — 본인 확인에 출품자 이름·이메일이 필요하다. Airtable ID·원본 출품비 문구는 빼 둔다 */
export const ADMIN_ENTRY_COLUMNS =
  'id,contest_year,contest_name,title,division,script_style,fee_status,result_status,result_raw,entrant_name,entrant_name_hanja,entrant_email,artist_id,matched_at,submitted_at'

/** 후보·연결된 작가로 보일 칸 */
export const ENTRY_ARTIST_COLUMNS = 'id,name,name_zh,membership_type,visibility'

export const ADMIN_ENTRIES_LIMIT = 100
export const MAX_CANDIDATES = 5

export interface AdminEntryRow {
  id: string
  contest_year: number
  contest_name: string
  title: string | null
  division: string | null
  script_style: string | null
  fee_status: FeeStatus
  result_status: ResultStatus
  result_raw: string | null
  entrant_name: string | null
  entrant_name_hanja: string | null
  entrant_email: string | null
  artist_id: string | null
  matched_at: string | null
  submitted_at: string | null
}

export interface EntryArtist {
  id: string
  name: string
  name_zh: string | null
  membership_type: string | null
  visibility: string | null
}

export type MatchReason = 'name' | 'hanja' | 'both'

export interface EntryCandidate extends EntryArtist {
  reason: MatchReason
}

export interface AdminEntry extends AdminEntryRow {
  /** 연결된 작가(연결됨 목록) */
  artist: EntryArtist | null
  /** 이름·한자가 같은 작가(연결 대기 목록) */
  candidates: EntryCandidate[]
}

export const adminEntryQuerySchema = z.object({
  status: z.enum(['unmatched', 'matched']).default('unmatched'),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
})

export const entryDecisionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('link'), artistId: z.string().uuid() }).strict(),
  z.object({ action: z.literal('unlink') }).strict(),
])

export type EntryDecision = z.infer<typeof entryDecisionSchema>

/** 이름 비교용 — 띄어쓰기만 다른 '김 정 례'·'김정례' 를 같게 본다 */
export function nameKey(value: string | null | undefined): string | null {
  const key = (value ?? '').replace(/\s+/g, '')
  return key ? key : null
}

/** 작가 조회에 넣을 이름 목록 — 원래 글자와 띄어쓰기를 뺀 글자를 함께 넣는다(DB 쪽 표기가 어느 쪽이든 걸리게) */
export function lookupNames(values: readonly (string | null)[]): string[] {
  const names = new Set<string>()
  for (const value of values) {
    const trimmed = value?.trim()
    if (!trimmed) continue
    names.add(trimmed)
    const key = nameKey(trimmed)
    if (key) names.add(key)
  }
  return [...names]
}

/** 출품 한 건의 후보 — 이름·한자 둘 다 맞는 작가를 앞에, 최대 MAX_CANDIDATES 명 */
export function candidatesFor(
  entry: Pick<AdminEntryRow, 'entrant_name' | 'entrant_name_hanja'>,
  artists: readonly EntryArtist[]
): EntryCandidate[] {
  const name = nameKey(entry.entrant_name)
  const hanja = nameKey(entry.entrant_name_hanja)
  if (!name && !hanja) return []
  const rank: Record<MatchReason, number> = { both: 0, hanja: 1, name: 2 }
  const seen = new Set<string>()
  const matches: EntryCandidate[] = []
  for (const artist of artists) {
    if (seen.has(artist.id)) continue
    const byName = !!name && nameKey(artist.name) === name
    const byHanja = !!hanja && nameKey(artist.name_zh) === hanja
    if (!byName && !byHanja) continue
    seen.add(artist.id)
    matches.push({ ...artist, reason: byName && byHanja ? 'both' : byHanja ? 'hanja' : 'name' })
  }
  return matches
    .sort((a, b) => rank[a.reason] - rank[b.reason] || a.name.localeCompare(b.name, 'ko'))
    .slice(0, MAX_CANDIDATES)
}

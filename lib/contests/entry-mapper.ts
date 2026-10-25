import type { ContestSource, EntryColumn } from './sources'

export type FeeStatus = 'pending' | 'confirmed' | 'withdrawn' | 'unknown'
export type ResultStatus = 'pending' | 'awarded' | 'not_selected' | 'withdrawn' | 'unknown'

/** contest_entries 에 쓰는 행 — 연결 칸(artist_id·match_*)은 일부러 없다. 동기화가 덮지 않게. */
export interface ContestEntryRow {
  source_key: string
  airtable_record_id: string
  contest_year: number
  contest_name: string
  title: string | null
  division: string | null
  script_style: string | null
  fee_status_raw: string | null
  fee_status: FeeStatus
  result_raw: string | null
  result_status: ResultStatus
  entrant_name: string | null
  entrant_name_hanja: string | null
  entrant_email: string | null
  submitted_at: string | null
  synced_at: string
}

export interface AirtableRecord {
  id: string
  createdTime?: string
  fields: Record<string, unknown>
}

const CONFIRMED_FEES = new Set(['납부완료', '10만원 납부', '고문'])
const WITHDRAWN = new Set(['불참'])
const NOT_SELECTED = new Set(['탈락', '낙선'])
const AWARDS = new Set([
  '대상',
  '최우수상',
  '최우수',
  '우수상',
  '우수',
  '오체상',
  '삼체상',
  '특선',
  '입선',
  '현장휘호',
  '문체부장관상(대상)',
  '서울시장상(대상)',
])

/** Airtable 선택지 값 → 글자. 단일·다중 선택, 객체·문자열 모두 받는다. */
export function cellText(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) {
    const parts = value.map(cellText).filter((part): part is string => !!part)
    return parts.length ? parts.join(', ') : null
  }
  if (typeof value === 'object' && 'name' in value && typeof value.name === 'string')
    return value.name.trim() || null
  if (typeof value === 'string') return value.trim() || null
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return null
}

/** '정렬용 머리표' 를 뗀다: 'A. 문체부장관상(대상)' → '문체부장관상(대상)' */
const stripSortPrefix = (text: string) => text.replace(/^[A-Z]\.\s*/, '')

export function feeStatus(raw: string | null): FeeStatus {
  if (!raw) return 'pending'
  if (CONFIRMED_FEES.has(raw)) return 'confirmed'
  if (WITHDRAWN.has(raw)) return 'withdrawn'
  // 표구비 칸의 '낙선' 처럼 납부와 무관한 값은 추측하지 않는다
  return 'unknown'
}

export function resultStatus(raw: string | null): ResultStatus {
  if (!raw) return 'pending'
  const text = stripSortPrefix(raw)
  if (AWARDS.has(text)) return 'awarded'
  if (NOT_SELECTED.has(text)) return 'not_selected'
  if (WITHDRAWN.has(text)) return 'withdrawn'
  return 'unknown'
}

export function normalizeEmail(raw: string | null): string | null {
  const email = raw?.normalize('NFC').trim().toLowerCase()
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

/** 레코드 하나 → 사본 행. 대응표에 없는 칸은 읽지 않는다. */
export function mapContestEntry(
  source: ContestSource,
  record: AirtableRecord,
  syncedAt: string
): ContestEntryRow {
  const text = (column: EntryColumn) => {
    const fieldId = source.fields[column]
    return fieldId ? cellText(record.fields[fieldId]) : null
  }
  const feeRaw = text('fee')
  const resultRaw = text('result')
  const submitted = text('submittedAt') ?? record.createdTime ?? null
  return {
    source_key: source.key,
    airtable_record_id: record.id,
    contest_year: source.year,
    contest_name: text('contestName') ?? source.contestName,
    title: text('title'),
    division: text('division'),
    script_style: text('scriptStyle'),
    fee_status_raw: feeRaw,
    fee_status: feeStatus(feeRaw),
    result_raw: resultRaw ? stripSortPrefix(resultRaw) : null,
    result_status: resultStatus(resultRaw),
    entrant_name: text('entrantName'),
    entrant_name_hanja: text('entrantNameHanja'),
    entrant_email: normalizeEmail(text('entrantEmail')),
    submitted_at: submitted && !Number.isNaN(Date.parse(submitted)) ? submitted : null,
    synced_at: syncedAt,
  }
}

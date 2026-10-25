/**
 * Airtable 공모전 출품 테이블 → Supabase contest_entries 사본 (허용 칸만)
 *
 * 사용법 (본인 터미널에서):
 *   export AIRTABLE_TOKEN=...                   # 읽기 전용 개인 토큰 (data.records:read, 이 베이스만)
 *   export ASCA_SUPABASE_SERVICE_ROLE_KEY=...   # --apply 때, 그리고 남은 사본 확인에 필요
 *   node --import tsx scripts/sync-contest-entries.ts           # 미리 보기 — 개수·상태 분포만 출력
 *   node --import tsx scripts/sync-contest-entries.ts --apply   # 사본에 반영 (airtable_record_id 기준 덮어쓰기)
 *   --source 2025-entries   한 원본만
 *
 * 끝에 "Airtable 에서 사라진 기록"을 알린다 — 사본에는 있는데 이번에 받지 못한 레코드.
 * 지우지 않는다. 서비스 키가 있을 때만 확인한다(미리 보기에서도).
 *
 * 이름·이메일은 화면에 찍지 않는다. 키도 찍지 않는다 — 대화창(!)에 붙여 넣지 말 것.
 * 연결 칸(artist_id·match_*)은 보내지 않으므로 관리자가 확인한 연결은 그대로 남는다.
 * SUPABASE_URL 을 주면 그 주소(로컬 시험용)에 쓴다. 기본은 운영(ASCA-2026).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { CONTEST_SOURCES } from '../lib/contests/sources'
import { fetchContestRecords } from '../lib/contests/airtable-fetch'
import { mapContestEntry, type ContestEntryRow } from '../lib/contests/entry-mapper'
import { findStaleEntries, staleLine, type MirroredEntry } from '../lib/contests/stale-entries'

const PRODUCTION_URL = 'https://caxjyimsuvjnbmjoxfad.supabase.co'
const CHUNK = 200
const PAGE = 1000

const tally = (rows: ContestEntryRow[], key: 'fee_status' | 'result_status') =>
  rows.reduce<Record<string, number>>((counts, row) => {
    counts[row[key]] = (counts[row[key]] ?? 0) + 1
    return counts
  }, {})

async function upsertRows(supabase: SupabaseClient, rows: ContestEntryRow[]): Promise<void> {
  for (let start = 0; start < rows.length; start += CHUNK) {
    const { error } = await supabase
      .from('contest_entries')
      .upsert(rows.slice(start, start + CHUNK), { onConflict: 'airtable_record_id' })
    if (error) throw new Error(`반영 실패 (${start}번째부터): ${error.message}`)
  }
}

/** 이번에 읽은 원본들의 사본 행 — 이름·이메일 칸은 읽지 않는다 */
async function loadMirrored(supabase: SupabaseClient, keys: string[]): Promise<MirroredEntry[]> {
  const rows: MirroredEntry[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('contest_entries')
      .select('airtable_record_id,source_key,contest_year,title,artist_id')
      .in('source_key', keys)
      .order('airtable_record_id')
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`사본 읽기 실패: ${error.message}`)
    rows.push(...((data ?? []) as MirroredEntry[]))
    if (!data || data.length < PAGE) return rows
  }
}

async function reportStale(
  supabase: SupabaseClient,
  fetchedBySource: Map<string, Set<string>>
): Promise<void> {
  const mirrored = await loadMirrored(supabase, [...fetchedBySource.keys()])
  const reports = findStaleEntries(mirrored, fetchedBySource)
  const total = reports.reduce((sum, report) => sum + report.stale.length, 0)
  console.log(`\nAirtable 에서 사라진 기록: ${total}건 (지우지 않음 — 확인용)`)
  for (const report of reports) {
    if (report.suspicious)
      console.warn(
        `⚠️  ${report.sourceKey}: Airtable 이 0건을 돌려줬습니다. 표나 토큰 권한을 확인하세요.`
      )
    if (!report.stale.length) continue
    console.log(`${report.sourceKey}: ${report.stale.length}건`)
    for (const entry of report.stale) console.log(`  - ${staleLine(entry)}`)
  }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const only = process.argv.includes('--source')
    ? process.argv[process.argv.indexOf('--source') + 1]
    : undefined
  const sources = CONTEST_SOURCES.filter(source => !only || source.key === only)
  if (!sources.length)
    throw new Error(`원본이 없습니다: ${only}. 가능: ${CONTEST_SOURCES.map(s => s.key).join(', ')}`)

  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new Error('AIRTABLE_TOKEN 이 필요합니다.')
  const key = process.env.ASCA_SUPABASE_SERVICE_ROLE_KEY
  if (apply && !key) throw new Error('--apply 에는 ASCA_SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')

  const syncedAt = new Date().toISOString()
  const rows: ContestEntryRow[] = []
  // 끝까지 읽은 원본만 담긴다 — 중간에 실패하면 fetchContestRecords 가 던져 여기까지 오지 않는다
  const fetchedBySource = new Map<string, Set<string>>()
  for (const source of sources) {
    const records = await fetchContestRecords(source, token)
    const mapped = records.map(record => mapContestEntry(source, record, syncedAt))
    rows.push(...mapped)
    fetchedBySource.set(source.key, new Set(records.map(record => record.id)))
    console.log(
      `${source.key}: ${mapped.length}건 · 이메일 ${mapped.filter(r => r.entrant_email).length}건`,
      '· 출품비',
      tally(mapped, 'fee_status'),
      '· 결과',
      tally(mapped, 'result_status')
    )
  }

  const url = process.env.SUPABASE_URL ?? PRODUCTION_URL
  const supabase = key ? createClient(url, key, { auth: { persistSession: false } }) : null

  if (apply && supabase) {
    await upsertRows(supabase, rows)
    console.log(`✅ ${rows.length}건 반영 (${url === PRODUCTION_URL ? '운영' : url})`)
  } else {
    console.log(`\n미리 보기입니다 (${rows.length}건). 반영하려면 --apply 를 붙여 다시 실행하세요.`)
  }

  if (supabase) await reportStale(supabase, fetchedBySource)
  else console.log('사라진 기록 확인은 ASCA_SUPABASE_SERVICE_ROLE_KEY 가 있을 때만 합니다.')
}

main().catch((error: unknown) => {
  console.error(`❌ ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})

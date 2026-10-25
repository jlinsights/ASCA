/**
 * Airtable 공모전 출품 테이블 → Supabase contest_entries 사본 (허용 칸만)
 *
 * 사용법 (본인 터미널에서):
 *   export AIRTABLE_TOKEN=...                   # 읽기 전용 개인 토큰 (data.records:read, 이 베이스만)
 *   export ASCA_SUPABASE_SERVICE_ROLE_KEY=...   # --apply 때만 필요
 *   node --import tsx scripts/sync-contest-entries.mts           # 미리 보기 — 개수·상태 분포만 출력
 *   node --import tsx scripts/sync-contest-entries.mts --apply   # 사본에 반영 (airtable_record_id 기준 덮어쓰기)
 *   --source 2025-entries   한 원본만
 *
 * 이름·이메일은 화면에 찍지 않는다. 키도 찍지 않는다 — 대화창(!)에 붙여 넣지 말 것.
 * 연결 칸(artist_id·match_*)은 보내지 않으므로 관리자가 확인한 연결은 그대로 남는다.
 * SUPABASE_URL 을 주면 그 주소(로컬 시험용)에 쓴다. 기본은 운영(ASCA-2026).
 */
import { createClient } from '@supabase/supabase-js'
import { CONTEST_SOURCES } from '../lib/contests/sources'
import { fetchContestRecords } from '../lib/contests/airtable-fetch'
import { mapContestEntry, type ContestEntryRow } from '../lib/contests/entry-mapper'

const PRODUCTION_URL = 'https://caxjyimsuvjnbmjoxfad.supabase.co'
const CHUNK = 200

const apply = process.argv.includes('--apply')
const only = process.argv.includes('--source')
  ? process.argv[process.argv.indexOf('--source') + 1]
  : undefined
const sources = CONTEST_SOURCES.filter(source => !only || source.key === only)
if (!sources.length) {
  console.error(`❌ 원본이 없습니다: ${only}. 가능: ${CONTEST_SOURCES.map(s => s.key).join(', ')}`)
  process.exit(1)
}

const token = process.env.AIRTABLE_TOKEN
if (!token) {
  console.error('❌ AIRTABLE_TOKEN 이 필요합니다.')
  process.exit(1)
}

const tally = (rows: ContestEntryRow[], key: 'fee_status' | 'result_status') =>
  rows.reduce<Record<string, number>>((counts, row) => {
    counts[row[key]] = (counts[row[key]] ?? 0) + 1
    return counts
  }, {})

const syncedAt = new Date().toISOString()
const rows: ContestEntryRow[] = []
for (const source of sources) {
  const records = await fetchContestRecords(source, token)
  const mapped = records.map(record => mapContestEntry(source, record, syncedAt))
  rows.push(...mapped)
  console.log(
    `${source.key}: ${mapped.length}건 · 이메일 ${mapped.filter(r => r.entrant_email).length}건`,
    '· 출품비',
    tally(mapped, 'fee_status'),
    '· 결과',
    tally(mapped, 'result_status')
  )
}

if (!apply) {
  console.log(`\n미리 보기입니다 (${rows.length}건). 반영하려면 --apply 를 붙여 다시 실행하세요.`)
  process.exit(0)
}

const key = process.env.ASCA_SUPABASE_SERVICE_ROLE_KEY
if (!key) {
  console.error('❌ --apply 에는 ASCA_SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')
  process.exit(1)
}
const url = process.env.SUPABASE_URL ?? PRODUCTION_URL
const supabase = createClient(url, key, { auth: { persistSession: false } })
for (let start = 0; start < rows.length; start += CHUNK) {
  const { error } = await supabase
    .from('contest_entries')
    .upsert(rows.slice(start, start + CHUNK), { onConflict: 'airtable_record_id' })
  if (error) {
    console.error(`❌ 반영 실패 (${start}번째부터): ${error.message}`)
    process.exit(1)
  }
}
console.log(`✅ ${rows.length}건 반영 (${url === PRODUCTION_URL ? '운영' : url})`)

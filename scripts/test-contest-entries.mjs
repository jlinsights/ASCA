/**
 * 공모전 출품 사본 — 격리된 로컬 Supabase 에서 실제 역할·제약으로 검사한다.
 * 운영 URL 은 쓰지 않는다. SUPABASE_WORKDIR 가 있으면 그 폴더의 로컬 스택을 쓴다.
 */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import pg from 'pg'
import { createClient } from '@supabase/supabase-js'

const workdir = process.env.SUPABASE_WORKDIR ? ['--workdir', process.env.SUPABASE_WORKDIR] : []
const local = JSON.parse(
  execFileSync('supabase', ['status', '-o', 'json', ...workdir], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
)
if (!/^postgresql:\/\/postgres:postgres@127\.0\.0\.1:/.test(local.DB_URL))
  throw Error('Local test database required')

const db = new pg.Client({ connectionString: local.DB_URL })
await db.connect()
const service = createClient(local.API_URL, local.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const password = `entry-${randomUUID()}`
const userIds = []
const artist = randomUUID()
const recordIds = ['recTESTAAAAAAAAAA', 'recTESTBBBBBBBBBB']
let checks = 0

async function rejectsCode(promise, code, label) {
  await assert.rejects(promise, e => e.code === code, label)
  checks++
}
const row = (id, overrides = {}) => ({
  source_key: '2025-entries',
  airtable_record_id: id,
  contest_year: 2025,
  contest_name: '시험 공모전',
  title: '시험 작품',
  division: '한문서예',
  script_style: '행서',
  fee_status_raw: null,
  fee_status: 'pending',
  result_raw: null,
  result_status: 'pending',
  entrant_name: '시험작가',
  entrant_name_hanja: null,
  entrant_email: 'artist@example.test',
  submitted_at: null,
  synced_at: new Date().toISOString(),
  ...overrides,
})
const upsert = rows =>
  service.from('contest_entries').upsert(rows, { onConflict: 'airtable_record_id' })
const entry = async id =>
  (await db.query('select * from contest_entries where airtable_record_id=$1', [id])).rows[0]

try {
  const email = `entry-${randomUUID()}@example.test`
  const created = await service.auth.admin.createUser({ email, password, email_confirm: true })
  assert.equal(created.error, null, created.error?.message)
  userIds.push(created.data.user.id)
  const member = createClient(local.API_URL, local.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  assert.equal((await member.auth.signInWithPassword({ email, password })).error, null)
  await db.query(
    `insert into artists(id, name, visibility, membership_type) values ($1, '출품 시험', 'public', '초대작가')`,
    [artist]
  )

  // 1. 동기화 upsert — 처음엔 넣고, 다시 돌리면 같은 행을 고친다
  assert.equal((await upsert([row(recordIds[0]), row(recordIds[1])])).error, null)
  assert.equal((await upsert([row(recordIds[0], { fee_status: 'confirmed' })])).error, null)
  const count = await db.query('select count(*)::int as n from contest_entries where airtable_record_id = any($1)', [recordIds])
  assert.equal(count.rows[0].n, 2)
  assert.equal((await entry(recordIds[0])).fee_status, 'confirmed')
  checks += 2

  // 2. 관리자 연결은 다음 동기화가 덮지 않는다 (동기화 행에 연결 칸이 없다)
  await db.query(
    "update contest_entries set artist_id=$1, match_method='admin', matched_at=now() where airtable_record_id=$2",
    [artist, recordIds[1]]
  )
  assert.equal((await upsert([row(recordIds[1], { result_status: 'awarded', result_raw: '입선' })])).error, null)
  const kept = await entry(recordIds[1])
  assert.equal(kept.artist_id, artist)
  assert.equal(kept.match_method, 'admin')
  assert.equal(kept.result_status, 'awarded')
  checks += 2

  // 3. 회원·익명 역할은 사본을 읽지도 쓰지도 못한다
  const memberRead = await member.from('contest_entries').select('id')
  assert.ok(memberRead.error || memberRead.data.length === 0, 'member must not read entries')
  const anonRead = await createClient(local.API_URL, local.ANON_KEY).from('contest_entries').select('id')
  assert.ok(anonRead.error || anonRead.data.length === 0, 'anon must not read entries')
  assert.ok((await member.from('contest_entries').insert(row('recTESTCCCCCCCCCC'))).error)
  checks += 3

  // 4. 제약 — 알 수 없는 상태, 대문자 이메일, 반쪽 연결, 잘못된 레코드 ID 는 거부
  const insert = values =>
    db.query(
      `insert into contest_entries(source_key, airtable_record_id, contest_year, contest_name, ${Object.keys(values).join(', ')})
       values ('t', 'recTESTDDDDDDDDDD', 2025, 't', ${Object.keys(values).map((_, i) => `$${i + 1}`).join(', ')})`,
      Object.values(values)
    )
  await rejectsCode(insert({ fee_status: 'paid' }), '23514', 'unknown fee status')
  await rejectsCode(insert({ result_status: 'gold' }), '23514', 'unknown result status')
  await rejectsCode(insert({ entrant_email: 'Artist@Example.test' }), '23514', 'unnormalized email')
  await rejectsCode(insert({ artist_id: artist }), '23514', 'artist without match method')
  await rejectsCode(
    db.query(
      `insert into contest_entries(source_key, airtable_record_id, contest_year, contest_name) values ('t', 'not-a-record', 2025, 't')`
    ),
    '23514',
    'bad record id'
  )

  await rejectsCode(insert({ match_method: 'email' }), '23514', 'unknown match method')

  // 5. 연결된 작가 행도 지울 수 있다 — 연결만 풀리고 출품 기록과 "관리자가 이었음" 이력은 남는다
  await db.query('delete from artists where id=$1', [artist])
  const orphan = await entry(recordIds[1])
  assert.equal(orphan.artist_id, null)
  assert.equal(orphan.match_method, 'admin')
  checks += 2

  console.log(`contest entry checks passed: ${checks}`)
} finally {
  await db.query('delete from contest_entries where airtable_record_id like $1', ['recTEST%'])
  await db.query('delete from artists where id=$1', [artist])
  for (const id of userIds) await service.auth.admin.deleteUser(id)
  await db.end()
}

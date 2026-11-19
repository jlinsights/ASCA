/**
 * 문의 접수함(inquiries) — 격리된 로컬 Supabase 에서 실제 역할·제약으로 검사한다.
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
const options = { auth: { persistSession: false, autoRefreshToken: false } }
const service = createClient(local.API_URL, local.SERVICE_ROLE_KEY, options)
const anon = createClient(local.API_URL, local.ANON_KEY, options)
const ids = []
const userIds = []
let checks = 0

const row = (overrides = {}) => ({
  topic: 'commission',
  name: '시험 문의자',
  email: 'visitor@example.test',
  phone: null,
  subject: '현판',
  plan: '내년 봄',
  message: '현판 휘호를 부탁드립니다.',
  language: 'ko',
  ...overrides,
})

/** service_role 로 넣어 보고 제약 위반이면 그 이름을 돌려준다 */
async function violation(overrides) {
  const { error } = await service.from('inquiries').insert(row(overrides))
  checks++
  return error?.message ?? null
}

try {
  // 1. service_role 은 넣고 읽는다 — 상태 기본값은 new
  const { data: created, error } = await service
    .from('inquiries')
    .insert(row())
    .select('id,status,handled_at')
    .single()
  assert.equal(error, null, error?.message)
  ids.push(created.id)
  assert.equal(created.status, 'new')
  assert.equal(created.handled_at, null)
  checks++

  // 2. 익명·회원은 넣지도 읽지도 못한다
  const anonInsert = await anon.from('inquiries').insert(row())
  assert.ok(anonInsert.error, '익명 쓰기가 막혀야 한다')
  const anonRead = await anon.from('inquiries').select('id')
  assert.ok(anonRead.error || anonRead.data.length === 0, '익명 읽기가 막혀야 한다')
  checks += 2

  const email = `inquiry-${randomUUID()}@example.test`
  const password = `inquiry-${randomUUID()}`
  const user = await service.auth.admin.createUser({ email, password, email_confirm: true })
  assert.equal(user.error, null, user.error?.message)
  userIds.push(user.data.user.id)
  const member = createClient(local.API_URL, local.ANON_KEY, options)
  assert.equal((await member.auth.signInWithPassword({ email, password })).error, null)
  assert.ok((await member.from('inquiries').insert(row())).error, '회원 쓰기가 막혀야 한다')
  const memberRead = await member.from('inquiries').select('id')
  assert.ok(memberRead.error || memberRead.data.length === 0, '회원 읽기가 막혀야 한다')
  checks += 2

  const grants = await db.query(
    `select grantee, privilege_type from information_schema.role_table_grants
      where table_schema='public' and table_name='inquiries' and grantee in ('anon','authenticated')`
  )
  assert.deepEqual(grants.rows, [], 'anon·authenticated 에 권한이 없어야 한다')
  checks++

  // 3. 제약 — 연락처·이메일 모양·용건·길이·상태
  assert.match(await violation({ email: null, phone: null }), /inquiries_contact/)
  assert.match(await violation({ email: 'Visitor@Example.test' }), /inquiries_email/)
  assert.match(await violation({ topic: 'spam' }), /inquiries_topic/)
  assert.match(await violation({ name: '   ' }), /inquiries_name/)
  assert.match(await violation({ message: '가'.repeat(5001) }), /inquiries_message/)
  assert.match(await violation({ plan: '가'.repeat(301) }), /inquiries_plan/)
  assert.match(await violation({ language: 'fr' }), /inquiries_language/)
  assert.match(await violation({ status: 'answered' }), /inquiries_handled/)
  assert.equal(await violation({ email: null, phone: '010-0000-0000', plan: null }), null)
  const phoneOnly = await db.query(
    "select id from inquiries where phone='010-0000-0000' and email is null"
  )
  ids.push(...phoneOnly.rows.map(r => r.id))

  // 4. 처리 — 답함은 처리 시각이 있어야 하고, 지우면 사라진다
  const answered = await service
    .from('inquiries')
    .update({ status: 'answered', handled_at: new Date().toISOString() })
    .eq('id', created.id)
    .select('status')
  assert.equal(answered.error, null, answered.error?.message)
  assert.equal(answered.data[0].status, 'answered')
  const removed = await service.from('inquiries').delete().eq('id', created.id).select('id')
  assert.equal(removed.data.length, 1)
  checks += 2

  console.log(`inquiries: ${checks} checks passed`)
} finally {
  if (ids.length) await db.query('delete from inquiries where id = any($1)', [ids])
  for (const id of userIds) await service.auth.admin.deleteUser(id)
  await db.end()
}

/**
 * 도너스 구성원 연결(donus_member_links) — 격리된 로컬 Supabase 에서 실제 역할·제약으로 검사한다.
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
const userIds = []
let checks = 0

async function newUser() {
  const email = `donus-${randomUUID()}@example.test`
  const password = `donus-${randomUUID()}`
  const user = await service.auth.admin.createUser({ email, password, email_confirm: true })
  assert.equal(user.error, null, user.error?.message)
  userIds.push(user.data.user.id)
  return { id: user.data.user.id, email, password }
}

const row = (account_id, overrides = {}) => ({
  account_id,
  member_idx: Math.floor(Math.random() * 1e9) + 1,
  member_code: 'T0001',
  ...overrides,
})

async function violation(values) {
  const { error } = await service.from('donus_member_links').insert(values)
  checks++
  return error?.message ?? null
}

try {
  const a = await newUser()
  const b = await newUser()

  // 1. service_role 은 넣고 읽는다 — 기본값 link_source=email, 상태 칸은 비어 있다
  const { data: created, error } = await service
    .from('donus_member_links')
    .insert(row(a.id, { member_idx: 101 }))
    .select('link_source,lifecycle,dues_paid_year,dues_history_checked')
    .single()
  assert.equal(error, null, error?.message)
  assert.deepEqual(created, {
    link_source: 'email',
    lifecycle: null,
    dues_paid_year: null,
    dues_history_checked: false,
  })
  checks++

  // 2. 익명·회원(본인 포함)은 넣지도 읽지도 못한다
  assert.ok(
    (await anon.from('donus_member_links').insert(row(b.id))).error,
    '익명 쓰기가 막혀야 한다'
  )
  const anonRead = await anon.from('donus_member_links').select('account_id')
  assert.ok(anonRead.error || anonRead.data.length === 0, '익명 읽기가 막혀야 한다')
  const member = createClient(local.API_URL, local.ANON_KEY, options)
  assert.equal(
    (await member.auth.signInWithPassword({ email: a.email, password: a.password })).error,
    null
  )
  const memberRead = await member.from('donus_member_links').select('account_id')
  assert.ok(memberRead.error || memberRead.data.length === 0, '회원은 자기 연결도 읽지 못한다')
  assert.ok(
    (await member.from('donus_member_links').insert(row(b.id))).error,
    '회원 쓰기가 막혀야 한다'
  )
  checks += 4

  const grants = await db.query(
    `select grantee, privilege_type from information_schema.role_table_grants
      where table_schema='public' and table_name='donus_member_links' and grantee in ('anon','authenticated')`
  )
  assert.deepEqual(grants.rows, [], 'anon·authenticated 에 권한이 없어야 한다')
  checks++

  // 3. 연락처 칸이 없다(이름·이메일·휴대폰을 옮기지 않는다)
  const columns = await db.query(
    `select column_name from information_schema.columns
      where table_schema='public' and table_name='donus_member_links' order by column_name`
  )
  assert.deepEqual(
    columns.rows.map(r => r.column_name),
    [
      'account_id',
      'dues_history_checked',
      'dues_paid_year',
      'last_pay_date',
      'lifecycle',
      'link_source',
      'linked_at',
      'member_code',
      'member_idx',
      'synced_at',
    ]
  )
  checks++

  // 4. 제약 — 한 구성원은 한 계정에만, 출처·생애주기·연도·코드
  assert.match(await violation(row(b.id, { member_idx: 101 })), /donus_member_links_member_idx/)
  assert.match(await violation(row(b.id, { link_source: 'guess' })), /donus_member_links_source/)
  assert.match(await violation(row(b.id, { lifecycle: 6 })), /donus_member_links_lifecycle/)
  assert.match(await violation(row(b.id, { dues_paid_year: 1999 })), /donus_member_links_dues_year/)
  assert.match(await violation(row(b.id, { member_code: ' ' })), /donus_member_links_member_code/)
  assert.match(
    await violation(row(b.id, { member_idx: 0 })),
    /donus_member_links_member_idx_positive/
  )

  // 5. 계정이 지워지면 연결도 지워진다
  await service.auth.admin.deleteUser(a.id)
  userIds.splice(userIds.indexOf(a.id), 1)
  const gone = await service.from('donus_member_links').select('account_id').eq('account_id', a.id)
  assert.equal(gone.data.length, 0)
  checks++

  console.log(`donus_member_links: ${checks} checks passed`)
} finally {
  for (const id of userIds) await service.auth.admin.deleteUser(id)
  await db.end()
}

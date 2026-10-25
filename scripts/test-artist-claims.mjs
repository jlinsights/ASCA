/**
 * 작가 페이지 연결 요청 — 격리된 로컬 Supabase 에서 실제 역할·RLS·함수로 검사한다.
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
const password = `claim-${randomUUID()}`
const userIds = []
const [artistA, artistB] = [randomUUID(), randomUUID()]
let checks = 0

const rows = async (sql, params = []) => (await db.query(sql, params)).rows
async function rejectsCode(promise, code, label) {
  await assert.rejects(promise, e => e.code === code, label)
  checks++
}
function expectError(result, label) {
  assert.ok(result.error, `${label}: expected an error`)
  checks++
}
async function user(label) {
  const email = `claim-${label}-${randomUUID()}@example.test`
  const created = await service.auth.admin.createUser({ email, password, email_confirm: true })
  assert.equal(created.error, null, created.error?.message)
  userIds.push(created.data.user.id)
  const client = createClient(local.API_URL, local.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const signedIn = await client.auth.signInWithPassword({ email, password })
  assert.equal(signedIn.error, null, signedIn.error?.message)
  return { id: created.data.user.id, client }
}
const request = (accountId, artistId, name = '시험 작가') =>
  db.query(
    `insert into artist_claim_requests(account_id, artist_id, claimed_name, note)
     values ($1, $2, $3, '시험 요청') returning id`,
    [accountId, artistId, name]
  )
const approve = (requestId, adminId, artistId = null) =>
  db.query('select approve_artist_claim($1, $2, $3) as artist_id', [requestId, adminId, artistId])
const claimedBy = async id =>
  (await rows('select claimed_by_user_id from artists where id=$1', [id]))[0].claimed_by_user_id
const myArtists = async client => {
  const { data, error } = await client.rpc('get_my_artist_ids')
  assert.equal(error, null, error?.message)
  return data.map(row => row.artist_id)
}

try {
  await db.query(
    `insert into artists(id, name, visibility, membership_type)
     values ($1, '연결 시험 갑', 'public', '초대작가'), ($2, '연결 시험 을', 'public', '초대작가')`,
    [artistA, artistB]
  )
  const memberA = await user('a')
  const memberB = await user('b')
  const memberC = await user('c')
  const reviewer = await user('admin')
  await db.query("update account_profiles set role='admin' where id=$1", [reviewer.id])

  // 1. 계정당 대기 요청은 하나
  const reqA = (await request(memberA.id, artistA)).rows[0].id
  await rejectsCode(request(memberA.id, artistB), '23505', 'second pending request per account')
  // 같은 작가 행에 다른 계정의 요청은 받는다 — 협회가 가린다
  const reqB = (await request(memberB.id, artistA)).rows[0].id

  // 2. RLS — 자기 요청만 읽고, 직접 쓰기·함수 호출은 막힌다
  const ownA = await memberA.client.from('artist_claim_requests').select('id, account_id')
  assert.equal(ownA.error, null, ownA.error?.message)
  assert.deepEqual(
    ownA.data.map(r => r.id),
    [reqA]
  )
  checks++
  const anon = createClient(local.API_URL, local.ANON_KEY)
  const anonRead = await anon.from('artist_claim_requests').select('id')
  assert.ok(anonRead.error || anonRead.data.length === 0, 'anon must not read claim requests')
  checks++
  expectError(
    await memberA.client
      .from('artist_claim_requests')
      .insert({ account_id: memberA.id, artist_id: artistB, claimed_name: '직접 쓰기' }),
    'member direct insert'
  )
  expectError(
    await memberA.client
      .from('artist_claim_requests')
      .update({ status: 'approved' })
      .eq('id', reqA),
    'member direct update'
  )
  expectError(
    await memberA.client.rpc('approve_artist_claim', { p_request: reqA, p_admin: memberA.id }),
    'member calls approve'
  )
  expectError(
    await memberA.client
      .from('artists')
      .update({ claimed_by_user_id: memberA.id })
      .eq('id', artistA),
    'member writes ownership'
  )

  // 3. 관리자가 아니면 승인할 수 없다
  await rejectsCode(approve(reqA, memberB.id), '42501', 'non-admin approve')
  assert.equal(await claimedBy(artistA), null)
  checks++

  // 4. 승인 — 연결되고 get_my_artist_ids 에 나타난다
  const approved = await approve(reqA, reviewer.id)
  assert.equal(approved.rows[0].artist_id, artistA)
  assert.equal(await claimedBy(artistA), memberA.id)
  assert.deepEqual(await myArtists(memberA.client), [artistA])
  assert.deepEqual(await myArtists(memberB.client), [])
  checks += 4
  const approvedRow = (
    await rows('select status, reviewed_by, reviewed_at from artist_claim_requests where id=$1', [
      reqA,
    ])
  )[0]
  assert.equal(approvedRow.status, 'approved')
  assert.equal(approvedRow.reviewed_by, reviewer.id)
  assert.ok(approvedRow.reviewed_at)
  checks++

  // 5. 이미 연결된 작가 행은 두 번째 승인이 실패하고, 실패한 요청은 대기로 남는다
  await rejectsCode(approve(reqB, reviewer.id), '23505', 'approve already-linked artist')
  assert.equal(await claimedBy(artistA), memberA.id)
  assert.equal(
    (await rows('select status from artist_claim_requests where id=$1', [reqB]))[0].status,
    'pending'
  )
  checks += 2
  // 같은 요청을 두 번 승인할 수 없다
  await rejectsCode(approve(reqA, reviewer.id), '55000', 'approve twice')

  // 6. 반려 — 한 번만
  await db.query("select reject_artist_claim($1, $2, '본인 확인 불가')", [reqB, reviewer.id])
  await rejectsCode(
    db.query('select reject_artist_claim($1, $2)', [reqB, reviewer.id]),
    '55000',
    'reject twice'
  )

  // 요청 없이 연결된 작가 행(이전 방식·수동 연결)도 덮어쓰지 않는다 — 고유 인덱스로는 못 막는 경우
  await db.query('update artists set claimed_by_user_id=$1 where id=$2', [memberC.id, artistB])
  const reqOver = (await request(memberB.id, null, '덮어쓰기 시도')).rows[0].id
  await rejectsCode(approve(reqOver, reviewer.id, artistB), '23505', 'approve over a direct link')
  assert.equal(await claimedBy(artistB), memberC.id)
  checks++
  await db.query('update artists set claimed_by_user_id=null where id=$1', [artistB])
  await db.query("select reject_artist_claim($1, $2, '시험')", [reqOver, reviewer.id])

  // 7. "목록에 없음" 요청 — 협회가 작가 행을 정해야 승인된다
  const reqC = (await request(memberC.id, null, '비공개 작가')).rows[0].id
  await rejectsCode(approve(reqC, reviewer.id), '22023', 'unlisted approve without artist')
  await approve(reqC, reviewer.id, artistB)
  assert.equal(await claimedBy(artistB), memberC.id)
  assert.deepEqual(await myArtists(memberC.client), [artistB])
  checks += 2

  // 8. 해제 — 연결을 떼고 이력은 revoked 로 남는다. 해제 후 새 요청을 낼 수 있다
  await db.query("select revoke_artist_claim($1, $2, '잘못 연결')", [reqA, reviewer.id])
  assert.equal(await claimedBy(artistA), null)
  assert.deepEqual(await myArtists(memberA.client), [])
  const revoked = (
    await rows('select status, revoked_by, revoked_at from artist_claim_requests where id=$1', [
      reqA,
    ])
  )[0]
  assert.equal(revoked.status, 'revoked')
  assert.equal(revoked.revoked_by, reviewer.id)
  checks += 3
  await request(memberA.id, artistA)
  checks++

  // 9. 상태와 검토 기록이 어긋나는 행은 넣을 수 없다
  await rejectsCode(
    db.query(
      `insert into artist_claim_requests(account_id, artist_id, claimed_name, status)
       values ($1, $2, '어긋남', 'approved')`,
      [memberB.id, artistB]
    ),
    '23514',
    'approved without review time'
  )

  // 10. 비활성 관리자는 검토할 수 없다
  await db.query('update account_profiles set disabled_at=now() where id=$1', [reviewer.id])
  const reqLate = (await request(memberB.id, artistA)).rows[0].id
  await rejectsCode(approve(reqLate, reviewer.id), '42501', 'disabled admin approve')

  console.log(`artist claim checks passed: ${checks}`)
} finally {
  // 이 시험이 만든 계정의 요청만 지운다
  await db.query('delete from artist_claim_requests where account_id = any($1)', [userIds])
  await db.query('delete from artists where id = any($1)', [[artistA, artistB]])
  for (const id of userIds) await service.auth.admin.deleteUser(id)
  await db.end()
}

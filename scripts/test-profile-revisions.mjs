/**
 * 작가 프로필 수정 이력 — 격리된 로컬 Supabase 에서 실제 역할·함수로 검사한다.
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
const password = `rev-${randomUUID()}`
const userIds = []
const artist = randomUUID()
let checks = 0

const rows = async (sql, params = []) => (await db.query(sql, params)).rows
async function rejectsCode(promise, code, label) {
  await assert.rejects(promise, e => e.code === code, label)
  checks++
}
async function user(label) {
  const email = `rev-${label}-${randomUUID()}@example.test`
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
const edit = (accountId, patch) =>
  db.query('select apply_artist_profile_edit($1, $2, $3::jsonb) as id', [
    artist,
    accountId,
    JSON.stringify(patch),
  ])
const revert = (revisionId, adminId) =>
  db.query('select revert_artist_profile_revision($1, $2) as id', [revisionId, adminId])
const profile = async () =>
  (await rows('select name_en, bio, birth_year, specialties from artists where id=$1', [artist]))[0]

try {
  const owner = await user('owner')
  const stranger = await user('stranger')
  const admin = await user('admin')
  await db.query("update account_profiles set role='admin' where id=$1", [admin.id])
  await db.query(
    `insert into artists(id, name, bio, birth_year, specialties, visibility, membership_type, claimed_by_user_id)
     values ($1, '이력 시험', '처음 소개', 1960, '{해서}', 'public', '초대작가', $2)`,
    [artist, owner.id]
  )

  // 1. 소유자가 아니면 수정할 수 없다
  await rejectsCode(edit(stranger.id, { bio: '남의 소개' }), 'P0002', 'stranger edit')
  assert.equal((await profile()).bio, '처음 소개')
  checks++

  // 2. 허용 밖 칸은 거부하고 아무것도 바꾸지 않는다
  await rejectsCode(
    edit(owner.id, { bio: '새 소개', visibility: 'hidden' }),
    '22023',
    'protected field in patch'
  )
  assert.equal((await profile()).bio, '처음 소개')
  checks++

  // 3. 수정은 바로 반영되고, 바뀐 칸만 전후 값으로 기록된다
  const first = (
    await edit(owner.id, { bio: '새 소개', birth_year: 1960, specialties: ['행서', '초서'] })
  ).rows[0].id
  assert.deepEqual(await profile(), {
    name_en: null,
    bio: '새 소개',
    birth_year: 1960,
    specialties: ['행서', '초서'],
  })
  const [rev] = await rows('select account_id, changes from artist_profile_revisions where id=$1', [
    first,
  ])
  assert.equal(rev.account_id, owner.id)
  assert.deepEqual(rev.changes, {
    bio: { before: '처음 소개', after: '새 소개' },
    specialties: { before: ['해서'], after: ['행서', '초서'] },
  })
  checks += 3

  // 4. 값이 그대로인 수정은 이력을 남기지 않는다
  assert.equal((await edit(owner.id, { bio: '새 소개' })).rows[0].id, null)
  checks++

  // 5. 회원 역할로는 이력을 읽지도, 함수를 부르지도 못한다
  const read = await owner.client.from('artist_profile_revisions').select('id')
  assert.ok(read.error || read.data.length === 0, 'member must not read revisions')
  const call = await owner.client.rpc('apply_artist_profile_edit', {
    p_artist: artist,
    p_account: owner.id,
    p_patch: { bio: '직접 호출' },
  })
  assert.ok(call.error, 'member must not call the edit function')
  const set = await owner.client.rpc('set_artist_profile_fields', {
    p_artist: artist,
    p_values: { bio: '직접 호출' },
  })
  assert.ok(set.error, 'member must not call the internal setter')
  assert.equal((await profile()).bio, '새 소개')
  checks += 4

  // 6. 관리자가 아니면 되돌릴 수 없다
  await rejectsCode(revert(first, owner.id), '42501', 'non-admin revert')

  // 7. 그 뒤로 같은 칸이 다시 바뀌었으면 되돌리지 않는다 — 새 수정을 덮지 않는다
  const second = (await edit(owner.id, { bio: '두 번째 소개' })).rows[0].id
  await rejectsCode(revert(first, admin.id), '40001', 'revert over a newer edit')
  assert.equal((await profile()).bio, '두 번째 소개')
  checks++

  // 8. 최신 수정은 되돌릴 수 있고, 되돌리기도 이력으로 남는다
  const undo = (await revert(second, admin.id)).rows[0].id
  assert.equal((await profile()).bio, '새 소개')
  const [undoRow] = await rows(
    'select account_id, revert_of, changes from artist_profile_revisions where id=$1',
    [undo]
  )
  assert.equal(undoRow.account_id, admin.id)
  assert.equal(undoRow.revert_of, second)
  assert.deepEqual(undoRow.changes, { bio: { before: '두 번째 소개', after: '새 소개' } })
  const [marked] = await rows(
    'select reverted_at, reverted_by from artist_profile_revisions where id=$1',
    [second]
  )
  assert.ok(marked.reverted_at)
  assert.equal(marked.reverted_by, admin.id)
  checks += 3

  // 9. 이미 되돌린 수정·되돌리기 기록은 다시 되돌리지 않는다
  await rejectsCode(revert(second, admin.id), '55000', 'revert twice')
  await rejectsCode(revert(undo, admin.id), '55000', 'revert a revert')

  // 10. 이제 첫 수정(bio·specialties)을 되돌리면 처음 값으로 돌아간다
  await revert(first, admin.id)
  assert.deepEqual(await profile(), {
    name_en: null,
    bio: '처음 소개',
    birth_year: 1960,
    specialties: ['해서'],
  })
  checks++

  // 11. 연결이 해제된 계정은 더 이상 수정하지 못한다
  await db.query('update artists set claimed_by_user_id=null where id=$1', [artist])
  await rejectsCode(edit(owner.id, { bio: '해제 후' }), 'P0002', 'edit after unlink')

  console.log(`profile revision checks passed: ${checks}`)
} finally {
  await db.query('delete from artists where id=$1', [artist])
  for (const id of userIds) await service.auth.admin.deleteUser(id)
  await db.end()
}

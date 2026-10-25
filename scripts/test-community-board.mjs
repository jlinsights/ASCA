/**
 * 커뮤니티 게시판 — 격리된 로컬 Supabase 에서 실제 역할·제약·읽기 경로로 검사한다.
 * 운영 URL 은 쓰지 않는다. SUPABASE_WORKDIR 가 있으면 그 폴더의 로컬 스택을 쓴다.
 * 실행: node --conditions=react-server --import tsx scripts/test-community-board.mjs
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
if (!/^http:\/\/127\.0\.0\.1:/.test(local.API_URL)) throw Error('Local API required')
process.env.NEXT_PUBLIC_SUPABASE_URL = local.API_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = local.ANON_KEY
process.env.SUPABASE_SERVICE_ROLE_KEY = local.SERVICE_ROLE_KEY
const { listThreads, getThread } = await import('../lib/community/feed.ts')

const db = new pg.Client({ connectionString: local.DB_URL })
await db.connect()
const service = createClient(local.API_URL, local.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const opts = { auth: { persistSession: false, autoRefreshToken: false } }
const password = `community-${randomUUID()}`
const tag = `community-${randomUUID()}`
const userIds = []
const artistIds = []
let checks = 0

async function rejectsCode(promise, code, label) {
  await assert.rejects(promise, e => e.code === code, label)
  checks++
}
async function member(displayName) {
  const email = `${tag}-${userIds.length}@example.test`
  const created = await service.auth.admin.createUser({ email, password, email_confirm: true })
  assert.equal(created.error, null, created.error?.message)
  const id = created.data.user.id
  userIds.push(id)
  await db.query('update account_profiles set display_name=$2 where id=$1', [id, displayName])
  const client = createClient(local.API_URL, local.ANON_KEY, opts)
  assert.equal((await client.auth.signInWithPassword({ email, password })).error, null)
  return { id, client }
}
const insertThread = async (authorId, title, extra = {}) =>
  (
    await db.query(
      `insert into community_threads (author_id, title, body, hidden_at, hidden_by, hidden_reason, deleted_at)
       values ($1, $2, $3, $4, $5, $6, $7) returning id`,
      [
        authorId,
        title,
        `${title} 본문 https://example.test/x`,
        extra.hidden_at ?? null,
        extra.hidden_by ?? null,
        extra.hidden_reason ?? null,
        extra.deleted_at ?? null,
      ]
    )
  ).rows[0].id

try {
  const artistMember = await member('작가 계정 이름')
  const plainMember = await member('일반 회원')
  const hiddenGradeMember = await member('준회원 계정')
  const leaving = await member('탈퇴 예정')
  const anon = createClient(local.API_URL, local.ANON_KEY, opts)

  // 공개 작가와 이어진 계정, 비공개 등급(준회원) 작가와 이어진 계정
  const [publicArtist, hiddenArtist] = [randomUUID(), randomUUID()]
  artistIds.push(publicArtist, hiddenArtist)
  await db.query(
    `insert into artists (id, name, slug, visibility, membership_type, claimed_by_user_id)
     values ($1, $2, $3, 'public', '초대작가, 이사', $4),
            ($5, $6, null, 'public', '준회원', $7)`,
    [
      publicArtist,
      `${tag} 공개작가`,
      `${tag}-public`,
      artistMember.id,
      hiddenArtist,
      `${tag} 비공개작가`,
      hiddenGradeMember.id,
    ]
  )
  const hiddenRow = await db.query('select visibility from artists where id=$1', [hiddenArtist])
  assert.equal(hiddenRow.rows[0].visibility, 'hidden', '준회원 작가는 트리거가 hidden 으로 강제')
  checks++

  // 1. 회원·익명 역할은 표에 직접 닿지 않는다
  for (const [label, client] of [
    ['anon', anon],
    ['member', plainMember.client],
  ]) {
    for (const table of ['community_threads', 'community_comments', 'community_reactions']) {
      const read = await client.from(table).select('*').limit(1)
      assert.equal(read.error?.code, '42501', `${label} cannot read ${table}`)
      checks++
    }
    const write = await client
      .from('community_threads')
      .insert({ author_id: plainMember.id, title: 'x', body: 'y' })
    assert.equal(write.error?.code, '42501', `${label} cannot write threads`)
    checks++
  }

  // 2. 제약 — 빈 제목, 긴 본문, 숨김 정보 짝, 좋아요 중복
  await rejectsCode(insertThread(plainMember.id, '   '), '23514', 'blank title')
  await rejectsCode(
    db.query(`insert into community_threads (author_id, title, body) values ($1, 't', $2)`, [
      plainMember.id,
      'b'.repeat(10001),
    ]),
    '23514',
    'body too long'
  )
  await rejectsCode(
    db.query(
      `insert into community_threads (author_id, title, body, hidden_reason) values ($1, 't', 'b', '사유')`,
      [plainMember.id]
    ),
    '23514',
    'reason without hidden_at'
  )

  const visible = await insertThread(artistMember.id, `${tag} 공개 글`)
  const fromPlain = await insertThread(plainMember.id, `${tag} 회원 글`)
  const fromHiddenGrade = await insertThread(hiddenGradeMember.id, `${tag} 준회원 글`)
  const hidden = await insertThread(plainMember.id, `${tag} 숨긴 글`, {
    hidden_at: new Date().toISOString(),
    hidden_by: artistMember.id,
    hidden_reason: '시험',
  })
  const deleted = await insertThread(plainMember.id, `${tag} 지운 글`, {
    deleted_at: new Date().toISOString(),
  })
  const orphan = await insertThread(leaving.id, `${tag} 탈퇴 회원 글`)

  await db.query('insert into community_reactions (thread_id, account_id) values ($1, $2)', [
    visible,
    plainMember.id,
  ])
  await rejectsCode(
    db.query('insert into community_reactions (thread_id, account_id) values ($1, $2)', [
      visible,
      plainMember.id,
    ]),
    '23505',
    'one reaction per account'
  )
  await db.query(
    `insert into community_comments (thread_id, author_id, body) values ($1, $2, '댓글')`,
    [visible, plainMember.id]
  )
  await rejectsCode(
    db.query(`insert into community_comments (thread_id, author_id, body) values ($1, $2, ' ')`, [
      visible,
      plainMember.id,
    ]),
    '23514',
    'blank comment'
  )

  // 3. 계정이 지워지면 글은 남고 작성자는 비워진다
  const removed = await service.auth.admin.deleteUser(leaving.id)
  assert.equal(removed.error, null, removed.error?.message)
  userIds.splice(userIds.indexOf(leaving.id), 1)
  const orphanRow = await db.query('select author_id from community_threads where id=$1', [orphan])
  assert.equal(orphanRow.rows.length, 1)
  assert.equal(orphanRow.rows[0].author_id, null)
  checks++

  // 4. 실제 읽기 경로 — 숨김·삭제 제외, 작성자 표시는 공개 작가만
  const feed = await listThreads(200)
  const mine = new Map(feed.threads.filter(t => t.title.startsWith(tag)).map(t => [t.id, t]))
  assert.deepEqual(
    [...mine.keys()].sort(),
    [visible, fromPlain, fromHiddenGrade, orphan].sort(),
    'feed shows only visible, undeleted threads'
  )
  checks++
  for (const thread of feed.threads) {
    for (const key of ['hidden_at', 'hidden_by', 'hidden_reason', 'deleted_at'])
      assert.equal(key in thread, false, `feed rows carry no ${key}`)
  }
  checks++
  assert.deepEqual(mine.get(visible).author, {
    kind: 'artist',
    name: `${tag} 공개작가`,
    role: '초대작가',
    image: null,
    href: `/artists/${tag}-public`,
  })
  assert.deepEqual(mine.get(fromPlain).author, {
    kind: 'member',
    name: '일반 회원',
    role: null,
    image: null,
    href: null,
  })
  // 비공개 등급 작가의 이름·등급은 새지 않고 계정 표시 이름만 보인다
  assert.deepEqual(mine.get(fromHiddenGrade).author, {
    kind: 'member',
    name: '준회원 계정',
    role: null,
    image: null,
    href: null,
  })
  assert.equal(mine.get(orphan).author.kind, 'deleted')
  checks += 4

  assert.equal(await getThread(hidden), null, 'hidden thread is not found publicly')
  assert.equal(await getThread(deleted), null, 'deleted thread is not found')
  assert.equal(
    await getThread(deleted, { includeHidden: true }),
    null,
    'deleted stays gone for admins'
  )
  assert.equal(await getThread('not-a-uuid'), null)
  const forAdmin = await getThread(hidden, { includeHidden: true })
  assert.equal(forAdmin.thread.id, hidden)
  assert.equal(forAdmin.moderation.hiddenReason, '시험')
  const publicDetail = await getThread(visible)
  assert.equal(publicDetail.thread.author.kind, 'artist')
  assert.equal(publicDetail.moderation.hiddenAt, null)
  checks += 6

  // 5. 글이 지워지면 댓글·좋아요도 함께 지워진다
  await db.query('delete from community_threads where id=$1', [visible])
  const leftovers = await db.query(
    `select (select count(*) from community_comments where thread_id=$1)::int as comments,
            (select count(*) from community_reactions where thread_id=$1)::int as reactions`,
    [visible]
  )
  assert.deepEqual(leftovers.rows[0], { comments: 0, reactions: 0 })
  checks++

  console.log(`community board: ${checks} checks passed`)
} finally {
  await db.query('delete from community_threads where title like $1', [`${tag}%`])
  if (artistIds.length) await db.query('delete from artists where id = any($1)', [artistIds])
  for (const id of userIds) await service.auth.admin.deleteUser(id)
  await db.end()
}

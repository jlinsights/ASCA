/** Real self-service profile checks. Only the dedicated local Auth stack is allowed. */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

if (!process.env.AUTH_LOCAL_STATUS_FILE) throw Error('AUTH_LOCAL_STATUS_FILE is required')
const config = JSON.parse(await readFile(process.env.AUTH_LOCAL_STATUS_FILE, 'utf8'))
for (const [value, port] of [
  [config.API_URL, '56321'],
  [config.DB_URL, '56322'],
]) {
  const url = new URL(value)
  assert.equal(url.hostname, '127.0.0.1', 'Dedicated local stack required')
  assert.equal(url.port, port, 'Dedicated local stack port required')
}
const app = new URL(process.env.PROFILE_LOCAL_APP_URL || 'http://localhost:3105')
assert(['localhost', '127.0.0.1'].includes(app.hostname) && app.port === '3105')
assert.equal(app.protocol, 'http:')
const db = postgres(config.DB_URL, { prepare: false, max: 1 })
const admin = createClient(config.API_URL, config.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const users = []
const artistId = randomUUID()
let checks = 0

async function user() {
  const email = `profile-service-${randomUUID()}@example.test`
  const password = `Fixture-${randomUUID()}!`
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  assert.equal(created.error, null)
  users.push(created.data.user.id)
  const cookies = new Map()
  const client = createBrowserClient(config.API_URL, config.ANON_KEY, {
    isSingleton: false,
    cookies: {
      getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
      setAll: values => values.forEach(({ name, value }) => cookies.set(name, value)),
    },
  })
  assert.equal((await client.auth.signInWithPassword({ email, password })).error, null)
  return {
    id: created.data.user.id,
    cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join('; '),
  }
}

async function request(who, body, origin = app.origin) {
  return fetch(new URL(`/api/profile/artists/${artistId}`, app), {
    method: body === undefined ? 'GET' : 'PATCH',
    headers: {
      origin,
      ...(who ? { cookie: who.cookie } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    redirect: 'manual',
    signal: AbortSignal.timeout(30000),
  })
}
async function check(name, callback) {
  await callback()
  checks++
  console.log(`PASS ${name}`)
}

try {
  await db.unsafe(`ALTER TABLE public.artists
    ADD COLUMN IF NOT EXISTS name_en text,
    ADD COLUMN IF NOT EXISTS bio text,
    ADD COLUMN IF NOT EXISTS bio_en text,
    ADD COLUMN IF NOT EXISTS birth_year integer,
    ADD COLUMN IF NOT EXISTS specialties text[],
    ADD COLUMN IF NOT EXISTS profile_image text,
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
    NOTIFY pgrst, 'reload schema';`)
  await delay(1000)
  const owner = await user()
  const stranger = await user()
  const staff = await user()
  assert.equal(
    (await admin.from('account_profiles').update({ role: 'admin' }).eq('id', staff.id)).error,
    null
  )
  assert.equal(
    (
      await admin.from('artists').insert({
        id: artistId,
        name: 'Local profile fixture',
        name_en: 'Before',
        bio: 'Before',
        membership_type: '초대작가',
        dues_status: '자격 정지',
        claimed_by_user_id: owner.id,
      })
    ).error,
    null
  )

  await check('anonymous profile reads and writes require a native account', async () => {
    assert.equal((await request(null)).status, 401)
    assert.equal((await request(null, { bio: 'new' })).status, 401)
  })
  await check('other accounts and unlinked admins cannot read or write the artist', async () => {
    for (const actor of [stranger, staff]) {
      assert.equal((await request(actor)).status, 403)
      assert.equal((await request(actor, { bio: 'new' })).status, 403)
    }
  })
  await check('cross-site mutations are rejected before a profile write', async () => {
    assert.equal((await request(owner, { bio: 'new' }, 'https://attacker.example')).status, 403)
  })
  await check('an owned hidden profile can be read without leaking dues or ownership', async () => {
    const response = await request(owner)
    assert.equal(response.status, 200)
    const { data } = await response.json()
    assert.equal(data.visibility, 'hidden')
    for (const key of ['membership_type', 'dues_status', 'claimed_by_user_id'])
      assert(!(key in data))
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
  })
  await check(
    'protected columns and unsupported aliases cannot be smuggled into a save',
    async () => {
      for (const key of [
        'membership_type',
        'name',
        'visibility',
        'dues_status',
        'claimed_by_user_id',
        'isPublic',
        'socialLinks',
      ]) {
        assert.equal((await request(owner, { bio: 'smuggled', [key]: 'forbidden' })).status, 400)
      }
    }
  )
  await check(
    'a real save maps the schema, clears birth year and preserves all policy fields',
    async () => {
      const response = await request(owner, {
        nameEn: 'Updated',
        bio: '소개 수정',
        bioEn: 'Updated biography',
        birthYear: null,
        specialization: ['행서'],
      })
      assert.equal(response.status, 200)
      const saved = await admin
        .from('artists')
        .select(
          'name,name_en,bio,bio_en,birth_year,specialties,membership_type,visibility,dues_status,claimed_by_user_id'
        )
        .eq('id', artistId)
        .single()
      assert.equal(saved.error, null)
      assert.deepEqual(saved.data, {
        name: 'Local profile fixture',
        name_en: 'Updated',
        bio: '소개 수정',
        bio_en: 'Updated biography',
        birth_year: null,
        specialties: ['행서'],
        membership_type: '초대작가',
        visibility: 'hidden',
        dues_status: '자격 정지',
        claimed_by_user_id: owner.id,
      })
    }
  )
  await check('unlinking the artist immediately revokes profile access', async () => {
    assert.equal(
      (await admin.from('artists').update({ claimed_by_user_id: null }).eq('id', artistId)).error,
      null
    )
    assert.equal((await request(owner)).status, 403)
    assert.equal((await request(owner, { bio: 'after unlink' })).status, 403)
  })
  console.log(`Real local profile checks passed: ${checks}`)
} catch (error) {
  console.error(`FAIL ${error.name}: ${error.message}`)
  process.exitCode = 1
} finally {
  if ((await admin.from('artists').delete().eq('id', artistId)).error) {
    console.error('Profile fixture cleanup failed')
    process.exitCode = 1
  }
  for (const id of users)
    if ((await admin.auth.admin.deleteUser(id)).error) {
      console.error('Profile account cleanup failed')
      process.exitCode = 1
    }
  await db.end()
}

/** Real GoTrue + PostgREST + PostgreSQL + Mailpit checks in the isolated local stack. */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHmac, randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'
import { loadSupabaseAccount, requireSupabaseAdmin } from '../lib/auth/supabase/account.ts'

const statusFile = process.env.AUTH_LOCAL_STATUS_FILE
if (!statusFile) throw new Error('AUTH_LOCAL_STATUS_FILE is required')
const config = JSON.parse(await readFile(statusFile, 'utf8'))
function requireLocal(value, port) {
  const url = new URL(value)
  assert.equal(url.hostname, '127.0.0.1', 'Only the isolated loopback stack is allowed')
  assert.equal(url.port, String(port), 'Unexpected local test stack port')
  return url
}
requireLocal(config.API_URL, 56321)
requireLocal(config.DB_URL, 56322)
const mailbox = requireLocal(config.MAILPIT_URL || config.INBUCKET_URL, 56324)
const database = postgres(config.DB_URL, { prepare: false, max: 1 })
const admin = createClient(config.API_URL, config.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const users = []
const artists = []
let checks = 0

function client() {
  const storage = new Map()
  return createClient(config.API_URL, config.ANON_KEY, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: key => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: key => storage.delete(key),
      },
    },
  })
}
async function check(name, callback) {
  await callback()
  checks++
  console.log(`PASS ${name}`)
}

/** Mailpit contains only local test mail; never follows a remote verification URL. */
async function mailLink(email, after = new Set()) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const response = await fetch(new URL('/api/v1/messages', mailbox))
    assert(response.ok, 'Local mailbox unavailable')
    const messages = (await response.json()).messages || []
    const message = messages.find(
      item => !after.has(item.ID) && item.To?.some(to => to.Address === email)
    )
    if (message) {
      const detail = await fetch(new URL(`/api/v1/message/${message.ID}`, mailbox)).then(r =>
        r.json()
      )
      const body = (detail.HTML || detail.Text || '').replaceAll('&amp;', '&')
      const link = body.match(/https?:\/\/[^\s"<>]+\/auth\/v1\/verify\?[^\s"<>]+/)?.[0]
      assert(link, 'Verification link missing from local mail')
      const url = new URL(link)
      requireLocal(url.toString(), 56321)
      return url
    }
    await delay(300)
  }
  throw new Error('Local verification email did not arrive')
}
async function exchangeMailCode(targetClient, url) {
  const response = await fetch(url, { redirect: 'manual' })
  const location = new URL(response.headers.get('location') || '')
  assert(['127.0.0.1', 'localhost'].includes(location.hostname))
  assert.equal(location.port, '3105')
  const code = location.searchParams.get('code')
  assert(code, 'No PKCE code in the local callback')
  const result = await targetClient.auth.exchangeCodeForSession(code)
  assert.equal(result.error, null)
  assert(result.data.session, 'No verified session')
  return code
}
function totp(secret) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const char of secret.replace(/=+$/, '').toUpperCase()) {
    const value = alphabet.indexOf(char)
    assert(value >= 0, 'Invalid TOTP setup key')
    bits += value.toString(2).padStart(5, '0')
  }
  const bytes = Buffer.from(bits.match(/.{8}/g).map(byte => parseInt(byte, 2)))
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)))
  const digest = createHmac('sha1', bytes).update(counter).digest()
  const offset = digest[digest.length - 1] & 15
  return ((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, '0')
}

async function run() {
  // This database belongs to the separate local CLI project; no legacy schema replay.
  await database.unsafe(`
    CREATE TABLE IF NOT EXISTS public.artists (
      id uuid PRIMARY KEY, name text NOT NULL,
      claimed_by_user_id text, visibility text NOT NULL DEFAULT 'public'
    );
    ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS membership_type text DEFAULT '준회원';
    ALTER TABLE public.artists ALTER COLUMN membership_type SET DEFAULT '준회원';
    ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public.artists FROM PUBLIC, anon, authenticated;
    GRANT SELECT (id, name, visibility) ON public.artists TO anon, authenticated;
    GRANT ALL ON public.artists TO service_role;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_policies WHERE schemaname = 'public'
        AND tablename = 'artists' AND policyname = 'auth_test_public_read') THEN
        CREATE POLICY auth_test_public_read ON public.artists FOR SELECT TO anon, authenticated
          USING (visibility = 'public');
      END IF;
    END $$;
  `)
  // Keep PR #118's visibility triggers and private dues column alongside native Auth.
  for (const migration of [
    '20261024092153_artists_hide_non_public_grades.sql',
    '20261024093959_artists_dues_status.sql',
  ]) {
    await database.unsafe(
      await readFile(new URL(`../supabase/migrations/${migration}`, import.meta.url), 'utf8')
    )
  }
  const [{ present }] =
    await database`SELECT to_regclass('public.account_profiles') IS NOT NULL AS present`
  if (!present)
    await database.unsafe(
      await readFile(
        new URL(
          '../supabase/migrations/20261024110000_supabase_auth_foundation.sql',
          import.meta.url
        ),
        'utf8'
      )
    )
  await database.unsafe("NOTIFY pgrst, 'reload schema'")
  await delay(1000)
  const email = `auth-service-${randomUUID()}@example.test`
  const password = `Fixture-${randomUUID()}!`
  const nextPassword = `Recovered-${randomUUID()}!`
  const owner = client()
  let id, factor, secret

  await check('server password policy rejects short passwords', async () => {
    const result = await owner.auth.signUp({ email, password: 'short' })
    assert(result.error, 'Weak password unexpectedly accepted')
  })
  await check('signup creates a member profile and requires email confirmation', async () => {
    const { data, error } = await owner.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://127.0.0.1:3105/auth/callback',
        data: { full_name: 'Local auth fixture', locale: 'ko', role: 'admin' },
      },
    })
    assert.equal(error, null)
    id = data.user.id
    users.push(id)
    assert.equal(data.session, null)
    const login = await owner.auth.signInWithPassword({ email, password })
    assert.equal(login.error?.code, 'email_not_confirmed')
  })
  await check('local email verification exchanges a real PKCE code only once', async () => {
    const code = await exchangeMailCode(owner, await mailLink(email))
    const replay = await client().auth.exchangeCodeForSession(code)
    assert(replay.error, 'Replayed PKCE code was accepted')
    const account = await loadSupabaseAccount(owner)
    assert.equal(account.id, id)
    assert.equal(account.role, 'member', 'User metadata escalated privileges')
    assert.equal(account.assuranceLevel, 'aal1')
    assert(account.createdAt, 'Profile timestamps missing')
  })
  await check('real RLS denies self-promotion and other profiles', async () => {
    const other = await admin.auth.admin.createUser({
      email: `other-${randomUUID()}@example.test`,
      email_confirm: true,
    })
    assert.equal(other.error, null)
    users.push(other.data.user.id)
    const result = await owner.from('account_profiles').update({ role: 'admin' }).eq('id', id)
    assert(result.error, 'Client role update was accepted')
    const { data, error } = await owner.from('account_profiles').select('id').neq('id', id)
    assert.equal(error, null)
    assert.equal(data.length, 0)
  })
  await check(
    'account identity resolves a separate private artist UUID without exposing ownership',
    async () => {
      const artistId = randomUUID()
      artists.push(artistId)
      const inserted = await admin.from('artists').insert({
        id: artistId,
        name: 'Fixture artist',
        claimed_by_user_id: id,
        visibility: 'hidden',
      })
      assert.equal(inserted.error, null)
      const account = await loadSupabaseAccount(owner)
      assert.deepEqual(account.artistIds, [artistId])
      assert.notEqual(account.artistIds[0], account.id)
      const leak = await owner.from('artists').select('claimed_by_user_id')
      assert(leak.error, 'Private ownership column was exposed')
    }
  )
  await check(
    'native authenticated sessions preserve private dues and visibility RLS',
    async () => {
      const anonymous = client()
      for (const viewer of [anonymous, owner]) {
        assert((await viewer.from('artists').select('id, dues_status')).error)
        const hidden = await viewer.from('artists').select('id').eq('id', artists[0])
        assert.equal(hidden.error, null)
        assert.deepEqual(hidden.data, [])
      }
    }
  )
  await check('database admin role alone cannot satisfy native admin authorization', async () => {
    assert.equal(
      (await admin.from('account_profiles').update({ role: 'admin' }).eq('id', id)).error,
      null
    )
    await assert.rejects(
      () => requireSupabaseAdmin(owner),
      error => error.code === 'MFA_REQUIRED'
    )
  })
  await check(
    'TOTP enrollment produces a usable QR data URI and elevates the native session',
    async () => {
      const enrolled = await owner.auth.mfa.enroll({ factorType: 'totp', issuer: 'ASCA' })
      assert.equal(enrolled.error, null)
      factor = enrolled.data.id
      secret = enrolled.data.totp.secret
      assert(enrolled.data.totp.qr_code.startsWith('data:image/svg+xml;'))
      const verified = await owner.auth.mfa.challengeAndVerify({
        factorId: factor,
        code: totp(secret),
      })
      assert.equal(verified.error, null)
      assert.equal((await requireSupabaseAdmin(owner)).assuranceLevel, 'aal2')
    }
  )
  const recovered = client()
  const freshLogin = client()
  await check('password recovery mail creates an aal1 session that requires MFA', async () => {
    const before = new Set(
      (await fetch(new URL('/api/v1/messages', mailbox)).then(r => r.json())).messages.map(
        item => item.ID
      )
    )
    const result = await recovered.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://127.0.0.1:3105/auth/callback',
    })
    assert.equal(result.error, null)
    await exchangeMailCode(recovered, await mailLink(email, before))
    const level = await recovered.auth.mfa.getAuthenticatorAssuranceLevel()
    assert.equal(level.data.currentLevel, 'aal1')
    assert.equal(level.data.nextLevel, 'aal2')
    await assert.rejects(
      () => requireSupabaseAdmin(recovered),
      error => error.code === 'MFA_REQUIRED'
    )
    assert(
      (await recovered.auth.updateUser({ password: nextPassword })).error,
      'Password changed without registered MFA'
    )
  })
  await check('MFA completes recovery; the new password works and the old one fails', async () => {
    // A used TOTP must not be replayed; wait for the next short code window.
    await delay((31 - (Math.floor(Date.now() / 1000) % 30)) * 1000)
    const verified = await recovered.auth.mfa.challengeAndVerify({
      factorId: factor,
      code: totp(secret),
    })
    assert.equal(verified.error, null)
    assert.equal((await recovered.auth.updateUser({ password: nextPassword })).error, null)
    assert.equal((await recovered.auth.signOut({ scope: 'local' })).error, null)
    assert.equal(await loadSupabaseAccount(recovered), null)
    assert((await client().auth.signInWithPassword({ email, password })).error)
    assert.equal(
      (await freshLogin.auth.signInWithPassword({ email, password: nextPassword })).error,
      null
    )
  })
  await check('disabled profiles remain denied even with a live verified session', async () => {
    assert.equal((await loadSupabaseAccount(freshLogin)).id, id)
    assert.equal(
      (
        await admin
          .from('account_profiles')
          .update({ disabled_at: new Date().toISOString() })
          .eq('id', id)
      ).error,
      null
    )
    assert.equal(await loadSupabaseAccount(freshLogin), null)
    const ownership = await freshLogin.rpc('get_my_artist_ids')
    assert.equal(ownership.error, null)
    assert.deepEqual(ownership.data, [])
  })
  console.log(`Real local Supabase Auth checks passed: ${checks}`)
}

try {
  await run()
} catch (error) {
  console.error(`FAIL ${error.name}: ${error.message}`)
  process.exitCode = 1
} finally {
  for (const id of artists) {
    if ((await admin.from('artists').delete().eq('id', id)).error) {
      console.error('Fixture artist cleanup failed')
      process.exitCode = 1
    }
  }
  for (const id of users) {
    if ((await admin.auth.admin.deleteUser(id)).error) {
      console.error('Fixture account cleanup failed')
      process.exitCode = 1
    }
  }
  await database.end()
}

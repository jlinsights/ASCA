// Run only against a NEW, disposable local database named asca_auth_test_*.
// This checks real PostgreSQL grants/RLS. The small auth schema below models
// GoTrue's user table and JWT helpers, not the actual GoTrue service or emails.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import postgres from 'postgres'

const connection = process.env.AUTH_TEST_DATABASE_URL
if (!connection) throw new Error('AUTH_TEST_DATABASE_URL must point to a disposable local database')
const url = new URL(connection)
if (
  !['postgres:', 'postgresql:'].includes(url.protocol) ||
  !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
  !/^\/asca_auth_test_[a-z0-9_]+$/.test(url.pathname)
) {
  throw new Error('Refusing to run outside a local asca_auth_test_* database')
}
const sql = postgres(connection, { max: 1, prepare: false })
const ownerId = '11111111-1111-4111-8111-111111111111'
const otherId = '22222222-2222-4222-8222-222222222222'
const priorId = '33333333-3333-4333-8333-333333333333'
const artistId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const otherArtistId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
let checks = 0

async function check(name, callback) {
  await callback()
  checks++
  console.log(`PASS ${name}`)
}

async function asUser(id, callback, claims = {}) {
  return sql.begin(async tx => {
    await tx.unsafe('SET LOCAL ROLE authenticated')
    await tx`SELECT set_config('request.jwt.claims', ${JSON.stringify({
      sub: id,
      email: 'fixture@example.test',
      aal: 'aal1',
      is_anonymous: false,
      ...claims,
    })}, true)`
    return callback(tx)
  })
}

async function denied(callback) {
  await assert.rejects(callback, error => error.code === '42501')
}

try {
  const [{ present }] = await sql`
    SELECT EXISTS (SELECT FROM information_schema.tables
      WHERE table_schema IN ('auth', 'public')) AS present
  `
  assert.equal(present, false, 'The test database must be empty')
  await sql.unsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role BYPASSRLS; END IF;
    END $$;
    CREATE SCHEMA auth;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
      SELECT coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
    $$;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT (auth.jwt()->>'sub')::uuid
    $$;
    CREATE TABLE public.artists (id uuid PRIMARY KEY, claimed_by_user_id text, visibility text DEFAULT 'public');
    ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
    GRANT SELECT(id, visibility) ON public.artists TO anon, authenticated;
    CREATE POLICY artists_public_read ON public.artists FOR SELECT TO anon, authenticated USING (visibility = 'public');
  `)
  await sql`INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (${priorId}, 'prior@example.test', ${sql.json({ role: 'admin', locale: 'unsupported' })})`
  const migration = await readFile(
    new URL('../supabase/migrations/20261024142344_supabase_auth_foundation.sql', import.meta.url),
    'utf8'
  )
  await sql.unsafe(migration)
  await sql`INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
    (${ownerId}, 'owner@example.test', ${sql.json({ role: 'admin', full_name: '작가', locale: 'ko', disabled_at: null, clerk_user_id: 'forged' })}),
    (${otherId}, 'other@example.test', ${sql.json({ role: 'admin', full_name: 'x'.repeat(200), locale: 'zh' })})`
  await sql`INSERT INTO public.artists (id, claimed_by_user_id, visibility) VALUES
    (${artistId}, ${ownerId}, 'hidden'), (${otherArtistId}, ${otherId}, 'public')`

  await check(
    'signup and pre-existing users get member role, never metadata privileges',
    async () => {
      const profiles = await sql`SELECT role, locale, display_name FROM public.account_profiles`
      assert.equal(profiles.length, 3)
      assert(profiles.every(profile => profile.role === 'member'))
      assert(profiles.some(profile => profile.locale === 'ko' && profile.display_name === '작가'))
      assert(
        profiles.some(profile => profile.display_name.length === 100 && profile.locale === 'zh')
      )
      const [{ count }] = await sql`SELECT count(*)::int FROM public.auth_identity_links`
      assert.equal(count, 0)
    }
  )
  await check('anonymous users cannot read profiles, identity links, or owner RPC', async () => {
    for (const query of [
      'SELECT * FROM public.account_profiles',
      'SELECT * FROM public.auth_identity_links',
      'SELECT * FROM public.get_my_artist_ids()',
    ]) {
      await denied(() =>
        sql.begin(async tx => {
          await tx.unsafe('SET LOCAL ROLE anon')
          await tx.unsafe(query)
        })
      )
    }
  })
  await check('authenticated profiles are limited to the caller', async () => {
    const profiles = await asUser(ownerId, tx => tx`SELECT id FROM public.account_profiles`)
    assert.deepEqual(
      profiles.map(profile => profile.id),
      [ownerId]
    )
  })
  await check('users may update only their own name and locale', async () => {
    const updated = await asUser(
      ownerId,
      tx => tx`
      UPDATE public.account_profiles SET display_name = '새 이름', locale = 'en'
      WHERE id = ${ownerId} RETURNING display_name, locale
    `
    )
    assert.equal(updated[0].display_name, '새 이름')
    assert.equal(updated[0].locale, 'en')
    const others = await asUser(
      ownerId,
      tx => tx`
      UPDATE public.account_profiles SET display_name = 'stolen'
      WHERE id = ${otherId} RETURNING id
    `
    )
    assert.equal(others.length, 0)
  })
  await check('column grants block self-promotion, reactivation, ID and timestamps', async () => {
    for (const assignment of [
      "role = 'admin'",
      'disabled_at = null',
      `id = '${otherId}'`,
      'created_at = now()',
      'updated_at = now()',
    ]) {
      await denied(() =>
        asUser(ownerId, tx =>
          tx.unsafe(`UPDATE public.account_profiles SET ${assignment} WHERE id = '${ownerId}'`)
        )
      )
    }
    await denied(() =>
      asUser(ownerId, tx => tx`INSERT INTO public.account_profiles (id) VALUES (${artistId})`)
    )
    await denied(() =>
      asUser(ownerId, tx => tx`DELETE FROM public.account_profiles WHERE id = ${ownerId}`)
    )
    await denied(() => asUser(ownerId, tx => tx`SELECT * FROM public.auth_identity_links`))
    await denied(() =>
      asUser(
        ownerId,
        tx =>
          tx`INSERT INTO public.auth_identity_links (account_id, clerk_user_id) VALUES (${ownerId}, 'forged')`
      )
    )
  })
  await check('owner lookup returns only own artist UUIDs, including private artists', async () => {
    const owned = await asUser(ownerId, tx => tx`SELECT * FROM public.get_my_artist_ids()`)
    assert.deepEqual(
      owned.map(artist => artist.artist_id),
      [artistId]
    )
    const other = await asUser(otherId, tx => tx`SELECT * FROM public.get_my_artist_ids()`)
    assert.deepEqual(
      other.map(artist => artist.artist_id),
      [otherArtistId]
    )
    await denied(() => asUser(ownerId, tx => tx`SELECT claimed_by_user_id FROM public.artists`))
  })
  await check('owner lookup rejects anonymous claims and accounts without an email', async () => {
    for (const claims of [{ is_anonymous: true }, { email: null }]) {
      assert.equal(
        (await asUser(ownerId, tx => tx`SELECT * FROM public.get_my_artist_ids()`, claims)).length,
        0
      )
    }
  })
  await check('no new artist write grants or client-trigger execution', async () => {
    await denied(() =>
      asUser(
        ownerId,
        tx =>
          tx`UPDATE public.artists SET claimed_by_user_id = ${ownerId} WHERE id = ${otherArtistId}`
      )
    )
    const [{ allowed }] = await sql`
      SELECT has_function_privilege('authenticated', 'public.create_account_profile()', 'EXECUTE') AS allowed
    `
    assert.equal(allowed, false)
  })
  await check('disabled accounts cannot change profiles or resolve artists', async () => {
    await sql`UPDATE public.account_profiles SET disabled_at = now() WHERE id = ${ownerId}`
    const updated = await asUser(
      ownerId,
      tx => tx`UPDATE public.account_profiles SET display_name = 'disabled' RETURNING id`
    )
    assert.equal(updated.length, 0)
    assert.equal(
      (await asUser(ownerId, tx => tx`SELECT * FROM public.get_my_artist_ids()`)).length,
      0
    )
  })
  await check(
    'deleting an auth user removes profile and private mapping, preserving artist ID',
    async () => {
      await sql`INSERT INTO public.auth_identity_links (account_id, clerk_user_id) VALUES (${ownerId}, 'verified_legacy_id')`
      await sql`DELETE FROM auth.users WHERE id = ${ownerId}`
      assert.equal((await sql`SELECT FROM public.account_profiles WHERE id = ${ownerId}`).length, 0)
      assert.equal(
        (await sql`SELECT FROM public.auth_identity_links WHERE account_id = ${ownerId}`).length,
        0
      )
      assert.equal((await sql`SELECT FROM public.artists WHERE id = ${artistId}`).length, 1)
    }
  )
  console.log(`Supabase Auth database checks passed: ${checks}`)
} finally {
  await sql.end()
}

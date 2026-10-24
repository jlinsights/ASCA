/** Replays the historical app schema and upgrades populated fixtures in an isolated database. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import pg from 'pg'
const local = JSON.parse(
  execFileSync('supabase', ['status', '-o', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
)
if (!/^postgresql:\/\/postgres:postgres@127\.0\.0\.1:/.test(local.DB_URL))
  throw Error('Local DB required')
const root = new pg.Client({ connectionString: local.DB_URL })
await root.connect()
const name = `archive_upgrade_${randomUUID().replaceAll('-', '')}`
let db
try {
  await root.query(`create database ${name}`)
  const url = new URL(local.DB_URL)
  url.pathname = `/${name}`
  db = new pg.Client({ connectionString: url.toString() })
  await db.connect()
  // Storage system migrations are owned by Supabase; only the referenced catalog shape is needed here.
  await db.query(
    `create schema storage; create table storage.buckets(id text primary key,name text,public boolean); create table storage.objects(id uuid primary key,bucket_id text); alter table storage.objects enable row level security; grant usage on schema public,storage to anon,authenticated,service_role; alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
     create schema auth;
     create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
     create function auth.uid() returns uuid language sql stable as $$
       select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid
     $$;
     create function auth.jwt() returns jsonb language sql stable as $$
       select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb)
     $$;`
  )
  const dir = new URL('../supabase/migrations/', import.meta.url)
  const files = readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    .sort()
  for (const file of files.filter(f => f < '20261018000000'))
    await db.query(readFileSync(new URL(file, dir), 'utf8'))
  const artist = randomUUID(),
    artwork = randomUUID()
  await db.query('alter table artists add column email text, add column phone text')
  await db.query(
    "insert into artists(id,name,airtable_id,bio,email,phone) values ($1,'existing','existing-airtable','legacy bio','private@example.com','010')",
    [artist]
  )
  await db.query(
    "insert into artworks(id,artist_id,title,description,category,medium,dimensions,year_created,images,status) values ($1,$2,'existing','legacy','calligraphy','paper','{}',2025,'{}','in-exhibition')",
    [artwork, artist]
  )
  // Each file commits independently, matching the CLI enum expansion boundary.
  for (const file of files.filter(f => f >= '20261018000000'))
    await db.query(readFileSync(new URL(file, dir), 'utf8'))
  const a = (await db.query('select * from artists where id=$1', [artist])).rows[0]
  assert.equal(a.bio, 'legacy bio')
  assert.equal(a.visibility, 'public')
  assert.equal(a.airtable_id, 'existing-airtable')
  assert.equal('email' in a, false)
  assert.equal('phone' in a, false)
  const c = (await db.query('select * from artist_contacts where artist_id=$1', [artist])).rows[0]
  assert.equal(c.email, 'private@example.com')
  assert.equal(c.phone, '010')
  assert.equal(
    (await db.query('select status from artworks where id=$1', [artwork])).rows[0].status,
    'in-exhibition'
  )
  const privileges = (
    await db.query(`select
    has_function_privilege('authenticated','public.get_my_artist_ids()','execute') as authenticated,
    has_function_privilege('anon','public.get_my_artist_ids()','execute') as anon,
    has_function_privilege('service_role','public.get_my_artist_ids()','execute') as service_role`)
  ).rows[0]
  assert.deepEqual(privileges, { authenticated: true, anon: false, service_role: false })
  console.log(
    'Archive upgrade: existing artists, legacy state and private contact migration preserved.'
  )
} finally {
  await db?.end()
  await root.query(`drop database if exists ${name} with (force)`)
  await root.end()
}

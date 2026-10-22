/** Isolated PostgreSQL integration checks. Never uses production URLs or resets local data. */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import pg from 'pg'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { executeReview } from '../lib/archive/review-service.ts'

const local = JSON.parse(
  execFileSync('supabase', ['status', '-o', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
)
if (!/^postgresql:\/\/postgres:postgres@127\.0\.0\.1:/.test(local.DB_URL))
  throw Error('Local DB required')
if (!/^http:\/\/127\.0\.0\.1:/.test(local.API_URL)) throw Error('Local Storage required')
const root = new pg.Client({ connectionString: local.DB_URL })
await root.connect()
const name = `archive_review_${randomUUID().replaceAll('-', '')}`
let db
let checks = 0
const artist = randomUUID(),
  work = randomUUID(),
  image = randomUUID()
const prefix = `${artist}/${work}/0/`
const storage = createClient(local.API_URL, local.SERVICE_ROLE_KEY).storage
const publicPaths = new Set()
// Exercise the actual coordinator against isolated SQL functions and real local Storage.
const workflowDb = {
  storage,
  rpc: async (name, args) => {
    assert.equal(name, 'finish_archive_review')
    try {
      return {
        data: (
          await query('select finish_archive_review($1,$2,$3) as r', [
            args.p_id,
            args.p_lease_token,
            args.p_success,
          ])
        )[0].r,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },
}
async function query(sql, params = []) {
  return (await db.query(sql, params)).rows
}
async function rejects(sql, params, code) {
  await assert.rejects(db.query(sql, params), e =>
    code ? e.code === code : /BUSY|CONFLICT|ARTIST_PRIVATE|INCOMPLETE/.test(e.message)
  )
  checks++
}
async function prepare(id, action, reason = '', token = randomUUID()) {
  const revision = (await query('select updated_at::text from artworks where id=$1', [work]))[0]
    .updated_at
  const operation = (
    await query('select prepare_archive_review($1,$2,$3,$4,$5,$6,$7) as r', [
      id,
      work,
      action,
      revision,
      reason,
      'clerk_admin',
      token,
    ])
  )[0].r
  for (const i of operation.images) {
    publicPaths.add(i.public_web)
    publicPaths.add(i.public_thumb)
  }
  return operation
}
async function finish(operation, success = true) {
  return (
    await query('select finish_archive_review($1,$2,$3) as r', [
      operation.id,
      operation.lease_token,
      success,
    ])
  )[0].r
}
async function status(expected) {
  assert.equal((await query('select status from artworks where id=$1', [work]))[0].status, expected)
  checks++
}
try {
  await root.query(`create database ${name}`)
  const url = new URL(local.DB_URL)
  url.pathname = `/${name}`
  db = new pg.Client({ connectionString: url.toString() })
  await db.connect()
  await db.query(`create schema storage; create table storage.buckets(id text primary key,name text,public boolean);
    create table storage.objects(id uuid primary key,bucket_id text); alter table storage.objects enable row level security;
    grant usage on schema public,storage to anon,authenticated,service_role;
    alter default privileges in schema public grant all on tables to anon,authenticated,service_role`)
  const dir = new URL('../supabase/migrations/', import.meta.url)
  for (const file of readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    .sort())
    await db.query(readFileSync(new URL(file, dir), 'utf8'))
  await db.query("insert into artists(id,name,visibility) values ($1,'review fixture','public')", [
    artist,
  ])
  await db.query(
    `insert into artworks(id,artist_id,title,description,category,medium,dimensions,year_created,
    images,status,style,width_cm,height_cm,materials) values ($1,$2,'review fixture','','calligraphy','ink','{}',2026,
    '{}','pending_review','regular',35,135,'{ink}')`,
    [work, artist]
  )
  await db.query(
    `insert into artwork_images(id,artwork_id,thumb_path,web_path,original_path,width,height)
    values($1,$2,$3,$4,$5,35,135)`,
    [image, work, prefix + 'thumb.webp', prefix + 'web.webp', prefix + 'original.jpeg']
  )
  for (const role of ['anon', 'authenticated']) {
    await db.query(`set role ${role}`)
    await rejects('select * from archive_reviews', [], '42501')
    await rejects(
      'select prepare_archive_review($1,$2,$3,null,$4,$5,$6)',
      [randomUUID(), work, 'publish', '', 'forged_admin', randomUUID()],
      '42501'
    )
    await rejects('select finish_archive_review($1,$2,true)', [randomUUID(), randomUUID()], '42501')
    await db.query('reset role')
  }
  await db.query('set role service_role')
  const webp = await sharp({
    create: { width: 16, height: 32, channels: 3, background: '#ffffff' },
  })
    .webp()
    .toBuffer()
  for (const suffix of ['thumb.webp', 'web.webp', 'original.jpeg']) {
    const { error } = await storage
      .from('archive-private')
      .upload(prefix + suffix, webp, { contentType: 'image/webp', upsert: true })
    assert.equal(error, null, error?.message)
  }
  const publish = await prepare(randomUUID(), 'publish')
  await status('pending_review')
  assert.equal(publish.images[0].private_web, prefix + 'web.webp')
  assert.equal(publish.images[0].public_web.includes(`/public/${publish.lease_token}/`), true)
  assert.equal(JSON.stringify(publish.images).includes('original'), false)
  checks++
  await rejects('select prepare_archive_review($1,$2,$3,null,$4,$5,$6)', [
    randomUUID(),
    work,
    'return',
    'fix',
    'clerk_admin',
    randomUUID(),
  ])
  await rejects('select finish_archive_review($1,$2,true)', [publish.id, randomUUID()])
  await finish(publish, false)
  const retry = await prepare(publish.id, 'publish')
  assert.notEqual(retry.lease_token, publish.lease_token)
  assert.notEqual(retry.images[0].public_web, publish.images[0].public_web)
  assert.ok(retry.cleanup_paths.includes(publish.images[0].public_web))
  checks++
  await rejects('select finish_archive_review($1,$2,true)', [publish.id, publish.lease_token])
  await executeReview(workflowDb, retry)
  const publicUrl = `${local.API_URL}/storage/v1/object/public/archive-public/${retry.images[0].public_web}`
  assert.equal((await fetch(publicUrl)).status, 200)
  checks++
  assert.notEqual(
    (
      await fetch(
        `${local.API_URL}/storage/v1/object/public/archive-private/${prefix}original.jpeg`
      )
    ).status,
    200
  )
  checks++
  await status('published')
  assert.equal(
    (await query('select thumb_path from artwork_images where id=$1', [image]))[0].thumb_path,
    retry.images[0].public_thumb
  )
  assert.equal((await prepare(publish.id, 'publish')).state, 'completed')
  checks++
  const unpublish = await prepare(randomUUID(), 'unpublish', 'copyright correction')
  await status('pending_review') // Hidden before Storage work even begins.
  await db.query('reset role')
  await db.query('set role anon')
  assert.equal((await query('select id from artworks where id=$1', [work])).length, 0)
  checks++
  await db.query('reset role')
  await db.query('set role service_role')
  await finish(unpublish, false)
  const retryRemoval = await prepare(unpublish.id, 'unpublish', 'copyright correction')
  await executeReview(workflowDb, retryRemoval)
  assert.notEqual((await fetch(publicUrl)).status, 200)
  checks++
  assert.equal(
    (await query('select web_path from artwork_images where id=$1', [image]))[0].web_path,
    prefix + 'web.webp'
  )
  checks++
  const returned = await prepare(randomUUID(), 'return', 'Please correct the transcription')
  await executeReview(workflowDb, returned)
  await status('draft')
  await rejects('select prepare_archive_review($1,$2,$3,null,$4,$5,$6)', [
    randomUUID(),
    work,
    'publish',
    '',
    'clerk_admin',
    randomUUID(),
  ])
  await db.query("update artworks set status='pending_review' where id=$1", [work])
  await db.query("update artists set visibility='hidden' where id=$1", [artist])
  await assert.rejects(prepare(randomUUID(), 'publish'), /ARTIST_PRIVATE/)
  checks++
  await db.query("update artists set visibility='public' where id=$1", [artist])
  const crash = await prepare(randomUUID(), 'publish')
  await assert.rejects(prepare(crash.id, 'publish'), /BUSY/)
  checks++
  await db.query("update archive_reviews set leased_at=now()-interval '6 minutes' where id=$1", [
    crash.id,
  ])
  const recovered = await prepare(crash.id, 'publish')
  await rejects('select finish_archive_review($1,$2,true)', [crash.id, crash.lease_token])
  await executeReview(workflowDb, recovered)
  await status('published')
  console.log(
    `Archive review integration: ${checks} checks passed; fresh migrations, ACL, idempotency, recovery and fail-closed transitions.`
  )
  if (process.env.ARCHIVE_REVIEW_TYPES_OUT)
    writeFileSync(
      process.env.ARCHIVE_REVIEW_TYPES_OUT,
      execFileSync(
        'supabase',
        ['gen', 'types', 'typescript', '--db-url', url.toString(), '--schema', 'public'],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
      )
    )
} finally {
  if (publicPaths.size) await storage.from('archive-public').remove([...publicPaths])
  await storage
    .from('archive-private')
    .remove(['thumb.webp', 'web.webp', 'original.jpeg'].map(suffix => prefix + suffix))
  await db?.end()
  await root.query(`drop database if exists ${name} with (force)`)
  await root.end()
}

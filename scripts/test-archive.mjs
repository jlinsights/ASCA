import { PUBLIC_ARTIST_COLUMNS } from '../lib/api/public-artist-columns.ts'
import { SyncEngine } from '../lib/sync-engine.ts'
import { drizzle } from 'drizzle-orm/node-postgres'
import { artists, artworks } from '../lib/db/schema.ts'
import { publicArtistCondition, publicArtworkCondition } from '../lib/db/archive-access.ts'
/** Integration tests against the isolated local Supabase stack only. No production URLs. */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import pg from 'pg'
import { createClient } from '@supabase/supabase-js'
const local = JSON.parse(
  execFileSync('supabase', ['status', '-o', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
)
if (!/^postgresql:\/\/postgres:postgres@127\.0\.0\.1:/.test(local.DB_URL))
  throw Error('Local test database required')
const db = new pg.Client({ connectionString: local.DB_URL })
await db.connect()
const admin = createClient(local.API_URL, local.SERVICE_ROLE_KEY)
const anon = createClient(local.API_URL, local.ANON_KEY)
const ids = Array.from({ length: 12 }, () => randomUUID())
const [
  publicArtist,
  hiddenArtist,
  memberArtist,
  published,
  draft,
  hiddenWork,
  pending,
  exhibition,
  eventPublic,
  eventHidden,
  eventMembers,
  image,
] = ids
let checks = 0
async function rows(sql, params = []) {
  return (await db.query(sql, params)).rows
}
async function count(sql, expected) {
  assert.equal(Number((await rows(sql))[0].count), expected, sql)
  checks++
}
async function rejects(sql, code) {
  await assert.rejects(db.query(sql), e => e.code === code, sql)
  checks++
}
async function ok(result) {
  assert.equal(result.error, null, result.error?.message)
  checks++
  return result.data
}
try {
  await db.query(
    `insert into artists(id,name,visibility) values ($1,'archive public','public'),($2,'archive hidden','hidden'),($3,'archive member','members')`,
    [publicArtist, hiddenArtist, memberArtist]
  )
  await db.query(
    `insert into artist_contacts(artist_id,email,phone) values ($1,'private@example.com','010')`,
    [publicArtist]
  )
  for (const [id, artist, status] of [
    [published, publicArtist, 'published'],
    [draft, publicArtist, 'draft'],
    [hiddenWork, hiddenArtist, 'published'],
    [pending, publicArtist, 'pending_review'],
  ]) {
    await db.query(
      `insert into artworks(id,artist_id,title,description,category,medium,dimensions,year_created,images,status) values ($1,$2,'archive work','description','calligraphy','paper','{}',2026,'{}',$3)`,
      [id, artist, status]
    )
  }
  for (const [work, id] of [
    [published, image],
    [draft, randomUUID()],
    [hiddenWork, randomUUID()],
  ]) {
    await db.query(
      `insert into artwork_images(id,artwork_id,thumb_path,web_path,original_path,width,height,is_primary) values ($1,$2,$3,$4,$5,100,200,true)`,
      [id, work, `${work}/thumb.webp`, `${work}/web.webp`, `${work}/original.jpg`]
    )
  }
  await db.query(
    `insert into artist_records(artist_id,artwork_id,record_type,title) values ($1,$2,'award','public'),($1,$3,'submission','draft'),($1,null,'certification','profile'),($4,null,'award','hidden')`,
    [publicArtist, published, draft, hiddenArtist]
  )
  await db.query(
    `insert into exhibitions(id,title,description,start_date,end_date) values ($1,'archive exhibition','test','2026-01-01','2026-01-02')`,
    [exhibition]
  )
  for (const [id, visibility] of [
    [eventPublic, 'public'],
    [eventHidden, 'hidden'],
    [eventMembers, 'members'],
  ]) {
    await db.query(
      `insert into events(id,title,description,event_date,exhibition_id,event_type,luma_url,luma_visibility) values ($1,'archive event','test',now(),$2,'viewing','https://lu.ma/test',$3)`,
      [id, exhibition, visibility]
    )
  }
  await db.query(`insert into exhibition_artists(exhibition_id,artist_id) values ($1,$2),($1,$3)`, [
    exhibition,
    publicArtist,
    hiddenArtist,
  ])
  await db.query(
    `insert into exhibition_artworks(exhibition_id,artwork_id) values ($1,$2),($1,$3),($1,$4)`,
    [exhibition, published, draft, hiddenWork]
  )
  const orm = drizzle(db)
  assert.equal(
    (await orm.select({ id: artists.id }).from(artists).where(publicArtistCondition())).length,
    1
  )
  assert.equal(
    (await orm.select({ id: artworks.id }).from(artworks).where(publicArtworkCondition())).length,
    1
  )
  checks += 2
  for (const role of ['anon', 'authenticated']) {
    await db.query(`set role ${role}`)
    await count('select count(*) from artists', 1)
    await count('select count(*) from artworks', 1)
    await count('select count(*) from public_artworks', 1)
    await count('select count(id) from artwork_images', 1)
    await count('select count(*) from artist_records', 2)
    await count('select count(*) from exhibition_artists', 1)
    await count('select count(*) from exhibition_artworks', 1)
    const detail = (await rows('select * from exhibition_details'))[0]
    assert.equal(detail.artists.length, 1)
    assert.equal(detail.artworks.length, 1)
    checks++
    await rejects('select * from artist_contacts', '42501')
    await rejects('select claimed_by_user_id from artists', '42501')
    await rejects('select original_path from artwork_images', '42501')
    await rejects('select luma_url from events', '42501')
    assert.deepEqual(
      (
        await rows('select luma_visibility,luma_url from public_events order by luma_visibility')
      ).map(x => x.luma_url),
      [null, null, 'https://lu.ma/test']
    )
    checks++
    await rejects(`update artworks set status='published' where id='${draft}'`, '42501')
    await rejects('update artist_records set is_asca_verified=true', '42501')
    await rejects(`insert into artists(name) values ('unauthorized')`, '42501')
    await rejects(
      `insert into artwork_images(artwork_id,thumb_path,web_path,original_path,width,height) values ('${published}','t','w','o',1,1)`,
      '42501'
    )
    await rejects(`update artists set visibility='public' where id='${hiddenArtist}'`, '42501')
    await db.query('reset role')
  }
  await db.query('set role service_role')
  await db.query('update artists set claimed_by_user_id=$1 where id=$2', [
    'user_service_only',
    publicArtist,
  ])
  assert.equal(
    (await rows('select claimed_by_user_id from artists where id=$1', [publicArtist]))[0]
      .claimed_by_user_id,
    'user_service_only'
  )
  checks++
  await db.query(`update artworks set status='published' where id=$1`, [pending])
  await db.query(`update artist_records set is_asca_verified=true where artwork_id=$1`, [published])
  await count('select count(*) from artist_contacts', 1)
  assert.equal(
    (await rows('select original_path from artwork_images where id=$1', [image]))[0].original_path,
    `${published}/original.jpg`
  )
  checks++
  await db.query('reset role')
  assert.ok(
    (await rows('select published_at from artworks where id=$1', [pending]))[0].published_at
  )
  checks++
  await rejects(
    `insert into artist_records(artist_id,artwork_id,record_type,title) values ('${hiddenArtist}','${published}','award','wrong owner')`,
    '23503'
  )
  await rejects(
    `update artwork_images set thumb_path='https://example.com/image' where id='${image}'`,
    '23514'
  )
  for (const path of [
    '/absolute',
    '../escape',
    'x/../escape',
    'https://host/x',
    'x%2fsecret',
    'x?query',
    'x#hash',
    'x\\escape',
  ]) {
    assert.equal((await rows('select is_archive_path($1) as valid', [path]))[0].valid, false, path)
    checks++
  }
  await rejects(`update artwork_images set width=0 where id='${image}'`, '23514')
  await rejects(
    `insert into artwork_images(artwork_id,thumb_path,web_path,original_path,width,height,is_primary) values ('${published}','t','w','o',1,1,true)`,
    '23505'
  )
  await rejects(`update artists set teacher_artist_id=id where id='${publicArtist}'`, '23514')
  const tempTeacher = randomUUID()
  await db.query('insert into artists(id,name) values ($1,$2)', [tempTeacher, 'teacher'])
  await db.query('update artists set teacher_artist_id=$1 where id=$2', [tempTeacher, publicArtist])
  await db.query('delete from artists where id=$1', [tempTeacher])
  assert.equal(
    (await rows('select teacher_artist_id from artists where id=$1', [publicArtist]))[0]
      .teacher_artist_id,
    null
  )
  checks++
  assert.ok((await anon.from('artists').select('*')).error)
  checks++
  assert.ok((await anon.from('artists').select('claimed_by_user_id')).error)
  checks++
  const apiArtists = await ok(await anon.from('artists').select(PUBLIC_ARTIST_COLUMNS))
  assert.equal('claimed_by_user_id' in apiArtists[0], false)
  checks++
  assert.equal(apiArtists.length, 1)
  assert.equal('email' in apiArtists[0], false)
  checks++
  assert.ok((await anon.from('artist_contacts').select('*')).error)
  checks++
  assert.ok((await anon.from('artwork_images').select('original_path')).error)
  checks++
  assert.ok((await anon.from('events').select('luma_url')).error)
  checks++
  const apiEvents = await ok(await anon.from('public_events').select('luma_visibility,luma_url'))
  assert.ok(apiEvents.filter(e => e.luma_visibility !== 'public').every(e => e.luma_url === null))
  checks++
  const key = `${published}/integration.txt`
  await ok(
    await admin.storage
      .from('archive-public')
      .upload(key, Buffer.from('public derivative'), { contentType: 'text/plain', upsert: true })
  )
  await ok(
    await admin.storage
      .from('archive-private')
      .upload(key, Buffer.from('private original'), { contentType: 'text/plain', upsert: true })
  )
  assert.equal(
    (await fetch(`${local.API_URL}/storage/v1/object/public/archive-public/${key}`)).status,
    200
  )
  checks++
  assert.notEqual(
    (await fetch(`${local.API_URL}/storage/v1/object/public/archive-private/${key}`)).status,
    200
  )
  checks++
  assert.ok((await anon.storage.from('archive-private').download(key)).error)
  checks++
  assert.ok(
    (await anon.storage.from('archive-public').upload(`${published}/denied`, Buffer.from('no')))
      .error
  )
  checks++
  await ok(await admin.storage.from('archive-public').remove([key]))
  await ok(await admin.storage.from('archive-private').remove([key]))
  // Delete the linked artwork: retain artist history and clear only the optional artwork link.
  await db.query('delete from artworks where id=$1', [published])
  await count(
    `select count(*) from artist_records where artist_id='${publicArtist}' and artwork_id is null`,
    2
  )
  await db.query('delete from artists where id=$1', [publicArtist])
  await count(`select count(*) from artist_contacts where artist_id='${publicArtist}'`, 0)
  process.env.NEXT_PUBLIC_SUPABASE_URL = local.API_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY = local.SERVICE_ROLE_KEY
  const engine = new SyncEngine()
  let fields = { 'Name (Korean)': 'sync first', Email: 'first@example.com' }
  // Fake only the external Airtable transport; writes exercise real PostgREST/RLS.
  Object.defineProperty(engine, '_airtableBase', {
    value: () => ({
      select: () => ({ all: async () => [{ id: 'archive-integration-record', fields }] }),
    }),
  })
  try {
    await engine.syncTableData('Artists')
    const first = (
      await rows("select * from artists where airtable_id='archive-integration-record'")
    )[0]
    await db.query(
      "update artists set archive_bio='owned', visibility='hidden', claimed_by_user_id='user_archive', certification_grade='verified', profile_image_path='profile/web.webp' where id=$1",
      [first.id]
    )
    fields = {
      'Name (Korean)': 'sync second',
      Phone: '010',
      visibility: 'public',
      archive_bio: 'overwrite',
      certification_grade: 'overwrite',
      profile_image_path: 'overwrite',
    }
    await engine.syncTableData('Artists')
    const updated = (
      await rows("select * from artists where airtable_id='archive-integration-record'")
    )[0]
    assert.equal(updated.id, first.id)
    assert.equal(updated.name, 'sync second')
    assert.equal(updated.archive_bio, 'owned')
    assert.equal(updated.visibility, 'hidden')
    assert.equal(updated.claimed_by_user_id, 'user_archive')
    assert.equal(updated.certification_grade, 'verified')
    assert.equal(updated.profile_image_path, 'profile/web.webp')
    const contact = (await rows('select * from artist_contacts where artist_id=$1', [first.id]))[0]
    assert.equal(contact.email, 'first@example.com')
    assert.equal(contact.phone, '010')
    checks += 9
  } finally {
    await db.query("delete from artists where airtable_id='archive-integration-record'")
  }
  console.log(
    `Archive integration: ${checks} checks passed (SQL roles, REST, Storage, constraints).`
  )
} finally {
  await db.query('reset role')
  await db.query('delete from events where id=any($1::uuid[])', [ids])
  await db.query('delete from exhibitions where id=$1', [exhibition])
  await db.query('delete from artists where id=any($1::uuid[])', [ids])
  await db.end()
}

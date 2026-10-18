/** Local Supabase only. Temporary fixtures are deleted even if assertions fail. */
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
const local = JSON.parse(
  execFileSync('supabase', ['status', '-o', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
)
if (!/^http:\/\/127\.0\.0\.1:/.test(local.API_URL)) throw Error('Local database required')
process.env.NEXT_PUBLIC_SUPABASE_URL = local.API_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = local.ANON_KEY
process.env.SUPABASE_SERVICE_ROLE_KEY = local.SERVICE_ROLE_KEY
const { publicCv } = await import('../lib/archive/cv-queries.ts')
const { exhibitionArchive, exhibitionPicker } = await import('../lib/archive/exhibitions.ts')
const { listArtists, artistDetail, artistWorks, workDetail, recordsFor } = await import(
  '../lib/archive/queries.ts'
)
const admin = createClient(local.API_URL, local.SERVICE_ROLE_KEY)
const [artist, hidden, work, draft] = Array.from({ length: 4 }, () => randomUUID())
const tag = `archive-ui-${randomUUID()}`
const [exhibition, privateExhibition, hiddenWork] = Array.from({ length: 3 }, () => randomUUID())
async function ok(query) {
  const result = await query
  if (result.error) throw result.error
  return result.data
}
try {
  await ok(
    admin.from('artists').insert([
      { id: artist, name: tag, visibility: 'public', calligraphy_styles: ['해서'] },
      { id: hidden, name: `${tag}-hidden`, visibility: 'hidden', calligraphy_styles: [] },
    ])
  )
  const base = {
    artist_id: artist,
    category: 'calligraphy',
    medium: 'ink',
    description: 'local UI test',
    dimensions: {},
    images: [],
    year_created: 2024,
  }
  await ok(
    admin.from('artworks').insert([
      { ...base, id: work, title: tag, status: 'published' },
      { ...base, id: draft, title: `${tag}-draft`, status: 'draft' },
    ])
  )
  await ok(
    admin.from('artwork_images').insert({
      artwork_id: work,
      thumb_path: `test/${work}/thumb.webp`,
      web_path: `test/${work}/web.webp`,
      original_path: `test/${work}/original.png`,
      is_primary: true,
      width: 100,
      height: 200,
    })
  )
  await ok(
    admin.from('artist_records').insert({
      artist_id: artist,
      artwork_id: work,
      record_type: 'exhibition',
      title: tag,
      is_asca_verified: false,
      source: 'self_reported',
    })
  )
  const list = await listArtists({ q: tag })
  assert.equal(list.total, 1)
  assert.equal(list.artists[0].artworks.length, 1)
  assert.equal(list.artists[0].artworks[0].artwork_images.length, 1)
  assert.equal((await listArtists({ q: tag, style: '없는 서체' })).total, 0)
  assert.equal(await artistDetail(hidden), null)
  assert.equal((await artistWorks(artist, 1)).total, 1)
  assert.equal(await workDetail(draft), null)
  const detail = await workDetail(work)
  assert.equal(detail.artwork_images[0].web_path, `test/${work}/web.webp`)
  assert.equal((await recordsFor(artist, 1, work)).total, 1)
  const json = JSON.stringify({ list, detail })
  assert.equal(json.includes('original_path'), false)
  assert.equal(json.includes('claimed_by_user_id'), false)
  await ok(
    admin.from('artworks').insert({
      ...base,
      artist_id: hidden,
      id: hiddenWork,
      title: 'hidden artist work',
      status: 'published',
    })
  )
  await ok(
    admin.from('artist_records').insert([
      {
        artist_id: artist,
        artwork_id: draft,
        record_type: 'award',
        title: 'private draft record',
        is_asca_verified: false,
        source: 'self_reported',
      },
      {
        artist_id: artist,
        record_type: 'award',
        title: 'profile award',
        year: 2025,
        is_asca_verified: true,
        source: 'asca_archive',
      },
      {
        artist_id: hidden,
        record_type: 'award',
        title: 'hidden artist record',
        is_asca_verified: false,
        source: 'self_reported',
      },
    ])
  )
  // Cross the PostgREST 1,000-row default: the printable CV must not silently lose history.
  for (let start = 0; start < 1003; start += 250)
    await ok(
      admin.from('artist_records').insert(
        Array.from({ length: Math.min(250, 1003 - start) }, (_, i) => ({
          artist_id: artist,
          record_type: 'exhibition',
          title: `CV pagination fixture ${start + i}`,
          year: 2024,
        }))
      )
    )
  const cv = await publicCv(artist)
  assert.equal(cv.complete, true)
  assert.equal(cv.records.length, 1005)
  assert.equal(
    cv.records.some(r => r.title === 'private draft record'),
    false
  )
  assert.equal(await publicCv(hidden), null)
  assert.equal(JSON.stringify(cv).includes('claimed_by_user_id'), false)
  await ok(
    admin.from('exhibitions').insert([
      {
        id: exhibition,
        title: tag,
        description: 'test',
        start_date: '2026-01-01',
        end_date: '2026-01-02',
        is_published: true,
      },
      {
        id: privateExhibition,
        title: 'private exhibition',
        description: 'test',
        start_date: '2026-01-01',
        end_date: '2026-01-02',
        is_published: false,
      },
    ])
  )
  await ok(
    admin
      .from('exhibition_artworks')
      .insert([
        ...[work, draft, hiddenWork].map(artwork_id => ({ exhibition_id: exhibition, artwork_id })),
        { exhibition_id: privateExhibition, artwork_id: work },
      ])
  )
  const gallery = await exhibitionArchive(exhibition, 1)
  assert.equal(gallery.total, 1)
  assert.equal(gallery.works[0].id, work)
  assert.equal(await exhibitionArchive(privateExhibition, 1), null)
  const picker = await exhibitionPicker(exhibition, 1, '', true)
  assert.equal(picker.total, 3) // Admin can also remove links whose source later became private.
  const available = await exhibitionPicker(exhibition, 1, tag, false)
  assert.equal(available.total, 1)
  assert.equal(available.works[0].linked, true)
  await ok(admin.from('artworks').update({ title: 'updated source title' }).eq('id', work))
  assert.equal((await exhibitionArchive(exhibition, 1)).works[0].title, 'updated source title')
  const exportJson = JSON.stringify(gallery)
  assert.equal(exportJson.includes('original_path'), false)
  assert.equal(exportJson.includes('claimed_by_user_id'), false)
  console.log(
    'Archive public queries: CV pagination/privacy, exhibition RLS, source reuse and admin selection passed'
  )
} finally {
  await ok(admin.from('exhibitions').delete().in('id', [exhibition, privateExhibition]))
  await ok(admin.from('artists').delete().in('id', [artist, hidden]))
}

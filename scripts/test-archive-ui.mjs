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
const { listArtists, artistDetail, artistWorks, workDetail, recordsFor } = await import(
  '../lib/archive/queries.ts'
)
const admin = createClient(local.API_URL, local.SERVICE_ROLE_KEY)
const [artist, hidden, work, draft] = Array.from({ length: 4 }, () => randomUUID())
const tag = `archive-ui-${randomUUID()}`
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
  console.log('Archive UI: 11 actual public-query checks passed')
} finally {
  await ok(admin.from('artists').delete().in('id', [artist, hidden]))
}

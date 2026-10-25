/** Real anonymous Storage RLS and publication revocation. LOCAL fake fixtures only. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { publicArtworkImage } from '../supabase/functions/_shared/public-artwork-image.mjs'

const local = JSON.parse(
  execFileSync('supabase', ['status', '-o', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
)
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(local.API_URL)) throw Error('Local stack required')
const admin = createClient(local.API_URL, local.SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})
const anon = createClient(local.API_URL, local.ANON_KEY, { auth: { persistSession: false } })
const [artist, hiddenArtist] = [randomUUID(), randomUUID()]
const works = Array.from({ length: 4 }, () => randomUUID())
const paths = works.map(id => `published-imports/${id}/${randomUUID()}-${'a'.repeat(24)}.png`)
const blob = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
)
const ok = result => {
  assert.equal(result.error, null, result.error?.message)
  return result.data
}
const req = id => new Request(`https://example.test/image?id=${id}`)
let checks = 0
try {
  ok(
    await admin.from('artists').insert([
      {
        id: artist,
        name: 'Public media fixture',
        membership_type: '초대작가',
        visibility: 'public',
      },
      {
        id: hiddenArtist,
        name: 'Hidden media fixture',
        membership_type: '준회원',
        visibility: 'hidden',
      },
    ])
  )
  for (let i = 0; i < 3; i++) {
    ok(
      await admin.from('artworks').insert({
        id: works[i],
        artist_id: i === 2 ? hiddenArtist : artist,
        title: 'Imported media fixture',
        description: 'Fake fixture',
        category: 'calligraphy',
        medium: 'paper',
        dimensions: {},
        year_created: 2025,
        status: i === 1 ? 'draft' : 'published',
        images: { main: { bucket: 'archive-private', path: paths[i] } },
      })
    )
  }
  for (const path of paths)
    ok(await admin.storage.from('archive-private').upload(path, blob, { contentType: 'image/png' }))
  assert.equal(ok(await anon.from('artworks').select('id').eq('id', works[0])).length, 1)
  assert.deepEqual(
    Buffer.from(
      await ok(await anon.storage.from('archive-private').download(paths[0])).arrayBuffer()
    ),
    blob
  )
  checks++
  assert.ok((await anon.storage.from('archive-private').createSignedUrl(paths[0], 3600)).error)
  checks++
  const listed = await anon.storage.from('archive-private').list(`published-imports/${works[0]}`)
  assert.ok(listed.error || listed.data.length === 0)
  checks++
  assert.ok((await anon.storage.from('archive-private').upload(`${paths[0]}.other`, blob)).error)
  checks++
  await anon.storage.from('archive-private').remove([paths[0]])
  assert.deepEqual(
    Buffer.from(
      await ok(await admin.storage.from('archive-private').download(paths[0])).arrayBuffer()
    ),
    blob
  )
  checks++
  for (const path of paths.slice(1)) {
    assert.ok((await anon.storage.from('archive-private').download(path)).error)
    checks++
  }
  assert.equal(
    (await fetch(`${local.API_URL}/storage/v1/object/public/archive-private/${paths[0]}`)).ok,
    false
  )
  checks++
  assert.equal((await publicArtworkImage(req(works[0]), anon)).status, 200)
  checks++
  for (const id of works.slice(1)) {
    assert.equal((await publicArtworkImage(req(id), anon)).status, 404)
    checks++
  }
  ok(await admin.from('artists').update({ membership_type: '준회원' }).eq('id', artist))
  assert.equal((await publicArtworkImage(req(works[0]), anon)).status, 404)
  checks++
  assert.ok((await anon.storage.from('archive-private').download(paths[0])).error)
  checks++
  ok(await admin.from('artists').update({ membership_type: '초대작가' }).eq('id', artist))
  // Reproduce a visibility change between the handler's artwork read and blob read.
  const racing = {
    from: anon.from.bind(anon),
    storage: {
      from: bucket => ({
        download: async path => {
          ok(await admin.from('artists').update({ membership_type: '준회원' }).eq('id', artist))
          return anon.storage.from(bucket).download(path)
        },
      }),
    },
  }
  assert.equal((await publicArtworkImage(req(works[0]), racing)).status, 404)
  checks++
  ok(await admin.from('artists').update({ membership_type: '초대작가' }).eq('id', artist))
  ok(await admin.from('artworks').update({ status: 'draft' }).eq('id', works[0]))
  assert.ok((await anon.storage.from('archive-private').download(paths[0])).error)
  checks++
  const forged = new Request(`https://example.test/image?id=${works[2]}`, {
    headers: { Authorization: 'Bearer untrusted-caller-value' },
  })
  assert.equal((await publicArtworkImage(forged, anon)).status, 404)
  checks++
  console.log(
    `Imported media: ${checks} real RLS/handler checks passed (private at rest, public only, revocation, read race).`
  )
} catch (error) {
  if (error.actual?.originalError instanceof Response) {
    const response = error.actual.originalError
    throw Error(`Local Storage check failed: ${response.status} ${await response.clone().text()}`)
  }
  throw error
} finally {
  await admin.storage.from('archive-private').remove(paths)
  await admin.from('artworks').delete().in('id', works)
  await admin.from('artists').delete().in('id', [artist, hiddenArtist])
}

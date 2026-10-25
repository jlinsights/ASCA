import test from 'node:test'
import assert from 'node:assert/strict'
import { publicArtworkImage } from '../../supabase/functions/_shared/public-artwork-image.mjs'
import { cleanupImportObject, stillPublicSnapshot } from './airtable-artworks.mjs'

const id = '11111111-1111-4111-8111-111111111111'
const objectPath = `published-imports/${id}/22222222-2222-4222-8222-222222222222-${'a'.repeat(24)}.png`
const images = { main: { bucket: 'archive-private', path: objectPath } }
function fixture(data = { id, images }, readError = null) {
  let downloads = 0,
    removes = 0
  return {
    client: {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data, error: readError }) }) }),
      }),
      storage: {
        from: () => ({
          download: async () => {
            downloads++
            return { data: new Blob(['fake image'], { type: 'image/png' }), error: null }
          },
          remove: async () => {
            removes++
            return { error: null }
          },
        }),
      },
    },
    downloads: () => downloads,
    removes: () => removes,
  }
}
const request = value => new Request(`https://example.test/image?id=${value}`)
test('only a linked, RLS-readable imported image can be returned', async () => {
  const f = fixture()
  const response = await publicArtworkImage(request(id), f.client)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'private, no-store, max-age=0')
  assert.equal(await response.text(), 'fake image')
})
test('unknown/private artworks and arbitrary submission paths never reach Storage', async () => {
  for (const data of [
    null,
    { id, images: { main: { bucket: 'archive-private', path: 'submissions/private.jpg' } } },
    { id, images: { main: { bucket: 'archive-public', path: objectPath } } },
  ]) {
    const f = fixture(data)
    assert.equal((await publicArtworkImage(request(id), f.client)).status, 404)
    assert.equal(f.downloads(), 0)
  }
})
test('malformed requests and methods do not read data', async () => {
  const f = fixture()
  assert.equal((await publicArtworkImage(request('not-an-id'), f.client)).status, 404)
  assert.equal(
    (
      await publicArtworkImage(
        new Request(`https://example.test/image?id=${id}`, { method: 'POST' }),
        f.client
      )
    ).status,
    405
  )
  assert.equal(f.downloads(), 0)
})
test('a DB read failure is unavailable rather than an anonymous authorization bypass', async () => {
  const f = fixture(null, { code: 'unavailable' })
  assert.equal((await publicArtworkImage(request(id), f.client)).status, 503)
  assert.equal(f.downloads(), 0)
})
test('cleanup of deleted rows removes only the current run object', async () => {
  const f = fixture(null)
  assert.equal(await cleanupImportObject(f.client, id, objectPath), 'removed')
  assert.equal(f.removes(), 1)
})
test('ambiguous cleanup is recorded, while referenced images are retained', async () => {
  const unavailable = fixture(null, { code: 'unavailable' })
  assert.equal(await cleanupImportObject(unavailable.client, id, objectPath), 'cleanup_required')
  assert.equal(unavailable.removes(), 0)
  const linked = fixture()
  assert.equal(await cleanupImportObject(linked.client, id, objectPath), 'referenced')
  assert.equal(linked.removes(), 0)
})
test('a changed source snapshot is rejected before Storage writes', async () => {
  const expected = {
    id,
    artist_id: 'owner',
    status: 'published',
    year_created: 2025,
    updated_at: 'before',
    images: {},
  }
  for (const changed of [
    { ...expected, status: 'draft' },
    { ...expected, artist_id: 'new-owner' },
    { ...expected, updated_at: 'after' },
    { ...expected, images },
  ]) {
    const f = fixture(changed)
    assert.equal(await stillPublicSnapshot(f.client, expected), false)
    assert.equal(f.downloads(), 0)
  }
})

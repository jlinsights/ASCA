import test from 'node:test'
import assert from 'node:assert/strict'
import { planVerifiedImages, hasServableImage } from './airtable-artworks.mjs'

const id = '11111111-1111-4111-8111-111111111111'
const artist = '22222222-2222-4222-8222-222222222222'
const row = { id, artist_id: artist, year_created: 2025, status: 'published', images: {} }
const files = [{ artworkId: id, path: `/private/verified/${id}.jpg` }]
const owners = [{ id: artist, visibility: 'public' }]
test('a verified UUID connects only to its exact artwork', () => {
  assert.equal(planVerifiedImages(files, [row], owners, 2025).ready.length, 1)
  assert.equal(
    planVerifiedImages(
      files,
      [{ ...row, id: '33333333-3333-4333-8333-333333333333' }],
      owners,
      2025
    ).ready.length,
    0
  )
})
test('private artists, unreviewed works and year mismatches never get public uploads', () => {
  for (const changed of [
    { ...row, status: 'draft' },
    { ...row, status: 'pending_review' },
    { ...row, year_created: 2026 },
  ])
    assert.equal(planVerifiedImages(files, [changed], owners, 2025).ready.length, 0)
  for (const visibility of ['hidden', 'members'])
    assert.equal(
      planVerifiedImages(files, [row], [{ id: artist, visibility }], 2025).ready.length,
      0
    )
  assert.equal(planVerifiedImages(files, [row], [], 2025).ready.length, 0)
})
test('existing manual or permanent images are preserved', () => {
  for (const images of [
    { main: { path: 'manual/original.jpg' } },
    { main: { url: 'https://example.test/portrait.jpg' } },
  ]) {
    const plan = planVerifiedImages(files, [{ ...row, images }], owners, 2025)
    assert.equal(plan.ready.length, 0)
    assert.equal(plan.skipped[0].reason, 'already_connected')
  }
})
test('Drive links and expiring Airtable links are eligible for permanent originals', () => {
  for (const url of [
    'https://drive.google.com/file/d/example/view',
    'https://docs.google.com/example',
    'https://v5.airtableusercontent.com/example',
  ]) {
    assert.equal(hasServableImage({ main: { url } }), false)
    assert.equal(
      planVerifiedImages(files, [{ ...row, images: { main: { url } } }], owners, 2025).ready.length,
      1
    )
  }
})
test('duplicate or malformed source identifiers are never guessed', () => {
  assert.equal(planVerifiedImages([...files, ...files], [row], owners, 2025).ready.length, 0)
  assert.equal(
    planVerifiedImages([{ artworkId: 'An artist name', path: 'unknown.jpg' }], [row], owners, 2025)
      .ready.length,
    0
  )
})

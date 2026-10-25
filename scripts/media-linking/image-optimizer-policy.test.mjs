import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'

const require = createRequire(import.meta.url)
const config = require('../../next.config.js')
const { hasRemoteMatch } = require('next/dist/shared/lib/match-remote-pattern')
const allowed = source =>
  hasRemoteMatch(config.images.domains, config.images.remotePatterns, new URL(source))

test('optimizer rejects Supabase function URLs, including encoded routes', () => {
  assert.equal(config.images.maximumRedirects, 0)
  for (const pathname of [
    '/functions/v1/public-artwork-image?id=fake',
    '/%66unctions/v1/public-artwork-image?id=fake',
    '/functions%2fv1%2fpublic-artwork-image?id=fake',
    '/storage/v1/object/authenticated/archive-private/fake.png',
  ]) {
    for (const host of ['example.supabase.co', 'example.supabase.co.', 'EXAMPLE.SUPABASE.CO.'])
      assert.equal(allowed(`https://${host}${pathname}`), false)
  }
})

test('ordinary public Storage and other existing HTTPS images remain optimized', () => {
  assert.equal(
    allowed('https://example.supabase.co/storage/v1/object/public/artwork-images/fake.jpg'),
    true
  )
  assert.equal(allowed('https://example.test/fake.jpg'), true)
})

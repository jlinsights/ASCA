import { archivePublicUrl, isArchivePath } from '../archive-storage'

describe('archive storage keys', () => {
  it.each([
    'https://host/image',
    '/absolute',
    '../secret',
    'a/../b',
    'a%2fb',
    'a?token',
    'a#hash',
    'a\\b',
    'a//b',
    '',
  ])('rejects unsafe key %s', key => expect(isArchivePath(key)).toBe(false))
  it('resolves an encoded relative key from the configured origin without transforms', () => {
    const previous = process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    expect(archivePublicUrl('artist/작품 1.webp')).toBe(
      'https://example.supabase.co/storage/v1/object/public/archive-public/artist/%EC%9E%91%ED%92%88%201.webp'
    )
    process.env.NEXT_PUBLIC_SUPABASE_URL = previous
  })
})

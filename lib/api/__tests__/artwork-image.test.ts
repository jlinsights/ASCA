import { artworkImageUrl } from '../artwork-image'

describe('artworkImageUrl', () => {
  it('공개용 Storage 경로를 현재 환경의 주소로 조합한다', () => {
    const previous = process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    try {
      expect(artworkImageUrl({ main: { bucket: 'artwork-images', path: 'work/main.webp' } })).toBe(
        'https://example.supabase.co/storage/v1/object/public/artwork-images/work/main.webp'
      )
      expect(
        artworkImageUrl({ main: { bucket: 'archive-private', path: 'original.jpg' } })
      ).toBeNull()
      expect(artworkImageUrl({ main: { path: '../original.jpg' } })).toBeNull()
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
      else process.env.NEXT_PUBLIC_SUPABASE_URL = previous
    }
  })
  it('images.main.url 을 꺼낸다', () => {
    const url =
      'https://caxjyimsuvjnbmjoxfad.supabase.co/storage/v1/object/public/artwork-images/a.jpg'
    expect(artworkImageUrl({ main: { url } })).toBe(url)
  })

  it('비공개 Google Drive 링크는 이미지 없음으로 본다', () => {
    expect(artworkImageUrl({ main: { url: 'https://drive.google.com/uc?id=abc' } })).toBeNull()
  })

  it.each([null, undefined, {}, [], 'x', { main: {} }, { main: { url: 'not-a-url' } }])(
    '모양이 다르면 null — %p',
    value => expect(artworkImageUrl(value)).toBeNull()
  )
})

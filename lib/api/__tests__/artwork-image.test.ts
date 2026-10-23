import { artworkImageUrl } from '../artwork-image'

describe('artworkImageUrl', () => {
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

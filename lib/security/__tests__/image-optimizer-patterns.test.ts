/**
 * 이미지 최적화(/_next/image)가 받아 올 수 있는 주소 — 실제 next.config.js 를 Next 의 매처로 검사한다.
 * 최적화 결과는 공개 캐시에 하루 남으므로, 볼 때마다 권한을 확인하는 라우트(게시판 사진)를
 * 거치게 두면 글을 숨긴 뒤에도 사진이 보인다.
 */
import { hasLocalMatch } from 'next/dist/shared/lib/match-local-pattern'
import { hasRemoteMatch } from 'next/dist/shared/lib/match-remote-pattern'

const { images } = require('../../../next.config.js')

const local = (path: string) => hasLocalMatch(images.localPatterns, path)
const remote = (url: string) =>
  hasRemoteMatch(images.domains ?? [], images.remotePatterns, new URL(url))

describe('image optimizer — local paths', () => {
  it.each([
    '/api/community/images/3f1c2d4e-0000-4000-8000-000000000000',
    '/api/community/images/3f1c2d4e-0000-4000-8000-000000000000?x=1',
    '/api/artworks',
    '/community/board/abc',
  ])('refuses %s', path => expect(local(path)).toBe(false))

  it.each([
    '/images/artworks/a.webp',
    '/logo/asca.svg',
    '/sponsor/s.png',
    '/favicon/favicon.svg',
    '/webflow/orientalcalligraphy/images/x.jpg',
    '/_next/static/media/hero.1a2b3c.jpg',
    '/placeholder.jpg',
    '/placeholder-user.jpg?v=2',
  ])('allows %s', path => expect(local(path)).toBe(true))
})

describe('image optimizer — remote hosts', () => {
  it.each([
    'https://www.orientalcalligraphy.org/api/community/images/3f1c2d4e-0000-4000-8000-000000000000',
    'https://orientalcalligraphy.org/api/community/images/x',
    'https://asca-main.vercel.app/api/community/images/x',
    'https://evil.example/x.svg',
    'http://caxjyimsuvjnbmjoxfad.supabase.co/storage/v1/object/public/a.jpg',
  ])('refuses %s', url => expect(remote(url)).toBe(false))

  it.each([
    'https://caxjyimsuvjnbmjoxfad.supabase.co/storage/v1/object/public/artwork-images/a/main.webp',
    'https://imagedelivery.net/abc/def/Contain',
    'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/forms/a.png',
    'https://cdn.prod.website-files.com/6220af701a295f89dac62631/a.jpg',
    'https://img.clerk.com/avatar.png',
  ])('allows %s', url => expect(remote(url)).toBe(true))
})

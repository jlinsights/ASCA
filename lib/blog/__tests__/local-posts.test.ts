/**
 * @jest-environment node
 */
import { getLocalPost, localPostSlugs, localPosts } from '../local-posts'

describe('local blog posts (lib/data/blog-posts.json)', () => {
  test('slug 로 글을 찾고, 없는 slug 는 null', () => {
    const [first] = localPosts
    expect(getLocalPost(first!.id)?.title).toBe(first!.title)
    expect(getLocalPost('no-such-post')).toBeNull()
  })

  test('slug 는 옛 Webflow /post/<slug> 와 같은 형식이고 겹치지 않는다', () => {
    const slugs = localPostSlugs()
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/)
  })

  // 서버에서 그대로 렌더하므로(DOMPurify 는 브라우저 전용) 본문에 실행 가능한 마크업이 없어야 한다.
  // iframe 은 CSP frame-src 가 허용한 Spotify 임베드만 둔다(옛 Webflow 글 1 개가 팟캐스트를 싣는다).
  const ALLOWED_IFRAME_HOSTS = ['open.spotify.com']

  test.each(localPosts.map(p => [p.id, p.content ?? ''] as const))(
    '%s 본문에 스크립트·이벤트 핸들러·javascript: 주소·허용 밖 iframe 이 없다',
    (_id, content) => {
      expect(content).not.toMatch(/<\s*(script|object|embed|form|style)\b/i)
      expect(content).not.toMatch(/\son[a-z]+\s*=/i)
      expect(content).not.toMatch(/(href|src)\s*=\s*["']?\s*javascript:/i)
      const iframeTags = content.match(/<\s*iframe\b[^>]*>/gi) ?? []
      for (const tag of iframeTags) {
        const src = /\ssrc\s*=\s*"([^"]+)"/i.exec(tag)?.[1] ?? ''
        expect(src.startsWith('https://')).toBe(true)
        expect(ALLOWED_IFRAME_HOSTS).toContain(new URL(src).host)
      }
    }
  )
})

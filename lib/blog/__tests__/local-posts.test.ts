/**
 * @jest-environment node
 */
import { articleBodyHtml, getLocalPost, localPostSlugs, localPosts } from '../local-posts'

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

  // 글 제목이 페이지의 h1 이다. 옛 Webflow 본문의 h1 이 그대로 나가면 한 페이지에 h1 이 여럿 생긴다
  test('본문의 h1 은 h2 로 낮춰 내보낸다 (속성은 그대로)', () => {
    const html = articleBodyHtml({
      id: 'x',
      title: 't',
      summary: 's',
      publishedAt: '2026-01-01',
      content: '<h1 class="a">하나</h1><p>본문</p><H1>둘</H1><h10>그대로</h10>',
    })
    expect(html).toBe('<h2 class="a">하나</h2><p>본문</p><h2>둘</h2><h10>그대로</h10>')
  })

  test.each(localPosts.map(p => [p.id, p] as const))('%s 본문에 h1 이 남지 않는다', (_id, post) => {
    expect(articleBodyHtml(post)).not.toMatch(/<h1[\s>]/i)
  })

  test('본문이 없으면 요약을 내보낸다', () => {
    expect(
      articleBodyHtml({ id: 'x', title: 't', summary: '요약', publishedAt: '2026-01-01' })
    ).toBe('요약')
  })
})

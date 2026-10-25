/**
 * @jest-environment node
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { getLocalPost, localPostSlugs, localPosts, postDescription } from '../local-posts'

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

  // 2026-10-25 Webflow → Vercel 이전: Webflow 를 해지하면 cdn.prod.website-files.com 이미지가 깨진다.
  test('썸네일·본문 이미지가 Webflow CDN 이 아니라 저장소의 public/ 파일이다', () => {
    for (const post of localPosts) {
      const text = `${post.thumbnail ?? ''} ${post.content ?? ''}`
      expect(text).not.toContain('website-files.com')
      for (const path of text.match(/\/images\/blog\/[A-Za-z0-9._-]+/g) ?? []) {
        expect(existsSync(join(process.cwd(), 'public', path))).toBe(true)
      }
    }
  })

  describe('postDescription', () => {
    test('문단 사이에 공백을 넣고 제목(h1)은 뺀다', () => {
      expect(
        postDescription({
          summary: '',
          content: '<h1>제목</h1><p>첫 문단.</p><h2>소제목</h2><p>둘째&nbsp;문단</p>',
        })
      ).toBe('첫 문단. 소제목 둘째 문단')
    })

    test('155자를 넘으면 단어 경계에서 자르고 말줄임표를 붙인다', () => {
      const long = Array.from({ length: 60 }, (_, i) => `단어${i}`).join(' ')
      const out = postDescription({ summary: long })
      expect(out.length).toBeLessThanOrEqual(156)
      expect(out.endsWith('…')).toBe(true)
      expect(long.startsWith(out.slice(0, -1))).toBe(true)
      expect(out.slice(0, -1)).not.toMatch(/\s$/)
    })

    test.each(localPosts.map(p => [p.id, p] as const))(
      '%s 설명은 비어 있지 않고 태그가 없다',
      (_id, post) => {
        const d = postDescription(post)
        expect(d.length).toBeGreaterThan(20)
        expect(d.length).toBeLessThanOrEqual(156)
        expect(d).not.toMatch(/[<>]/)
      }
    )
  })
})

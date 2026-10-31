// 옛 Webflow 블로그에서 옮긴 글 — lib/data/blog-posts.json. id 가 옛 /post/<slug> 와 같다.
// 서버에서 읽는다. lib/services/blog-service.ts 는 rss-parser·Tistory 요청을 끌고 오므로 쓰지 않는다.
import migratedPosts from '@/lib/data/blog-posts.json'

export interface LocalPost {
  id: string
  title: string
  summary: string
  content?: string
  publishedAt: string
  thumbnail?: string
  author?: string
  tags?: string[]
}

export const localPosts: readonly LocalPost[] = migratedPosts

export function getLocalPost(slug: string): LocalPost | null {
  return localPosts.find(post => post.id === slug) ?? null
}

export function localPostSlugs(): string[] {
  return localPosts.map(post => post.id)
}

/**
 * 글 본문 HTML. 페이지의 h1 은 글 제목 하나여야 하는데, 옛 Webflow 본문 4 개가 h1 을 품고 있다
 * (겸재 정선 글은 27 개) — 본문의 h1 은 h2 로 낮춘다.
 */
export function articleBodyHtml(post: LocalPost): string {
  return (post.content || post.summary).replace(/<(\/?)h1(?=[\s>])/gi, '<$1h2')
}

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

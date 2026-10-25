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

const DESCRIPTION_MAX = 155

// 검색 결과·공유 카드용 설명. summary 는 HTML 을 공백 없이 벗겨 내 문단이 붙어 있으므로
// (예: '…영향력한국어를…') 본문에서 다시 만든다. 첫 <h1> 은 제목과 같아 뺀다.
export function postDescription(post: Pick<LocalPost, 'summary' | 'content'>): string {
  const source = post.content ? post.content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, ' ') : post.summary
  const text = source
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= DESCRIPTION_MAX) return text
  const cut = text.slice(0, DESCRIPTION_MAX)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > DESCRIPTION_MAX * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

export function localPostSlugs(): string[] {
  return localPosts.map(post => post.id)
}

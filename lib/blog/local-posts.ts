// 옛 Webflow 블로그에서 옮긴 글 — lib/data/blog-posts.json. id 가 옛 /post/<slug> 와 같다.
// 서버에서 읽는다. /blog 목록(blogListItems)과 글 상세가 모두 여기서 읽는다.
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

/**
 * 글 본문 HTML. 페이지의 h1 은 글 제목 하나여야 하는데, 옛 Webflow 본문 4 개가 h1 을 품고 있다
 * (겸재 정선 글은 27 개) — 본문의 h1 은 h2 로 낮춘다.
 */
export function articleBodyHtml(post: LocalPost): string {
  return (post.content || post.summary).replace(/<(\/?)h1(?=[\s>])/gi, '<$1h2')
}

/** /blog 목록 카드에 쓰는 칸만 — 본문(content)은 상세 페이지가 서버에서 읽는다 */
export interface BlogListItem {
  id: string
  title: string
  summary: string
  publishedAt: string
  thumbnail?: string
  author?: string
  tags?: string[]
  source: 'local' | 'tistory' | 'kakao'
  link: string
}

/** 서버에서 만든 목록. 최신 글부터 놓는다 */
export function blogListItems(): BlogListItem[] {
  return localPosts
    .map(({ id, title, summary, publishedAt, thumbnail, author, tags }) => ({
      id,
      title,
      summary,
      publishedAt,
      thumbnail,
      author,
      tags,
      source: 'local' as const,
      link: `/blog/${id}`,
    }))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

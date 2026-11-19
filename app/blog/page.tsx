import type { Metadata } from 'next'
import { blogListItems } from '@/lib/blog/local-posts'
import { BlogListClient } from './_components/blog-list-client'

// 목록은 서버에서 만든다 — 클라이언트로는 카드에 쓰는 칸만 넘긴다(본문·rss-parser 는 싣지 않는다).
// 제목·설명은 app/blog/layout.tsx 가 단다. canonical 은 레이아웃에 두면 글 상세가 물려받으므로 여기에만 둔다.
export const metadata: Metadata = { alternates: { canonical: '/blog' } }

export default function BlogPage() {
  return <BlogListClient posts={blogListItems()} />
}

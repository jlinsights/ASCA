import { blogListItems } from '@/lib/blog/local-posts'
import { BlogListClient } from './_components/blog-list-client'

// 목록은 서버에서 만든다 — 클라이언트로는 카드에 쓰는 칸만 넘긴다(본문·rss-parser 는 싣지 않는다).
// metadata 는 app/blog/layout.tsx 가 단다.
export default function BlogPage() {
  return <BlogListClient posts={blogListItems()} />
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { constructMetadata } from '@/lib/seo'
import { getLocalPost, localPostSlugs } from '@/lib/blog/local-posts'

type Props = { params: Promise<{ slug: string }> }

// 본문은 저장소에 커밋된 정적 데이터다. DOMPurify 는 브라우저 전용이라 서버 렌더에서 쓸 수 없고,
// 대신 lib/blog/__tests__/local-posts.test.ts 가 실행 가능한 마크업이 없음을 확인한다.
const ARTICLE_BODY_CLASS =
  'leading-relaxed [&>p]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&_figure]:my-8 [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground [&_figcaption]:mt-2 [&_a]:underline [&_a]:underline-offset-4'

export const dynamicParams = false

export async function generateStaticParams() {
  return localPostSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getLocalPost(slug)
  if (!post) return {}
  return constructMetadata({
    title: post.title,
    description: post.summary.slice(0, 160),
    image: post.thumbnail,
    url: `/blog/${post.id}`,
    type: 'article',
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getLocalPost(slug)
  if (!post) notFound()

  const published = new Date(post.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className='min-h-screen bg-background'>
      <article className='container py-12 md:py-20'>
        <div className='max-w-3xl mx-auto'>
          <Link
            href='/blog'
            className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8'
          >
            <ArrowLeft className='h-4 w-4' aria-hidden='true' />
            블로그
          </Link>
          <header className='mb-10'>
            <h1 lang='ko' className='text-3xl md:text-4xl font-bold leading-tight mb-4'>
              {post.title}
            </h1>
            <p className='text-sm text-muted-foreground flex items-center gap-4'>
              <span className='inline-flex items-center gap-1'>
                <Calendar className='h-3.5 w-3.5' aria-hidden='true' />
                <time dateTime={post.publishedAt}>{published}</time>
              </span>
              {post.author && (
                <span className='inline-flex items-center gap-1'>
                  <User className='h-3.5 w-3.5' aria-hidden='true' />
                  {post.author}
                </span>
              )}
            </p>
          </header>
          <div
            lang='ko'
            className={ARTICLE_BODY_CLASS}
            dangerouslySetInnerHTML={{ __html: post.content || post.summary }}
          />
        </div>
      </article>
      <LayoutFooter />
    </main>
  )
}

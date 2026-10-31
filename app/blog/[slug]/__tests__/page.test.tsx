/**
 * @jest-environment node
 */
import { renderToStaticMarkup } from 'react-dom/server'
import BlogPostPage, { generateMetadata, generateStaticParams } from '../page'
import { articleBodyHtml, localPosts } from '@/lib/blog/local-posts'

jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))

const post = localPosts[0]!
const params = (slug: string) => ({ params: Promise.resolve({ slug }) })

describe('/blog/[slug]', () => {
  test('모든 로컬 글을 정적으로 만든다', async () => {
    const result = await generateStaticParams()
    expect(result).toEqual(localPosts.map(p => ({ slug: p.id })))
  })

  test('글마다 canonical·article 메타데이터를 단다', async () => {
    const meta = await generateMetadata(params(post.id))
    expect(meta.alternates?.canonical).toBe(`/blog/${post.id}`)
    expect(meta.openGraph).toMatchObject({ type: 'article', url: `/blog/${post.id}` })
    expect(String(meta.title)).toContain(post.title)
  })

  test('제목·본문을 서버에서 렌더한다', async () => {
    const html = renderToStaticMarkup(await BlogPostPage(params(post.id)))
    expect(html).toContain(post.title)
    expect(html).toContain('href="/blog"')
    expect(html).toContain(articleBodyHtml(post).slice(0, 40))
  })

  test('페이지의 h1 은 글 제목 하나다 (본문 h1 은 h2 로 낮춘다)', async () => {
    for (const p of localPosts) {
      const html = renderToStaticMarkup(await BlogPostPage(params(p.id)))
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    }
  })

  test('없는 글은 404', async () => {
    await expect(BlogPostPage(params('no-such-post'))).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(generateMetadata(params('no-such-post'))).resolves.toEqual({})
  })
})

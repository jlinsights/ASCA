import fs from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import { blogListItems, localPosts } from '@/lib/blog/local-posts'
import { BlogListClient, formatBlogDate } from '../_components/blog-list-client'

jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/components/layout/page-hero', () => ({
  PageHero: ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <header>
      <h1>{title}</h1>
      {children}
    </header>
  ),
  HeroFacts: ({ facts }: { facts: { label: string; value: string | number }[] }) => (
    <dl>
      {facts.map(f => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  ),
}))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ language: 'ko', t: (key: string) => key }),
}))

// 감사(P1): /blog 가 클라이언트에서 blog-service 를 불러 rss-parser 와 글 본문 14편(344KB)을
// 첫 번들에 실었다. 목록은 서버에서 만들고, 목록에 필요한 칸만 넘긴다.
describe('blogListItems', () => {
  const items = blogListItems()

  it('옮겨 온 글을 모두 담는다', () => {
    expect(items).toHaveLength(localPosts.length)
  })

  it('본문(content)을 넘기지 않는다', () => {
    for (const item of items) expect(item).not.toHaveProperty('content')
  })

  it('최신 글부터 놓는다', () => {
    const times = items.map(item => new Date(item.publishedAt).getTime())
    expect(times).toEqual([...times].sort((a, b) => b - a))
  })
})

describe('BlogListClient', () => {
  it('받은 목록을 곧바로 그린다 (불러오는 중 상태 없이)', () => {
    const items = blogListItems()
    render(<BlogListClient posts={items} />)
    expect(screen.getByText(items[0].title)).toBeInTheDocument()
    expect(screen.getByText(String(items.length))).toBeInTheDocument()
  })
})

describe('/blog 번들 경계', () => {
  const read = (file: string) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')

  it('목록 클라이언트는 blog-service·글 JSON 을 불러오지 않는다', () => {
    const client = read('_components/blog-list-client.tsx')
    expect(client).not.toMatch(/blog-service|blog-posts\.json/)
    // 타입만 가져오는 것은 빌드에서 지워진다 — 값 import 만 막는다
    expect(client).not.toMatch(/import (?!type )[^\n]*local-posts/)
  })

  it('페이지는 서버 컴포넌트다', () => {
    expect(read('page.tsx')).not.toMatch(/^'use client'/m)
  })
})

// Bugbot(#230): 목록이 서버에서 그려지면서 날짜도 서버(UTC)에서 먼저 찍힌다. 시간대를 정하지
// 않으면 15:00Z 로 저장된 글이 HTML 에서는 전날, 서울 브라우저에서는 다음 날로 바뀐다
describe('formatBlogDate', () => {
  it.each([
    ['ko', '2026년 1월 21일'],
    ['en', 'January 21, 2026'],
  ] as const)('%s: 서울 날짜로 찍는다 (실행 시간대와 무관)', (language, expected) => {
    expect(formatBlogDate('2026-01-20T15:00:00.000Z', language)).toBe(expected)
  })
})

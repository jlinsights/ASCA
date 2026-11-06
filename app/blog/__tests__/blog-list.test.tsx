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
let mockLanguage: 'ko' | 'en' | 'ja' | 'zh' = 'ko'
jest.mock('@/contexts/language-context', () => {
  // 실제 언어별 표로 찾는다 — 키가 빠지면 키 이름이 그대로 나와 테스트가 잡는다
  const { translations } = jest.requireActual('@/lib/i18n/translations')
  return {
    useLanguage: () => ({
      language: mockLanguage,
      t: (key: string) => translations[mockLanguage][key] || key,
    }),
  }
})

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
    ['ja', '2026年1月21日'],
    ['zh', '2026年1月21日'],
  ] as const)('%s: 서울 날짜로 찍는다 (실행 시간대와 무관)', (language, expected) => {
    expect(formatBlogDate('2026-01-20T15:00:00.000Z', language)).toBe(expected)
  })
})

// 회귀: 목록 화면 틀이 ko 가 아니면 모두 영어였고(ja·zh 도 영어), 채널 카드·읽기·이전/다음은 늘 한국어였다
describe('BlogListClient 화면 틀 번역', () => {
  const HANGUL = /[가-힣]/
  afterEach(() => {
    mockLanguage = 'ko'
  })

  it.each([
    ['en', 'Oriental Calligraphy Blog', 'KakaoTalk channel', 'Read', 'Next'],
    ['ja', '東洋書芸ブログ', 'カカオトーク チャンネル', '読む', '次へ'],
    ['zh', '東洋書藝部落格', 'KakaoTalk 頻道', '閱讀', '下一頁'],
  ])('%s: 제목·채널 카드·읽기·쪽 넘김', (lang, title, kakao, read, next) => {
    mockLanguage = lang as typeof mockLanguage
    render(<BlogListClient posts={blogListItems()} />)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: kakao })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: new RegExp(`^${read}`) }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: next })).toBeInTheDocument()
  })

  it.each(['en', 'ja', 'zh'] as const)('%s: 글 제목·요약·작성자·태그 말고는 한글이 없다', lang => {
    mockLanguage = lang
    const items = blogListItems()
    const { container } = render(<BlogListClient posts={items} />)
    let text = container.textContent ?? ''
    const data = items.flatMap(item => [
      item.title,
      item.summary,
      item.author,
      ...(item.tags ?? []),
    ])
    for (const value of data.filter(Boolean).sort((a, b) => b.length - a.length)) {
      text = text.replaceAll(value, '')
    }
    expect(text).not.toMatch(HANGUL)
    const { blogTranslations } = jest.requireActual('@/lib/i18n/translations/blog')
    // 글자 조각마다 본다 — textContent 를 이어 붙이면 'Tistory blog' + 'Read' 가 키 이름처럼 보인다
    const keys = new Set(Object.keys(blogTranslations.ko))
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      expect(keys.has((node.nodeValue ?? '').trim())).toBe(false)
    }
  })

  it('네 언어 표가 같은 키를 갖고 빈 값이 없다', () => {
    const { blogTranslations } = jest.requireActual('@/lib/i18n/translations/blog')
    const { greetingsTranslations } = jest.requireActual('@/lib/i18n/translations/greetings')
    for (const tables of [blogTranslations, greetingsTranslations]) {
      const keys = Object.keys(tables.ko).sort()
      for (const lang of ['en', 'ja', 'zh']) expect(Object.keys(tables[lang]).sort()).toEqual(keys)
      for (const table of Object.values(tables) as Record<string, string>[]) {
        for (const value of Object.values(table)) expect(value.trim()).not.toBe('')
      }
    }
  })
})

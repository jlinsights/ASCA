import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import CopyrightPolicyPage from '../copyright-policy/page'
import { metadata as searchMetadata } from '../search/layout'
import { metadata as privacyMetadata } from '../privacy-policy/layout'
import { metadata as copyrightMetadata } from '../copyright-policy/layout'
import { metadata as emailRefuseMetadata } from '../email-refuse/layout'
import { generateMetadata as currentGenerate } from '../exhibitions/current/page'
import { generateMetadata as upcomingGenerate } from '../exhibitions/upcoming/page'
import { generateMetadata as pastGenerate } from '../exhibitions/past/page'
import { generateMetadata as onlineGenerate } from '../exhibitions/online/page'
import sitemap from '../sitemap'

jest.mock('next/headers', () => ({ headers: async () => new Headers() }))
jest.mock('@/lib/supabase', () => ({ getSupabaseClient: () => null }))
jest.mock('@/lib/notices/notices-data', () => ({ listPublishedNotices: async () => [] }))
jest.mock('@/lib/events/events-data', () => ({ listPublishedEvents: async () => [] }))
jest.mock('@/components/layout/layout-footer', () => ({
  LayoutFooter: () => <footer />,
}))
jest.mock('@/components/layout/page-hero', () => ({
  PageHero: ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <header>
      <h1>{title}</h1>
      {children}
    </header>
  ),
  HeroFacts: () => null,
}))

const BASE = 'https://orientalcalligraphy.org'

let currentMetadata: Metadata
let upcomingMetadata: Metadata
let pastMetadata: Metadata
let onlineMetadata: Metadata
beforeAll(async () => {
  ;[currentMetadata, upcomingMetadata, pastMetadata, onlineMetadata] = await Promise.all(
    [currentGenerate, upcomingGenerate, pastGenerate, onlineGenerate].map(load => load())
  )
})
const APP = path.join(__dirname, '..')

describe('SEO 메타데이터 (2026-11-08 점검)', () => {
  it('저작권 정책 본문을 서버 HTML 에 싣는다 — 빈 "로딩 중" 화면이 아니다', () => {
    // 첫 렌더에 바로 본문이 있어야 한다. dynamic(ssr: false)였다면 첫 렌더는 로딩 화면이다
    const { container } = render(<CopyrightPolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: '저작권 정책' })).toBeInTheDocument()
    expect(container.textContent).not.toContain('로딩 중')
  })

  it('검색 결과 화면은 색인하지 않고 링크는 따라가게 둔다', () => {
    expect(searchMetadata.robots).toEqual({ index: false, follow: true })
  })

  it.each([
    ['/privacy-policy', () => privacyMetadata],
    ['/copyright-policy', () => copyrightMetadata],
    ['/email-refuse', () => emailRefuseMetadata],
    ['/exhibitions/current', () => currentMetadata],
    ['/exhibitions/upcoming', () => upcomingMetadata],
    ['/exhibitions/past', () => pastMetadata],
    ['/exhibitions/online', () => onlineMetadata],
  ])('%s 는 기본 제목 대신 자기 제목·설명·canonical 을 단다', (route, read) => {
    const meta = read()
    expect(meta.title).toMatch(/ \| 동양서예협회$/)
    expect(meta.title).not.toBe('ASCA | 사단법인 동양서예협회')
    expect(String(meta.description).length).toBeGreaterThanOrEqual(50)
    expect(meta.alternates?.canonical).toBe(route)
  })

  it('제목이 서로 겹치지 않는다', () => {
    const titles = [
      privacyMetadata,
      copyrightMetadata,
      emailRefuseMetadata,
      currentMetadata,
      upcomingMetadata,
      pastMetadata,
      onlineMetadata,
    ].map(m => m.title)
    expect(new Set(titles).size).toBe(titles.length)
  })

  // 사이트맵에 실은 고정 페이지는 모두 자기 주소를 canonical 로 단다.
  // 루트 레이아웃에 두면 하위 페이지가 홈 주소를 물려받으므로 페이지(또는 그 레이아웃)마다 단다
  it('사이트맵의 고정 페이지는 모두 자기 주소를 canonical 로 선언한다', async () => {
    const routes = (await sitemap())
      .map(entry => entry.url.replace(BASE, ''))
      .filter(route => route !== '' && fs.existsSync(path.join(APP, route, 'page.tsx')))
    expect(routes.length).toBeGreaterThan(30)
    const missing = routes.filter(route => {
      const files = ['page.tsx', 'layout.tsx']
        .map(file => path.join(APP, route, file))
        .filter(file => fs.existsSync(file))
        .map(file => fs.readFileSync(file, 'utf8'))
      return !files.some(
        src => src.includes(`canonical: '${route}'`) || /canonical: [A-Z_]/.test(src)
      )
    })
    expect(missing).toEqual([])
  })
})

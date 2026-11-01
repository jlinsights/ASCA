import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { BrandGuide } from '../_components/brand-guide'
import { HistoryHero } from '../../history/_components/history-hero'
import { HistoryTimeline } from '../../history/_components/history-timeline'

jest.mock('@/components/about/about-motion', () => ({ AboutMotion: () => null }))
jest.mock('@/components/about/about-nav', () => ({
  AboutNav: () => <nav data-testid='about-nav' />,
}))

class NoopObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

beforeAll(() => {
  Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: NoopObserver })
})

beforeEach(() => {
  window.localStorage.setItem('asca-language', 'ko')
})

afterEach(() => {
  window.localStorage.clear()
})

// 연혁·브랜드도 소개 묶음과 같은 틀(.ab 머리 + 큰 漢字 + 01–08 목차)을 쓴다
describe('소개 묶음 틀 — 연혁·브랜드', () => {
  it('브랜드: AboutHero 머리에 標識 글자와 소개 목차가 붙는다', async () => {
    const { container } = render(
      <LanguageProvider>
        <BrandGuide />
      </LanguageProvider>
    )
    expect(
      await screen.findByRole('heading', { level: 1, name: '브랜드 · 스타일 가이드' })
    ).toBeInTheDocument()
    expect(container.querySelector('.ab .ab-hero .ab-hero__mark')?.textContent).toContain('標識')
    expect(screen.getByTestId('about-nav')).toBeInTheDocument()
    expect(container.querySelector('.brand-hero')).toBeNull()
  })

  it('연혁: AboutHero 머리(沿革)와 연도별 장(年表)으로 그린다', async () => {
    const { container } = render(
      <LanguageProvider>
        <HistoryHero />
        <HistoryTimeline />
      </LanguageProvider>
    )
    expect(await screen.findByRole('heading', { level: 1, name: '연혁' })).toBeInTheDocument()
    expect(container.querySelector('.ab-hero__mark')?.textContent).toContain('沿革')
    expect(container.querySelector('#history-timeline.ab-chapter')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: '해마다의 기록' })).toBeInTheDocument()
  })
})

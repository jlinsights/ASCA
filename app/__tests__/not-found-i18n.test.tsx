import { render, screen } from '@testing-library/react'
import NotFound from '../not-found'

let mockLanguage = 'ko'
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
jest.mock('@/components/layout/layout-footer', () => ({
  LayoutFooter: () => <footer data-testid='site-footer' />,
}))

afterEach(() => {
  mockLanguage = 'ko'
})

// 404 화면은 언어 설정과 상관없이 한국어로만 나왔다(감사 2차 P2, WCAG 3.1.2)
describe('404 page language', () => {
  it('ko: 기존 한국어 문구를 그대로 쓴다', () => {
    render(<NotFound />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('페이지를 찾을 수 없습니다')
    expect(screen.getByRole('link', { name: '홈페이지로 이동' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: '검색하기' })).toHaveAttribute('href', '/search')
    expect(screen.getByRole('link', { name: '고객지원' })).toHaveAttribute('href', '/contact')
  })

  it.each([
    ['en', 'Page not found', 'Go to home page', 'Search', 'contact support'],
    ['ja', 'ページが見つかりません', 'ホームへ戻る', '検索する', 'サポート'],
    ['zh', '找不到頁面', '返回首頁', '搜尋', '客服'],
  ])('%s: 제목·단추·문의 링크를 그 언어로 쓴다', (lang, heading, home, search, support) => {
    mockLanguage = lang
    render(<NotFound />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(heading)
    expect(screen.getByRole('link', { name: home })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: search })).toHaveAttribute('href', '/search')
    expect(screen.getByRole('link', { name: support })).toHaveAttribute('href', '/contact')
    expect(document.body.textContent).not.toMatch(/[가-힣]/)
    expect(document.body.textContent).not.toMatch(/notFound/)
  })
})

import { render, screen } from '@testing-library/react'
import GreetingsPage from '../page'

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
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/components/about/about-nav', () => ({ AboutNav: () => null }))
jest.mock('@/components/about/about-motion', () => ({ AboutMotion: () => null }))
jest.mock('next/navigation', () => ({ usePathname: () => '/greetings' }))

afterEach(() => {
  mockLanguage = 'ko'
})

// 회귀: 영어로 바꿔도 머리·장 제목이 한국어였고, 편지는 늘 한국어 탭으로 열렸다
describe('/greetings', () => {
  it.each([
    ['ko', '인사말씀', '이사장 인사말씀', '한국어', /존경하는 사단법인/],
    ['en', 'Greetings', "The Chairman's greeting", 'English', /^Dear Members/],
    ['ja', 'ご挨拶', '理事長ご挨拶', '日本語', /^敬愛する/],
    ['zh', '致辭', '理事長致辭', '中文', /^敬愛的/],
  ])(
    '%s: 머리·장 제목을 고른 언어로, 편지도 그 언어 탭으로 연다',
    (lang, title, chapter, tab, letter) => {
      mockLanguage = lang as typeof mockLanguage
      render(<GreetingsPage />)
      expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: chapter })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true')
      const shown = document.querySelector('[role="tabpanel"]:not([hidden]) .ab-letter p')
      expect(shown?.textContent).toMatch(letter)
    }
  )

  it('en: 머리·장 글자에 한글이 남지 않는다(편지 탭 이름 한국어 제외)', () => {
    mockLanguage = 'en'
    render(<GreetingsPage />)
    const chrome = [
      ...document.querySelectorAll('.ab-hero, .ab-chapter__eyebrow, .ab-chapter__title'),
    ]
      .map(el => el.textContent)
      .join(' ')
    expect(chrome).not.toMatch(/[가-힣]/)
  })
})

import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { SkipLink } from '../skip-link'

afterEach(() => {
  window.localStorage.clear()
})

// 회귀: 키보드·스크린리더 사용자가 처음 만나는 '본문으로 건너뛰기' 가 모든 언어에서 한국어였다.
describe('SkipLink', () => {
  it.each([
    ['ko', '본문으로 건너뛰기'],
    ['en', 'Skip to main content'],
    ['ja', '本文へスキップ'],
    ['zh', '跳至主要內容'],
  ])('%s', async (lang, label) => {
    window.localStorage.setItem('asca-language', lang)
    render(
      <LanguageProvider>
        <SkipLink />
      </LanguageProvider>
    )
    expect(await screen.findByRole('link', { name: label })).toHaveAttribute(
      'href',
      '#main-content'
    )
  })
})

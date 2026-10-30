import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { IntroductionsHero } from '../_components/introductions-hero'
import { IntroductionsTabs } from '../_components/introductions-tabs'

function renderPage(lang: string) {
  window.localStorage.setItem('asca-language', lang)
  return render(
    <LanguageProvider>
      <IntroductionsHero />
      <IntroductionsTabs />
    </LanguageProvider>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('소개 페이지 — 번역', () => {
  it('ko: 한국어 협회 소개가 원문으로 열린다', async () => {
    renderPage('ko')
    expect(await screen.findByRole('heading', { level: 1, name: '소개' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '협회 소개' })).toBeInTheDocument()
    expect(screen.getByText(/人書俱老, 글씨와 사람이 함께 깊어집니다/)).toBeInTheDocument()
    expect(screen.queryByText(/원문/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /협회 소개 브로셔/ })).toBeInTheDocument()
  })

  // 회귀: 탭 기본값이 항상 '한국어' 라 영어 사용자도 한국어 소개를 먼저 봤다.
  it.each([
    ['en', 'English', 'About ASCA', 'Translated from the Korean original'],
    ['ja', '日本語', '協会について', '韓国語原文からの翻訳'],
    ['zh', '中文', '關於本會', '譯自韓文原文'],
  ])('%s: 번역본 탭이 열리고 번역임을 밝힌다', async (lang, tab, heading, note) => {
    renderPage(lang)
    expect(await screen.findByRole('heading', { name: heading })).toBeVisible()
    expect(screen.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(new RegExp(note))).toBeInTheDocument()
  })
})

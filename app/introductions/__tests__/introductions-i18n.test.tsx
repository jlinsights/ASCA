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
  it('ko: 기존 문구와 한국어 인사말이 그대로다', async () => {
    renderPage('ko')
    expect(await screen.findByRole('heading', { level: 1, name: '소 개' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '이사장 인사말' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /협회 소개 브로셔/ })).toBeInTheDocument()
  })

  // 회귀: 탭 기본값이 항상 '한국어' 라 영어 사용자도 한국어 인사말을 먼저 봤다.
  it('en: 영어 인사말 탭이 기본으로 열린다', async () => {
    renderPage('en')
    expect(await screen.findByRole('heading', { name: 'Message from the Chairman' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'English' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('link', { name: /ASCA Brochure \(Korean\)/ })).toBeInTheDocument()
  })

  it.each([
    ['ja', '日本語', '理事長あいさつ', '韓国語原文からの翻訳'],
    ['zh', '中文', '理事長致辭', '譯自韓文原文'],
  ])('%s: 번역본 탭이 열리고 번역임을 밝힌다', async (lang, tab, heading, note) => {
    renderPage(lang)
    expect(await screen.findByRole('heading', { name: heading })).toBeVisible()
    expect(screen.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(new RegExp(note))).toBeInTheDocument()
  })
})

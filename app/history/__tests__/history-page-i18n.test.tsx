import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { HistoryHero } from '../_components/history-hero'
import { HistoryTimeline } from '../_components/history-timeline'

const HANGUL = /[가-힣]/

function renderPage(lang: string) {
  window.localStorage.setItem('asca-language', lang)
  return render(
    <LanguageProvider>
      <HistoryHero />
      <HistoryTimeline />
    </LanguageProvider>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('연혁 페이지 — 번역', () => {
  it('ko: 기존 한국어 그대로다', async () => {
    renderPage('ko')
    expect(await screen.findByRole('heading', { level: 1, name: '연혁' })).toBeInTheDocument()
    expect(screen.getAllByText('2025 임시총회').length).toBeGreaterThan(0)
  })

  it.each(['en', 'ja', 'zh'])('%s: 화면에 한글이 남지 않는다', async lang => {
    const { container } = renderPage(lang)
    await screen.findByRole('heading', { level: 1, name: /History|沿革/ })
    const text = container.textContent ?? ''
    expect(text.length).toBeGreaterThan(1000)
    expect(text.match(new RegExp(HANGUL.source + '.{0,20}', 'g')) ?? []).toStrictEqual([])
  })

  it('en: 행사 종류·날짜·장소가 영어로 바뀐다', async () => {
    renderPage('en')
    expect(await screen.findByText('2025 Extraordinary General Meeting')).toBeInTheDocument()
    expect(screen.getByText('Nov 27, 2025 (Sat) 1–7 PM')).toBeInTheDocument()
    expect(screen.getAllByText('Exhibition').length).toBeGreaterThan(0)
  })
})

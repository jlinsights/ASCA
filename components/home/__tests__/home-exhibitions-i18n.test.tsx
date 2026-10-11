import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { historyEvents } from '@/app/history/_data/history-events'
import { getRecentExhibitions } from '../home-data'
import { HomeExhibitions } from '../home-exhibitions'

function renderSection(lang: string) {
  window.localStorage.setItem('asca-language', lang)
  return render(
    <LanguageProvider>
      <HomeExhibitions exhibitions={getRecentExhibitions(historyEvents, 4)} />
    </LanguageProvider>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

// 회귀: 홈 '최근 전시' 의 날짜·장소가 언어와 무관하게 한국어로 나왔다.
describe('HomeExhibitions — 날짜·장소 번역', () => {
  it('ko: 원문 그대로다', async () => {
    renderSection('ko')
    expect(await screen.findByText(/2025년 6월 18일/)).toBeInTheDocument()
  })

  it('en: 날짜·장소에 한글이 없다', async () => {
    const { container } = renderSection('en')
    expect(await screen.findByText(/Jun 18, 2025 \(Wed\) – Jun 24 \(Tue\)/)).toBeInTheDocument()
    expect(container.querySelectorAll('.asca-ex').length).toBe(4)
    expect(container.textContent).not.toMatch(/[가-힣]/)
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { TAIWAN_TRIP_FLIPBOOK_URL, TaiwanTripFlipbook } from '../taiwan-trip-flipbook'

function renderFlipbook(lang = 'ko') {
  window.localStorage.setItem('asca-language', lang)
  return render(
    <LanguageProvider>
      <TaiwanTripFlipbook />
    </LanguageProvider>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('TaiwanTripFlipbook', () => {
  it('대만 서예·문화 기행 안내서를 제목 있는 iframe 으로 싣는다', async () => {
    renderFlipbook()
    expect(
      await screen.findByRole('heading', { level: 2, name: '대만 서예·문화 기행' })
    ).toBeInTheDocument()
    expect(screen.getByText(/2027년 4월 7일/)).toBeInTheDocument()
    const frame = screen.getByTitle('대만 서예·문화 기행 안내서 플립북')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute('src', TAIWAN_TRIP_FLIPBOOK_URL)
    expect(TAIWAN_TRIP_FLIPBOOK_URL).toBe('https://online.fliphtml5.com/orientalcalligraphy/alvf/')
  })

  it('새 창 링크는 같은 안내서를 연다', async () => {
    renderFlipbook()
    const link = await screen.findByRole('link', { name: /새 창에서 크게 보기/ })
    expect(link).toHaveAttribute('href', TAIWAN_TRIP_FLIPBOOK_URL)
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it.each(['en', 'ja', 'zh'])('%s: 한글이 남지 않는다', async lang => {
    const { container } = renderFlipbook(lang)
    await waitFor(() => expect(container.textContent).not.toMatch(/[가-힣]/))
  })
})

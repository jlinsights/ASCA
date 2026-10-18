import { render, screen, waitFor } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { CONTEST_FLIPBOOK_URL, ContestFlipbook } from '../contest-flipbook'

function renderFlipbook(lang = 'ko') {
  window.localStorage.setItem('asca-language', lang)
  return render(
    <LanguageProvider>
      <ContestFlipbook />
    </LanguageProvider>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('ContestFlipbook', () => {
  it('제23회 공모 요강 플립북을 제목 있는 iframe 으로 싣는다', async () => {
    renderFlipbook()
    expect(
      await screen.findByRole('heading', { level: 2, name: '제23회 대한민국 동양서예대전' })
    ).toBeInTheDocument()
    const frame = screen.getByTitle('제23회 대한민국 동양서예대전 공모 요강 플립북')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute('src', CONTEST_FLIPBOOK_URL)
    expect(frame).toHaveAttribute('allowfullscreen')
  })

  it('새 창 링크는 같은 플립북을 안전하게 연다', async () => {
    renderFlipbook()
    const link = await screen.findByRole('link', { name: /새 창에서 크게 보기/ })
    expect(link).toHaveAttribute('href', CONTEST_FLIPBOOK_URL)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it.each(['en', 'ja', 'zh'])('%s: 한글이 남지 않는다', async lang => {
    const { container } = renderFlipbook(lang)
    await waitFor(() => expect(container.textContent).not.toMatch(/[가-힣]/))
  })
})

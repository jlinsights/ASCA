import { render, screen, waitFor } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import {
  SEOKYEONG_CATALOG_FLIPBOOK_URL,
  SeokyeongCatalogFlipbook,
} from '../seokyeong-catalog-flipbook'
import { setTestLanguage } from '@/lib/i18n/testing'

function renderFlipbook(lang = 'ko') {
  setTestLanguage(lang)
  return render(
    <LanguageProvider>
      <SeokyeongCatalogFlipbook />
    </LanguageProvider>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('SeokyeongCatalogFlipbook', () => {
  it('서경(書境) 도록을 제목 있는 iframe 으로 싣는다', async () => {
    renderFlipbook()
    expect(
      await screen.findByRole('heading', { level: 2, name: /서경\(書境\) 새로운 지평/ })
    ).toBeInTheDocument()
    const frame = screen.getByTitle('서경(書境) 새로운 지평 전시 도록 플립북')
    expect(frame.tagName).toBe('IFRAME')
    expect(frame).toHaveAttribute('src', SEOKYEONG_CATALOG_FLIPBOOK_URL)
    expect(SEOKYEONG_CATALOG_FLIPBOOK_URL).toBe(
      'https://online.fliphtml5.com/orientalcalligraphy/kosm/'
    )
  })

  it('새 창 링크는 같은 도록을 연다', async () => {
    renderFlipbook()
    const link = await screen.findByRole('link', { name: /새 창에서 크게 보기/ })
    expect(link).toHaveAttribute('href', SEOKYEONG_CATALOG_FLIPBOOK_URL)
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it.each(['en', 'ja', 'zh'])('%s: 한글이 남지 않는다', async lang => {
    const { container } = renderFlipbook(lang)
    await waitFor(() => expect(container.textContent).not.toMatch(/[가-힣]/))
  })
})

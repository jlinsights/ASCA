import { fireEvent, render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { LayoutFooter } from '../layout-footer'

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

function setViewport(desktop: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: desktop,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  })
}

function renderFooter() {
  window.localStorage.setItem('asca-language', 'ko')
  return render(
    <LanguageProvider>
      <LayoutFooter />
    </LanguageProvider>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

// 푸터가 헤더 메뉴 전부(46개 링크)를 실어 모바일에서 3,300px 가까이 길어졌다 (2026-11-05)
describe('LayoutFooter — 모바일 접이식 메뉴', () => {
  it('모바일: 묶음 제목이 접힌 단추이고 누르면 그 묶음만 펼친다', async () => {
    setViewport(false)
    renderFooter()
    const about = await screen.findByRole('button', { name: '소개' })
    const news = screen.getByRole('button', { name: '소식' })
    expect(about).toHaveAttribute('aria-expanded', 'false')
    const list = document.getElementById(about.getAttribute('aria-controls') ?? '')
    expect(list).toHaveClass('hidden')

    fireEvent.click(about)
    expect(about).toHaveAttribute('aria-expanded', 'true')
    expect(list).not.toHaveClass('hidden')
    expect(news).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(about)
    expect(about).toHaveAttribute('aria-expanded', 'false')
  })

  it('모바일: 제목은 여전히 제목(h2)이라 제목 목록으로 찾을 수 있다', async () => {
    setViewport(false)
    renderFooter()
    expect(await screen.findByRole('heading', { level: 2, name: '정관·규정' })).toBeInTheDocument()
  })

  it('데스크톱: 단추 없이 모든 묶음이 펼쳐져 있다', async () => {
    setViewport(true)
    renderFooter()
    expect(await screen.findByRole('heading', { level: 2, name: '소개' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '소개' })).not.toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: '푸터 메뉴' })
    expect(nav.querySelectorAll('ul.hidden')).toHaveLength(0)
  })
})

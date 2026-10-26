import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/contexts/language-context'
import { Header } from '../header'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
jest.mock('../header-auth-section', () => ({ HeaderAuthSection: () => null }))
jest.mock('../header-mobile-auth', () => ({ HeaderMobileAuth: () => null }))
jest.mock('../../theme-toggle', () => ({ ThemeToggle: () => null }))
jest.mock('../../brand/logo', () => ({ Logo: () => null }))

function renderHeader() {
  return render(
    <LanguageProvider>
      <Header transparentOnTop />
    </LanguageProvider>
  )
}

describe('Header — 데스크톱 언어 선택기', () => {
  beforeEach(() => {
    window.localStorage.setItem('asca-language', 'ko')
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  // 회귀: LanguageSelector 를 import 만 하고 렌더하지 않아 데스크톱에서 언어를 바꿀 길이 없었다.
  it('데스크톱 컨트롤 영역에 언어 선택기가 있다', () => {
    renderHeader()
    const controls = screen.getByTestId('header-desktop-controls')
    expect(
      within(controls).getByRole('button', { name: /Current language: 한국어/ })
    ).toBeInTheDocument()
  })

  it('4개 언어를 고를 수 있고, 고르면 저장된다', async () => {
    const user = userEvent.setup()
    renderHeader()
    const controls = screen.getByTestId('header-desktop-controls')
    await user.click(within(controls).getByRole('button', { name: /Current language/ }))

    const options = within(controls).getAllByRole('option')
    expect(options).toHaveLength(4)

    await user.click(within(controls).getByRole('button', { name: 'Select English language' }))
    expect(window.localStorage.getItem('asca-language')).toBe('en')
    expect(
      await within(controls).findByRole('button', { name: /Current language: English/ })
    ).toBeInTheDocument()
  })
})

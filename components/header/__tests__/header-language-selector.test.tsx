import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/contexts/language-context'
import { Header } from '../header'
import { setTestLanguage } from '@/lib/i18n/testing'
import { navigateTo } from '@/lib/i18n/navigate'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
jest.mock('@/lib/i18n/navigate', () => ({ navigateTo: jest.fn() }))
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
    setTestLanguage('ko')
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

  it('4개 언어를 고를 수 있고, 고르면 저장하고 그 언어 주소로 간다', async () => {
    const user = userEvent.setup()
    renderHeader()
    const controls = screen.getByTestId('header-desktop-controls')
    await user.click(within(controls).getByRole('button', { name: /Current language/ }))

    const options = within(controls).getAllByRole('option')
    expect(options).toHaveLength(4)

    await user.click(within(controls).getByRole('button', { name: 'Select English language' }))
    // 언어는 주소가 정한다 — 홈(/)에서 영어를 고르면 쿠키에 저장하고 /en 으로 전체 이동한다
    expect(document.cookie).toMatch(/(?:^|; )asca-lang=en/)
    expect(navigateTo).toHaveBeenCalledWith('/en')
  })

  // 첫 방문 홈 자동 판단은 쿠키가 없을 때만 돈다 — 지금 언어(한국어)를 눌러도 선택으로 남긴다
  it('지금 언어를 다시 고르면 이동 없이 저장하고 메뉴를 닫는다', async () => {
    jest.mocked(navigateTo).mockClear()
    const user = userEvent.setup()
    renderHeader()
    const controls = screen.getByTestId('header-desktop-controls')
    await user.click(within(controls).getByRole('button', { name: /Current language/ }))
    await user.click(within(controls).getByRole('button', { name: 'Select 한국어 language' }))
    expect(document.cookie).toMatch(/(?:^|; )asca-lang=ko/)
    expect(navigateTo).not.toHaveBeenCalled()
    expect(within(controls).queryAllByRole('option')).toHaveLength(0)
  })
})

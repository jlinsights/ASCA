import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/contexts/language-context'
import { Header } from '../header'
import { HeaderAuthSection } from '../header-auth-section'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
jest.mock('../header-mobile-auth', () => ({ HeaderMobileAuth: () => null }))
jest.mock('../../theme-toggle', () => ({ ThemeToggle: () => null }))
jest.mock('../../brand/logo', () => ({ Logo: () => null }))
jest.mock('@/components/auth/session-provider', () => ({
  useAccount: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
    error: false,
    signOut: jest.fn(),
    refresh: jest.fn(),
  }),
}))

function renderWithLanguage(lang: string, ui: React.ReactElement) {
  window.localStorage.setItem('asca-language', lang)
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

afterEach(() => {
  window.localStorage.clear()
})

describe('Header — 메뉴 번역', () => {
  it('ko: 기존 한국어 메뉴가 그대로다', async () => {
    renderWithLanguage('ko', <Header transparentOnTop />)
    const nav = screen.getByRole('navigation', { name: '주 메뉴' })
    expect(await within(nav).findByRole('link', { name: /^작가/ })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: '검색' })).toBeInTheDocument()
    expect(within(nav).getByRole('menuitem', { name: '임원' })).toHaveAttribute(
      'href',
      '/board-members'
    )
  })

  it('en: 메뉴·하위 메뉴·검색이 영어로 바뀐다', async () => {
    renderWithLanguage('en', <Header transparentOnTop />)
    const nav = await screen.findByRole('navigation', { name: 'Main navigation' })
    for (const name of ['About', 'Exhibitions & Contests', 'Artists & Artworks', 'News']) {
      expect(within(nav).getByRole('link', { name: new RegExp(`^${name}`) })).toBeInTheDocument()
    }
    expect(within(nav).getByRole('menuitem', { name: 'Artworks' })).toHaveAttribute(
      'href',
      '/artworks'
    )
    expect(within(nav).getByRole('menuitem', { name: 'Current' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Search' })).toBeInTheDocument()
    // 링크 주소(쿼리값)는 언어와 무관하게 그대로다 — /artists 필터 파라미터 이름을 쓴다
    expect(within(nav).getByRole('menuitem', { name: 'Invited Artists' })).toHaveAttribute(
      'href',
      `/artists?membershipType=${encodeURIComponent('초대작가')}`
    )
  })

  it('전시·공모 드롭다운은 전시·공모 두 칸에 하위 메뉴를 나눠 담는다', async () => {
    renderWithLanguage('ko', <Header transparentOnTop />)
    const nav = await screen.findByRole('navigation', { name: '주 메뉴' })
    const menu = within(nav).getByRole('menu', { name: '전시·공모 하위 메뉴' })
    const exhibitions = within(menu).getByRole('group', { name: '전시' })
    const contests = within(menu).getByRole('group', { name: '공모' })
    expect(within(exhibitions).getByRole('menuitem', { name: '현재 전시' })).toHaveAttribute(
      'href',
      '/exhibitions/current'
    )
    expect(within(contests).getByRole('menuitem', { name: '출품원서' })).toHaveAttribute(
      'href',
      '/application'
    )
    expect(within(exhibitions).queryByRole('menuitem', { name: '출품원서' })).toBeNull()
  })

  it('ja: 로그인·회원가입 버튼이 일본어로 바뀐다', async () => {
    renderWithLanguage('ja', <HeaderAuthSection />)
    expect(await screen.findByRole('link', { name: 'ログイン' })).toHaveAttribute(
      'href',
      '/sign-in'
    )
    expect(screen.getByRole('link', { name: '会員登録' })).toHaveAttribute('href', '/sign-up')
  })

  // 회귀: 실제로 쓰이는 header.tsx 의 모바일 메뉴에는 언어 선택기가 없었다.
  it('모바일 메뉴에 언어 선택기가 있다', async () => {
    const user = userEvent.setup()
    renderWithLanguage('zh', <Header transparentOnTop />)
    await user.click(await screen.findByRole('button', { name: '打開菜單' }))
    const mobileNav = screen.getByRole('navigation', { name: '移動菜單' })
    expect(
      within(mobileNav).getByRole('button', { name: /Current language: 中文/ })
    ).toBeInTheDocument()
  })
})

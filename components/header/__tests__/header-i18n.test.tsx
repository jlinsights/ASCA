import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/contexts/language-context'
import { Header } from '../header'
import { HeaderAuthSection } from '../header-auth-section'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
jest.mock('../header-mobile-auth', () => ({ HeaderMobileAuth: () => null }))
jest.mock('../../theme-toggle', () => ({ ThemeToggle: () => null }))
jest.mock('../../theme-transition', () => ({ ThemeTransition: () => null }))
jest.mock('../../brand/logo', () => ({ Logo: () => null }))
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
  useClerk: () => ({ signOut: jest.fn() }),
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
  })

  it('en: 메뉴·하위 메뉴·검색이 영어로 바뀐다', async () => {
    renderWithLanguage('en', <Header transparentOnTop />)
    const nav = await screen.findByRole('navigation', { name: 'Main navigation' })
    for (const name of ['Artists', 'Artworks', 'Exhibitions', 'Competitions', 'Gallery']) {
      expect(within(nav).getByRole('link', { name: new RegExp(`^${name}`) })).toBeInTheDocument()
    }
    expect(within(nav).getByRole('menuitem', { name: 'Current' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Search' })).toBeInTheDocument()
    // 링크 주소(쿼리값)는 언어와 무관하게 그대로다
    expect(within(nav).getByRole('menuitem', { name: 'Ink Painting' })).toHaveAttribute(
      'href',
      '/artworks?category=수묵화'
    )
  })

  it('ja: 로그인·회원가입 버튼이 일본어로 바뀐다', async () => {
    renderWithLanguage('ja', <HeaderAuthSection />)
    expect(await screen.findByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '会員登録' })).toBeInTheDocument()
  })

  // 회귀: 실제로 쓰이는 header.tsx 의 모바일 메뉴에는 언어 선택기가 없었다.
  it('모바일 메뉴에 언어 선택기가 있다', async () => {
    const user = userEvent.setup()
    renderWithLanguage('zh', <Header transparentOnTop />)
    await user.click(await screen.findByRole('button', { name: '打开菜单' }))
    const mobileNav = screen.getByRole('navigation', { name: '移动菜单' })
    expect(
      within(mobileNav).getByRole('button', { name: /Current language: 中文/ })
    ).toBeInTheDocument()
  })
})

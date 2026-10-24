import { existsSync } from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import { AdminNavigation } from '../admin-navigation'
import { ADMIN_HOME, ADMIN_NAV_ITEMS } from '../admin-nav-items'

jest.mock('next/navigation', () => ({ usePathname: () => '/admin/artists' }))
jest.mock('@/contexts/language-context', () => ({ useLanguage: () => ({ language: 'ko' }) }))

const pageFileFor = (href: string) => path.join(process.cwd(), 'app', href, 'page.tsx')

// 회귀: 관리자 메뉴 9개 중 8개가 없는 페이지(공지·전시·행사·파일·작품·마이그레이션·동기화, /admin)로 가 404 였다
describe('관리자 메뉴', () => {
  it.each(ADMIN_NAV_ITEMS.map(item => [item.href]))('%s 에 실제 페이지가 있다', href => {
    expect(existsSync(pageFileFor(href))).toBe(true)
  })

  it('/admin 첫 화면도 페이지가 있고, 메뉴의 실제 페이지로 보낸다', () => {
    expect(existsSync(pageFileFor('/admin'))).toBe(true)
    expect(ADMIN_NAV_ITEMS.map(item => item.href)).toContain(ADMIN_HOME)
  })

  it('화면에 그리는 /admin 링크는 모두 실제 페이지로 간다', () => {
    render(<AdminNavigation />)
    const adminLinks = screen
      .getAllByRole('link')
      .map(link => link.getAttribute('href') ?? '')
      .filter(href => href.startsWith('/admin'))
    expect(adminLinks.length).toBeGreaterThan(0)
    for (const href of adminLinks) expect(existsSync(pageFileFor(href))).toBe(true)
    expect(screen.getByRole('link', { name: /작가 회비 관리/ })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })
})

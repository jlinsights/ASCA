import { render, screen, within } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import BusinessPlanPage from '../page'

jest.mock('next/navigation', () => ({ usePathname: () => '/business-plan' }))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))

describe('사업계획 — 바로 가기', () => {
  it('사업계획서 장 옆에 문서·서식·연혁·임원·유관단체·정관 바로 가기가 있다', () => {
    render(
      <LanguageProvider>
        <BusinessPlanPage />
      </LanguageProvider>
    )
    const list = screen.getByRole('list', { name: '바로 가기' })
    expect(
      within(list)
        .getAllByRole('link')
        .map(link => [link.textContent?.replace('→', '').trim(), link.getAttribute('href')])
    ).toEqual([
      ['문서·서식', '/forms'],
      ['연혁', '/history'],
      ['임원', '/board-members'],
      ['유관단체', '/partners'],
      ['정관', '/regulations'],
    ])
  })
})

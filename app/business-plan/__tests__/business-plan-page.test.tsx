import { render, screen, within } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import BusinessPlanPage from '../page'

jest.mock('next/navigation', () => ({ usePathname: () => '/business-plan' }))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))

describe('사업계획 — 2027년도', () => {
  it('2027년도 계획과 공모요강의 확정 일정을 싣고, 지난 2025년 계획은 내린다', () => {
    render(
      <LanguageProvider>
        <BusinessPlanPage />
      </LanguageProvider>
    )
    expect(screen.getByRole('heading', { name: '2027년도 사업계획' })).toBeInTheDocument()
    expect(screen.getByText('느리게 쓰고, 깊게 보고, 오래 남긴다.')).toBeInTheDocument()
    // 일정은 contest-23-data 에서 온다 — 출품 마감과 전시 기간
    expect(screen.getByText(/2027년 1월 31일/)).toBeInTheDocument()
    expect(screen.getByText(/2027년 4월 21일/)).toBeInTheDocument()
    expect(screen.queryByText(/2025년도 사업계획서/)).toBeNull()
    expect(screen.queryByText(/NFT/)).toBeNull()
  })
})

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

import { render, screen } from '@testing-library/react'
import NotFound from '../not-found'
import PrivacyPolicyPage from '../privacy-policy/page'
import EmailRefusePage from '../email-refuse/page'
import CopyrightPolicyContent from '../copyright-policy/content'

jest.mock('@/components/layout/layout-footer', () => ({
  LayoutFooter: () => <footer data-testid='site-footer' />,
}))
jest.mock('@/components/layout/page-hero', () => ({
  PageHero: ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <header>
      <h1>{title}</h1>
      {children}
    </header>
  ),
  HeroFacts: () => null,
}))

describe('404 page', () => {
  it('ends with the site footer so a visitor can leave by more than the header', () => {
    render(<NotFound />)
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
  })
})

// 약관 페이지는 ASCA 의 장부·낙관 문법을 따르고, 색 띠를 단 '옆 탭' 카드를 쓰지 않는다.
describe.each([
  ['privacy-policy', PrivacyPolicyPage],
  ['email-refuse', EmailRefusePage],
  ['copyright-policy', CopyrightPolicyContent],
])('%s', (_name, Page) => {
  it('has no coloured side-tab borders', () => {
    const { container } = render(<Page />)
    expect(container.querySelectorAll('[class*="border-l-4"]')).toHaveLength(0)
  })
})

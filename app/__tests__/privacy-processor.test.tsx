import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage from '../privacy-policy/page'

jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/components/layout/page-hero', () => ({
  PageHero: ({ title }: { title: string }) => <h1>{title}</h1>,
  HeroFacts: () => null,
}))

// 신규 가입을 도너스로 보내므로(/api/cron/donus-signups) 처리방침에 수탁자로 공개한다(개인정보보호법 제26조)
describe('privacy policy — processing entrustment', () => {
  it('names Donus as the processor in article 9, between articles 8 and 10', () => {
    render(<PrivacyPolicyPage />)
    const headings = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent ?? '')
    const at = (prefix: string) => headings.findIndex(h => h.startsWith(prefix))
    expect(at('제9조 개인정보 처리업무의 위탁')).toBeGreaterThan(at('제8조'))
    expect(at('제9조')).toBeLessThan(at('제10조'))
    expect(screen.getByText(/수탁자: 도너스\(Donus/)).toBeInTheDocument()
  })
})

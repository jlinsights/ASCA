import { render, screen } from '@testing-library/react'
import ApplicationPage from '../page'

jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/components/apply/tally-embed', () => ({ TallyEmbed: () => null }))
jest.mock('@/components/contests/contest-flipbook', () => ({
  CONTEST_FLIPBOOK_URL: 'https://online.fliphtml5.com/orientalcalligraphy/ulsw/',
  ContestFlipbook: () => null,
}))

describe('출품원서 페이지 — 공모요강 플립북 안내', () => {
  it('양식이 플립북 5~7쪽에 있고 내려받기·인쇄할 수 있다고 알리고, 플립북으로 보낸다', () => {
    render(<ApplicationPage />)
    expect(
      screen.getByText(/공모요강 플립북에서도 출품원서를 받을 수 있습니다/)
    ).toBeInTheDocument()
    expect(screen.getByText('5~7쪽')).toBeInTheDocument()
    expect(screen.getByText(/다운로드·인쇄 기능으로 내려받거나 바로 인쇄/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '아래에서 공모요강 보기' })).toHaveAttribute(
      'href',
      '#guide'
    )
    const external = screen.getByRole('link', { name: /새 창에서 플립북 열기/ })
    expect(external).toHaveAttribute(
      'href',
      'https://online.fliphtml5.com/orientalcalligraphy/ulsw/'
    )
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

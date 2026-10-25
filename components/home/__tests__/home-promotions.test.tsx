import { render, screen } from '@testing-library/react'
import { HomePromotions } from '../home-promotions'

jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ language: 'ko', t: (key: string) => key }),
}))

describe('홈 주요 소식', () => {
  afterEach(() => jest.useRealTimers())

  // 요청: 히어로 주요 소식에 2027 캘린더 증정 행사가 없었다
  it('신청 기간에는 캘린더 행사를 맨 앞에 둔다', () => {
    jest.useFakeTimers({ now: new Date('2026-10-25T12:00:00+09:00') })
    render(<HomePromotions />)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/events/calendar-2027')
    expect(links[0]).toHaveTextContent('calendarFlipbookTitle')
    expect(links).toHaveLength(3)
  })

  it('신청 마감 뒤에는 내린다', () => {
    jest.useFakeTimers({ now: new Date('2026-12-15T18:00:00+09:00') })
    render(<HomePromotions />)
    const hrefs = screen.getAllByRole('link').map(link => link.getAttribute('href'))
    expect(hrefs).not.toContain('/events/calendar-2027')
    expect(hrefs).toHaveLength(2)
  })
})

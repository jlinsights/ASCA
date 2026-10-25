import { render, screen, within } from '@testing-library/react'
import Calendar2027Page from '../page'
import {
  CALENDAR_2027,
  GIFT_TIERS,
  WAYS,
  isCalendarEventOpen,
} from '../_components/calendar-2027-data'

jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/components/events/calendar-flipbook', () => ({ CalendarFlipbook: () => null }))

describe('2027 캘린더 증정 행사 페이지', () => {
  beforeEach(() => render(<Calendar2027Page />))

  it('신청 기간을 요일과 함께 보여 준다', () => {
    expect(screen.getByText('10월 25일(일) – 12월 15일(화) 18:00')).toBeInTheDocument()
  })

  it('참여 방법 네 가지가 각 안내 페이지로 이어진다', () => {
    for (const way of WAYS) {
      expect(screen.getByRole('link', { name: `${way.linkLabel} →` })).toHaveAttribute(
        'href',
        way.href
      )
    }
  })

  it('증정 기준 표에 모든 등급이 있다', () => {
    const table = screen.getByRole('table', { name: '캘린더 증정 기준' })
    for (const tier of GIFT_TIERS) {
      expect(within(table).getByText(tier.tier)).toBeInTheDocument()
    }
  })

  it('신청서와 납부는 새 창으로 연다', () => {
    const forms = screen.getAllByRole('link', { name: /신청서 작성하기/ })
    expect(forms[0]).toHaveAttribute('href', CALENDAR_2027.formUrl)
    expect(forms[0]).toHaveAttribute('target', '_blank')
    expect(screen.getAllByRole('link', { name: /온라인 납부/ })[0]).toHaveAttribute(
      'href',
      CALENDAR_2027.payUrl
    )
  })

  it('목차의 모든 항목이 페이지 안 구역을 가리킨다', () => {
    const toc = screen
      .getAllByRole('link')
      .filter(link => link.getAttribute('href')?.startsWith('#'))
    expect(toc.length).toBe(5)
    for (const link of toc) {
      expect(document.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull()
    }
  })
})

describe('isCalendarEventOpen', () => {
  it('신청 마감 시각(KST)까지만 연다', () => {
    expect(isCalendarEventOpen(new Date('2026-12-15T17:59:00+09:00'))).toBe(true)
    expect(isCalendarEventOpen(new Date('2026-12-15T18:00:00+09:00'))).toBe(false)
  })
})

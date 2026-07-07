/**
 * MonthView 오늘 하이라이트 테스트 — asca-gallery-cultural-bugfix F-2
 *
 * isToday 판정이 클라이언트 마운트 후(useEffect)에 이뤄져도 오늘 셀에
 * 하이라이트가 정상 적용되는지 검증한다.
 */
import { render, screen, waitFor } from '@testing-library/react'

import { MonthView } from '@/components/cultural/cultural-calendar/month-view'

describe('MonthView — 오늘 하이라이트 (F-2)', () => {
  it('마운트 후 오늘 셀에 ring 하이라이트 클래스가 적용된다', async () => {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    render(
      <MonthView
        days={[
          { date: yesterday, isCurrentMonth: true },
          { date: today, isCurrentMonth: true },
        ]}
        currentDate={today}
        getEventsForDate={() => []}
        showLunarCalendar={false}
        showTraditionalFestivals={false}
        showSeasonalThemes={false}
      />
    )

    await waitFor(() => {
      const todayCell = screen.getByText(String(today.getDate())).closest('div[class*="min-h-24"]')
      expect(todayCell?.className).toContain('ring-temple-gold')
    })
  })
})

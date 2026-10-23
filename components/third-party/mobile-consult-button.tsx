'use client'

import { CalendarDays } from 'lucide-react'

const CAL_LINK = 'orientalcalligraphy'
const CAL_URL = `https://cal.com/${CAL_LINK}`

interface CalWindow extends Window {
  Cal?: { ns?: Record<string, unknown> }
}

/**
 * 좁은 화면 전용 상담 예약 버튼 — Cal 플로팅 버튼(147×64 알약) 대신 52px 원형 아이콘.
 * data-cal-* 속성이 있으면 Cal 임베드가 클릭을 받아 같은 예약 창(모달)을 연다.
 * 임베드가 아직 안 올라왔으면(lazyOnload 이전·차단) 예약 페이지를 새 탭으로 연다.
 */
export function MobileConsultButton() {
  const handleClick = () => {
    if ((window as CalWindow).Cal?.ns?.meeting) return
    window.open(CAL_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type='button'
      data-cal-link={CAL_LINK}
      data-cal-namespace='meeting'
      data-cal-config='{"layout":"month_view"}'
      onClick={handleClick}
      aria-label='상담 예약'
      className='fixed right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#8a661c] text-white shadow-lg shadow-black/20 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8a661c] md:hidden print:hidden bottom-[calc(1rem+env(safe-area-inset-bottom))]'
    >
      <CalendarDays className='h-6 w-6' aria-hidden='true' />
    </button>
  )
}

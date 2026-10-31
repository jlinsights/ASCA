'use client'

import { CalendarDays } from 'lucide-react'

const CAL_LINK = 'orientalcalligraphy'
const CAL_URL = `https://cal.com/${CAL_LINK}`
const CAL_MODAL_OPTIONS = { calLink: CAL_LINK, config: { layout: 'month_view' } }

// embed.js 가 실제로 실행돼야 등록되는 커스텀 엘리먼트. Cal.ns.meeting 은 인라인 스니펫이
// embed.js 도착 전에(차단돼도) 만들므로 로드 여부 신호로 쓸 수 없다.
const CAL_LOADED_ELEMENT = 'cal-modal-box'

interface CalWindow extends Window {
  Cal?: { ns?: { meeting?: (action: string, options: typeof CAL_MODAL_OPTIONS) => void } }
}

/**
 * 좁은 화면 전용 상담 예약 버튼 — Cal 플로팅 버튼(147×64 알약) 대신 52px 원형 아이콘.
 * 임베드가 로드돼 있으면 Cal API 로 같은 예약 창(모달)을 직접 연다. data-cal-link 속성만으로는
 * React 가 그린 이 버튼의 탭을 임베드가 받지 않았다(2026-10-24 확인).
 * 임베드가 아직 안 올라왔으면(lazyOnload 이전·차단) 예약 페이지를 새 탭으로 연다.
 */
export function MobileConsultButton() {
  const handleClick = () => {
    const openModal = (window as CalWindow).Cal?.ns?.meeting
    if (customElements.get(CAL_LOADED_ELEMENT) && openModal) {
      openModal('modal', CAL_MODAL_OPTIONS)
      return
    }
    window.open(CAL_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      aria-label='상담 예약'
      className='fixed right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gold-800 text-white shadow-lg shadow-black/20 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold-800 md:hidden print:hidden bottom-[calc(1rem+env(safe-area-inset-bottom))]'
    >
      <CalendarDays className='h-6 w-6' aria-hidden='true' />
    </button>
  )
}

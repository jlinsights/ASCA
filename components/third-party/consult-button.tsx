'use client'

import { CalendarDays } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

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
 * 상담 예약 버튼 — 모든 화면 폭에서 이 버튼 하나가 Cal 예약 창(모달)을 연다.
 * Cal 기본 플로팅 버튼은 문구를 스크립트 로드 때 한 번만 받아 언어를 바꿔도 한국어로 남았다.
 * 그래서 그 버튼은 만들지 않고(site-widgets 의 CAL_EMBED), 문구를 선택한 언어로 그린다.
 * - 768px 미만: 52px 원형 아이콘(right 16px·bottom 16px) — 147×64 알약이 본문을 가려서
 * - 768px 이상: 아이콘+문구 알약, Cal 버튼이 있던 자리(right 40px·bottom 24px·높이 64px)
 *   — KakaoChatButton 이 이 자리를 기준으로 바로 위에 놓인다.
 * 색: 금색 gold-800(#8a661c)에 흰 글자 — 대비 5.25:1.
 * React 가 그린 버튼의 클릭은 data-cal-link 로 받지 않아(2026-10-24 확인) Cal API 로 직접 연다.
 * 임베드가 아직 안 올라왔으면(lazyOnload 이전·차단) 예약 페이지를 새 탭으로 연다.
 */
export function ConsultButton() {
  const { t } = useLanguage()
  const label = t('siteConsultBook')

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
      aria-label={label}
      className='fixed right-4 z-40 flex h-[52px] w-[52px] items-center justify-center gap-2 rounded-full bg-gold-800 text-white shadow-lg shadow-black/20 transition-transform hover:bg-gold-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold-800 print:hidden bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-6 md:right-10 md:h-16 md:w-auto md:px-6'
    >
      <CalendarDays className='h-6 w-6 shrink-0' aria-hidden='true' />
      <span
        className='hidden whitespace-nowrap text-base font-semibold md:inline'
        aria-hidden='true'
      >
        {label}
      </span>
    </button>
  )
}

'use client'

import { KAKAO_CHAT_URL } from '@/lib/content/contact-info'
import { useLanguage } from '@/contexts/language-context'

/**
 * 카카오톡 상담 버튼 — 운영 중인 카카오톡 채널(_xkchGj)의 1:1 채팅을 새 탭으로 연다.
 * 휴대폰은 카카오톡 앱으로, 데스크톱은 카카오 채팅 페이지(PC 카톡 열기·QR)로 간다.
 * SDK(Kakao.Channel.chat)는 앱 키·도메인 등록이 필요해 쓰지 않고 링크로 둔다.
 *
 * 위치는 예약 버튼 바로 위다(오른쪽 끝을 맞추고 12px 띄움).
 * - 768px 미만: MobileConsultButton(52px 원형, right 16px·bottom 16px) 위 → bottom 16+52+12 = 80px
 * - 768px 이상: Cal 플로팅 버튼(64px 높이 알약, right 40px·bottom 24px, 2026-11-01 운영 측정) 위 → bottom 24+64+12 = 100px
 * 색은 카카오 디자인 가이드 고정값(배경 #FEE500, 기호 rgba(0,0,0,0.85)) — components/kakao/kakao-brand.ts 와 같다.
 * 접근 이름·툴팁은 선택한 언어를 따른다 — LanguageProvider(ClientProviders) 안에서 렌더링해야 한다.
 */
export function KakaoChatButton() {
  const { t } = useLanguage()
  return (
    <a
      href={KAKAO_CHAT_URL}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={t('siteKakaoChatNewTab')}
      title={t('siteKakaoChat')}
      className='fixed z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#FEE500] text-black/85 shadow-lg shadow-black/20 transition-transform hover:bg-[#FEE500]/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/70 print:hidden right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:right-10 md:bottom-[100px] md:h-14 md:w-14'
    >
      <svg viewBox='0 0 24 24' className='h-7 w-7' fill='currentColor' aria-hidden='true'>
        <path d='M12 3.5c-5.247 0-9.5 3.322-9.5 7.42 0 2.65 1.78 4.976 4.457 6.287l-.906 3.32a.35.35 0 0 0 .535.38l3.9-2.586c.495.054 1 .083 1.514.083 5.247 0 9.5-3.322 9.5-7.42S17.247 3.5 12 3.5Z' />
      </svg>
    </a>
  )
}

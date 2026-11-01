'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { MobileConsultButton } from './mobile-consult-button'
import { KakaoChatButton } from './kakao-chat-button'

// 전 페이지 공통 위젯 — 루트 레이아웃 <body> 끝에서 렌더링한다.
// Cal 스크립트 오리진은 next.config.js CSP 의 THIRD_PARTY.cal 에 등록돼 있어야 하고,
// 페이지 로드가 끝난 뒤(lazyOnload) 실행해 첫 화면 렌더링을 막지 않는다.
// 상담 채팅은 카카오톡 채널 링크(KakaoChatButton)라 스크립트가 없다 — 채널톡 위젯은 2026-11-01 에 뺐다.

/**
 * Cal.com 플로팅 예약 버튼 — 공식 임베드 코드에 세 가지를 바꿨다.
 * - 버튼 문구: 기본값 "Book my Cal" 대신 "상담 예약"
 * - 버튼 색: 금색 gold-800(#8a661c)에 흰 글자 — 대비 5.25:1 (헤더 gold-700 은 흰 글자와 3.75:1 이라 AA 미달)
 * - 예약 창 테마: "dark" 고정을 뺐다. Cal 은 예약 창(iframe)을 처음 만들 때 페이지의 CSS
 *   color-scheme(next-themes 가 <html> 에 설정)을 읽어 라이트/다크를 정한다.
 *   config.theme·ui.theme 을 주면 그 값이 고정돼 사이트 테마를 따르지 않는다.
 *   한계: 한 페이지에서 예약 창을 이미 연 뒤 테마를 바꾸면 그 창은 새로고침 전까지 처음 테마를 유지한다
 *   (Cal 이 iframe 을 재사용하고, 열린 뒤의 ui.theme 변경은 반영되지 않음 — 2026-10-19 확인).
 * - 좁은 화면(768px 미만)에선 CAL_HIDE_ON_MOBILE 이 Cal 버튼을 숨긴다. 147×64 알약이 본문을 가려서,
 *   대신 MobileConsultButton(52px 원형 아이콘, md:hidden)이 같은 예약 창을 연다. 버튼은 항상 만들고
 *   보이기만 같은 768px 미디어 쿼리로 가른다 — 로드 시점 matchMedia 로 가르면 창 크기를 바꿀 때 어긋난다.
 */
const CAL_EMBED = `
(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "meeting", {origin:"https://cal.com"});
Cal.ns.meeting("floatingButton", {"calLink":"orientalcalligraphy","config":{"layout":"month_view"},"buttonPosition":"bottom-right","buttonText":"상담 예약","buttonColor":"#8a661c","buttonTextColor":"#ffffff"});
Cal.ns.meeting("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
`

// 위젯 옆에 인라인으로 둔다 — globals.css 에 넣었을 땐 빌드 결과 CSS 에서 규칙이 빠졌다
// (2026-10-24, 번들 해시 불변 → 빌드 캐시 재사용으로 추정, 미확정). 위젯과 함께 있어야 할 규칙이기도 하다.
// 호스트 엘리먼트를 숨기면 섀도 DOM 안의 고정 버튼도 함께 숨는다.
const CAL_HIDE_ON_MOBILE =
  '@media (max-width: 767.98px) { cal-floating-button { display: none !important; } }'

export function SiteWidgets() {
  const pathname = usePathname()
  // Authentication forms must remain unobstructed, including after client navigation.
  if (
    /^\/(?:sign-in|sign-up|forgot-password|reset-password|auth|profile|admin)(?:\/|$)/.test(
      pathname
    )
  ) {
    return <style>{'cal-floating-button, cal-modal-box { display: none !important; }'}</style>
  }
  return (
    <>
      <Script id='cal-floating-embed' strategy='lazyOnload'>
        {CAL_EMBED}
      </Script>
      <style>{CAL_HIDE_ON_MOBILE}</style>
      <MobileConsultButton />
      <KakaoChatButton />
    </>
  )
}

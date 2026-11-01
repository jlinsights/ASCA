'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { ConsultButton } from './consult-button'
import { KakaoChatButton } from './kakao-chat-button'

// 전 페이지 공통 위젯 — 루트 레이아웃 <body> 끝에서 렌더링한다.
// Cal 스크립트 오리진은 next.config.js CSP 의 THIRD_PARTY.cal 에 등록돼 있어야 하고,
// 페이지 로드가 끝난 뒤(lazyOnload) 실행해 첫 화면 렌더링을 막지 않는다.
// 상담 채팅은 카카오톡 채널 링크(KakaoChatButton)라 스크립트가 없다 — 채널톡 위젯은 2026-11-01 에 뺐다.

/**
 * Cal.com 임베드 — 예약 창(모달)만 쓴다. 공식 임베드 코드에서 바꾼 점:
 * - 플로팅 버튼(floatingButton)은 만들지 않는다. 그 버튼은 문구를 스크립트 로드 때 한 번만 받아
 *   언어를 바꿔도 "상담 예약"으로 남았다. 대신 ConsultButton 이 선택한 언어의 문구로 모든 화면 폭에서
 *   같은 예약 창을 연다(2026-11-01).
 * - 예약 창 테마: "dark" 고정을 뺐다. Cal 은 예약 창(iframe)을 처음 만들 때 페이지의 CSS
 *   color-scheme(next-themes 가 <html> 에 설정)을 읽어 라이트/다크를 정한다.
 *   config.theme·ui.theme 을 주면 그 값이 고정돼 사이트 테마를 따르지 않는다.
 *   한계: 한 페이지에서 예약 창을 이미 연 뒤 테마를 바꾸면 그 창은 새로고침 전까지 처음 테마를 유지한다
 *   (Cal 이 iframe 을 재사용하고, 열린 뒤의 ui.theme 변경은 반영되지 않음 — 2026-10-19 확인).
 */
const CAL_EMBED = `
(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "meeting", {origin:"https://cal.com"});
Cal.ns.meeting("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
`

export function SiteWidgets() {
  const pathname = usePathname()
  // Authentication forms must remain unobstructed, including after client navigation.
  if (
    /^\/(?:sign-in|sign-up|forgot-password|reset-password|auth|profile|admin)(?:\/|$)/.test(
      pathname
    )
  ) {
    return <style>{'cal-modal-box { display: none !important; }'}</style>
  }
  return (
    <>
      <Script id='cal-floating-embed' strategy='lazyOnload'>
        {CAL_EMBED}
      </Script>
      <ConsultButton />
      <KakaoChatButton />
    </>
  )
}

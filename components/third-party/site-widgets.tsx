import Script from 'next/script'
import { MobileConsultButton } from './mobile-consult-button'

// 전 페이지 공통 위젯 — 루트 레이아웃 <body> 끝에서 렌더링한다.
// 오리진은 next.config.js CSP 의 THIRD_PARTY(cal, channelTalk)에 등록돼 있어야 한다.
// 둘 다 페이지 로드가 끝난 뒤(lazyOnload) 실행해 첫 화면 렌더링을 막지 않는다.

/**
 * Cal.com 플로팅 예약 버튼 — 공식 임베드 코드에 세 가지를 바꿨다.
 * - 버튼 문구: 기본값 "Book my Cal" 대신 "상담 예약"
 * - 버튼 색: 금색 gold-800(#8a661c)에 흰 글자 — 대비 5.25:1 (헤더 gold-700 은 흰 글자와 3.75:1 이라 AA 미달)
 * - 예약 창 테마: "dark" 고정을 뺐다. Cal 은 예약 창(iframe)을 처음 만들 때 페이지의 CSS
 *   color-scheme(next-themes 가 <html> 에 설정)을 읽어 라이트/다크를 정한다.
 *   config.theme·ui.theme 을 주면 그 값이 고정돼 사이트 테마를 따르지 않는다.
 *   한계: 한 페이지에서 예약 창을 이미 연 뒤 테마를 바꾸면 그 창은 새로고침 전까지 처음 테마를 유지한다
 *   (Cal 이 iframe 을 재사용하고, 열린 뒤의 ui.theme 변경은 반영되지 않음 — 2026-10-19 확인).
 * - 좁은 화면(768px 미만)에선 Cal 버튼을 만들지 않는다. 147×64 알약이 본문을 가려서,
 *   대신 MobileConsultButton(52px 원형 아이콘)이 같은 예약 창을 연다.
 */
const CAL_EMBED = `
(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "meeting", {origin:"https://cal.com"});
if (window.matchMedia("(min-width: 768px)").matches) {
  Cal.ns.meeting("floatingButton", {"calLink":"orientalcalligraphy","config":{"layout":"month_view"},"buttonPosition":"bottom-right","buttonText":"상담 예약","buttonColor":"#8a661c","buttonTextColor":"#ffffff"});
}
Cal.ns.meeting("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
`

/** 채널톡 상담 위젯 — 공식 설치 코드 그대로 (pluginKey 는 공개 키) */
const CHANNEL_TALK = `
(function(){var w=window;if(w.ChannelIO){return w.console.error("ChannelIO script included twice.");}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();
ChannelIO('boot', {
  "pluginKey": "c5a02de1-1bef-4577-9bf4-8f3e9d113058"
});
`

export function SiteWidgets() {
  return (
    <>
      <Script id='cal-floating-embed' strategy='lazyOnload'>
        {CAL_EMBED}
      </Script>
      <MobileConsultButton />
      <Script id='channel-talk' strategy='lazyOnload'>
        {CHANNEL_TALK}
      </Script>
    </>
  )
}

import Script from 'next/script'

// 전 페이지 공통 위젯 — 루트 레이아웃 <body> 끝에서 렌더링한다.
// 오리진은 next.config.js CSP 의 THIRD_PARTY(cal, channelTalk)에 등록돼 있어야 한다.
// 둘 다 페이지 로드가 끝난 뒤(lazyOnload) 실행해 첫 화면 렌더링을 막지 않는다.

/** Cal.com 플로팅 예약 버튼 — 공식 임베드 코드 그대로 */
const CAL_EMBED = `
(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "meeting", {origin:"https://cal.com"});
Cal.ns.meeting("floatingButton", {"calLink":"orientalcalligraphy","config":{"layout":"month_view","theme":"dark"},"buttonPosition":"bottom-right"});
Cal.ns.meeting("ui", {"theme":"dark","hideEventTypeDetails":false,"layout":"month_view"});
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
      <Script id='channel-talk' strategy='lazyOnload'>
        {CHANNEL_TALK}
      </Script>
    </>
  )
}

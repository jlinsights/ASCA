import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Serif } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { ClientProviders } from "@/components/client-providers"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { Toaster } from '@/components/ui/toaster'

// 개발 환경 설정 import
import { initializeDevEnvironment } from "@/lib/config/development"

// 다국어 지원을 위한 폰트 설정
const inter = Inter({ 
  subsets: ["latin", "latin-ext"], 
  variable: "--font-inter",
  display: 'swap'
})

const notoSerif = Noto_Serif({ 
  subsets: ["latin", "latin-ext"], 
  variable: "--font-noto-serif",
  display: 'swap'
})

export const metadata: Metadata = {
  title: "ASCA | The Asian Society of Calligraphic Arts",
  description: "사단법인 동양서예협회 - 正法의 계승, 創新의 조화",
  keywords: "동양서예협회, ASCA, 서예, 동양서예, 한국서예, 서예전시, 서예교육, 서예문화",
  authors: [{ name: "ASCA" }],
  creator: "ASCA",
  publisher: "ASCA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://orientalcalligraphy.org'),
  alternates: {
    canonical: '/',
    languages: {
      'ko': '/ko',
      'en': '/en',
      'ja': '/ja',
      'zh': '/zh',
    },
  },
  openGraph: {
    title: "ASCA | The Asian Society of Calligraphic Arts",
    description: "사단법인 동양서예협회 - 正法의 계승, 創新의 조화",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://orientalcalligraphy.org',
    siteName: 'ASCA',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ASCA | The Asian Society of Calligraphic Arts",
    description: "사단법인 동양서예협회 - 正法의 계승, 創新의 조화",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon/safari-pinned-tab.svg', color: '#8B5A3C' },
    ],
  },
  manifest: '/site.webmanifest',
  generator: 'Next.js'
}

// 개발 환경 초기화 (서버 사이드에서 실행)
if (process.env.NODE_ENV === 'development') {
  initializeDevEnvironment()
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

  return (
    <html lang="ko" suppressHydrationWarning className={`${inter.variable} ${notoSerif.variable} font-sans bg-background text-foreground transition-none`}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-3536211002609340" />
        {/* CJK 폰트 로드 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Serif+TC:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;500;600;700&family=Noto+Serif+KR:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link rel="stylesheet" href="/fonts/font-face.css" />
        
        {/* 개발 환경 메타 태그 */}
        {isDevelopment && (
          <>
            <meta name="dev-mode" content={isDevMode ? 'true' : 'false'} />
            <meta name="dev-build-time" content={new Date().toISOString()} />
          </>
        )}
      </head>
      <body>
        {/* 개발 환경 디버그 정보 */}
        {isDevelopment && isDevMode && (
          <div className="fixed top-0 right-0 z-50 bg-yellow-400 text-black px-2 py-1 text-xs font-mono">
            DEV MODE
          </div>
        )}

        <ClientProviders>
          {children}
          <Toaster />
          <PerformanceMonitor />
        </ClientProviders>

        {/* ChannelIO Chat Widget - 개발 환경에서 조건부 로드 */}
        {(!isDevelopment || process.env.NEXT_PUBLIC_CHANNEL_IO_KEY) && (
          <Script id="channel-io" strategy="afterInteractive">
            {`
              (function(){var w=window;if(w.ChannelIO){return w.}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();

              ChannelIO('boot', {
                "pluginKey": "${process.env.NEXT_PUBLIC_CHANNEL_IO_KEY || 'c5a02de1-1bef-4577-9bf4-8f3e9d113058'}"
              });
            `}
          </Script>
        )}

        {/* Cal.com Meeting Scheduler - 개발 환경에서 조건부 로드 */}
        {(!isDevelopment || process.env.NEXT_PUBLIC_CAL_COM_USERNAME) && (
          <Script id="cal-com" strategy="afterInteractive">
            {`
              (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
              Cal("init", "meeting", {origin:"https://cal.com"});

              Cal.ns.meeting("floatingButton", {"calLink":"${process.env.NEXT_PUBLIC_CAL_COM_USERNAME || 'orientalcalligraphy'}","config":{"layout":"month_view","theme":"dark"},"buttonPosition":"bottom-left"}); 
              Cal.ns.meeting("ui", {"theme":"dark","hideEventTypeDetails":false,"layout":"month_view"});
            `}
          </Script>
        )}

        {/* 개발 환경 디버그 스크립트 */}
        {isDevelopment && process.env.ENABLE_CONSOLE_LOGS === 'true' && (
          <Script id="dev-debug" strategy="afterInteractive">
            {`
              console.log('🚀 ASCA 개발 모드 활성화됨');
              console.log('📅 빌드 시간:', '${new Date().toISOString()}');
              console.log('🌍 환경:', {
                NODE_ENV: '${process.env.NODE_ENV}',
                DEV_MODE: '${process.env.NEXT_PUBLIC_DEV_MODE}',
                MOCK_DATA: '${process.env.USE_MOCK_DATA}',
                ADMIN_MODE: '${process.env.DEV_ADMIN_MODE}'
              });
              
              // 개발 도구 단축키 설정
              document.addEventListener('keydown', function(e) {
                // Ctrl+Shift+D: 개발 정보 토글
                if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                  const devInfo = document.querySelector('[data-dev-info]');
                  if (devInfo) {
                    devInfo.style.display = devInfo.style.display === 'none' ? 'block' : 'none';
                  }
                }
                
                // Ctrl+Shift+L: 로컬 스토리지 클리어
                if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                  localStorage.clear();
                  sessionStorage.clear();
                  console.log('🗑️ 로컬 스토리지가 클리어되었습니다.');
                }
              });
            `}
          </Script>
        )}

      </body>
    </html>
  )
}

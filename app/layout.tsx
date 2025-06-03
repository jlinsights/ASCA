import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Serif } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthProvider } from "@/contexts/AuthContext"
import { SWRProvider } from '@/providers/SWRProvider'

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
  metadataBase: new URL('https://orientalcalligraphy.org'),
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
    url: 'https://orientalcalligraphy.org',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
      </head>
      <body>
        <ClerkProvider>
          <SWRProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <LanguageProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
          </SWRProvider>
        </ClerkProvider>

        {/* ChannelIO Chat Widget */}
        <Script id="channel-io" strategy="afterInteractive">
          {`
            (function(){var w=window;if(w.ChannelIO){return w.console.error("ChannelIO script included twice.");}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();

            ChannelIO('boot', {
              "pluginKey": "c5a02de1-1bef-4577-9bf4-8f3e9d113058"
            });
          `}
        </Script>

        {/* Cal.com Meeting Scheduler */}
        <Script id="cal-com" strategy="afterInteractive">
          {`
            (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
            Cal("init", "meeting", {origin:"https://cal.com"});

            Cal.ns.meeting("floatingButton", {"calLink":"orientalcalligraphy","config":{"layout":"month_view","theme":"dark"},"buttonPosition":"bottom-left"}); 
            Cal.ns.meeting("ui", {"theme":"dark","hideEventTypeDetails":false,"layout":"month_view"});
          `}
        </Script>
      </body>
    </html>
  )
}

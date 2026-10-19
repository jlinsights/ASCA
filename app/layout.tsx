import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ClientProviders } from '@/components/client-providers'

// UI 본문 - Pretendard (한글+라틴). next/font 에 없어 공식 dynamic-subset CDN 으로 싣는다.
// 버전을 고정해야 CSP(next.config.js THIRD_PARTY.pretendard)와 캐시가 어긋나지 않는다.
const PRETENDARD_CSS =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css'

// 영문 디스플레이 - Playfair Display (ASCA Ink System, DESIGN.md §3)
// Variable woff2, Latin subset — public/fonts/playfair-display/ (OFL)
const playfair = localFont({
  src: [
    {
      path: '../public/fonts/playfair-display/PlayfairDisplay-Latin-Variable.woff2',
      weight: '400 700',
      style: 'normal',
    },
    {
      path: '../public/fonts/playfair-display/PlayfairDisplay-Latin-Italic-Variable.woff2',
      weight: '400 700',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-display',
})

// 번체 한자 - Noto Serif TC (협회명·슬로건 등 [lang=zh-Hant] / .cjk-tc-strict 전용, BRAND.md §3)
// unicode-range 조각이라 실제로 쓰인 글자만 받는다. CSS 변수는 globals.css :root 에서 정의한다.
const NOTO_SERIF_TC_CSS =
  'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600;700&display=swap'

// 한국어 산세리프 폴백 - Noto Sans KR (Pretendard 가 못 실렸을 때만 쓰인다)
// woff2 로컬 파일 — public/fonts/noto-sans-kr/ (OFL)
// @font-face + unicode-range 는 globals.css 에서 정의하고, CSS 변수도 :root 에서 직접 잡는다.
// (next/font/local 은 같은 weight 에 unicode-range 분리를 지원하지 않아 수동 선언)

// 한국어 세리프 - Noto Serif KR (서예 작품 제목용)
// woff2 로컬 파일 — public/fonts/noto-serif-kr/ (OFL)
// Noto Sans KR 과 같은 이유로 globals.css @font-face + :root 변수 선언

import { constructMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import { KakaoScript } from '@/components/seo/kakao-script'
import { VideoBackground } from '@/components/layout/video-background'
import { Header } from '@/components/header/header'
import { SkipLink } from '@/components/layout/skip-link'
import { SiteWidgets } from '@/components/third-party/site-widgets'

// root layout은 정적 콘텐츠 이모저모를 렌더링하므로 force-dynamic 불필요

// google-adsense-account 는 Google 이 <head> 에서만 읽는다 — metadata.other 로 <head> 에 넣는다.
const ADSENSE_ACCOUNT = 'ca-pub-3536211002609340'

export const metadata: Metadata = {
  ...constructMetadata(),
  other: { 'google-adsense-account': ADSENSE_ACCOUNT },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <head>
        <link rel='preconnect' href='https://cdn.jsdelivr.net' crossOrigin='anonymous' />
        <link rel='stylesheet' href={PRETENDARD_CSS} crossOrigin='anonymous' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link rel='stylesheet' href={NOTO_SERIF_TC_CSS} />
        <KakaoScript />
        {/* Global JSON-LD for AEO */}
        <JsonLd />
      </head>
      <body
        className={`${playfair.variable} font-sans bg-background transition-colors duration-300`}
        suppressHydrationWarning={true}
      >
        <ClientProviders>
          <SkipLink />
          <VideoBackground />
          <div className='min-h-screen flex flex-col relative'>
            <Header transparentOnTop={true} />

            <main id='main-content' className='flex-1 relative z-10 scroll-mt-20'>
              {children}
            </main>
          </div>
        </ClientProviders>
        <SiteWidgets />
      </body>
    </html>
  )
}

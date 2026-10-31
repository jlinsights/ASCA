import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Noto_Serif_KR, Noto_Serif_TC } from 'next/font/google'
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

// 한국어·한자 글꼴 - next/font/google 이 빌드 때 받아 자체 호스팅한다(외부 요청·렌더 차단 CSS 없음).
// Google 이 유니코드 구간별로 잘라 둔 조각을 그대로 쓰므로 페이지에 나온 글자의 조각만 받는다.
// subsets 는 미리 받을(preload) 조각을 고르는 값이라, 한글 조각은 preload: false 로 두고 필요할 때 받는다.
// 가변 글꼴(weight 생략)로 받는다 — 굵기마다 조각 묶음을 따로 받지 않고 한 묶음으로 모든 굵기를 낸다.
// variable 클래스는 <html> 에 단다 — globals.css 의 :root 글꼴 스택이 이 변수를 읽는다.

// 번체 한자 - Noto Serif TC (협회명·슬로건 등 [lang=zh-Hant] / .cjk-tc-strict 전용, BRAND.md §3)
const notoSerifTc = Noto_Serif_TC({
  subsets: ['latin'],
  preload: false,
  display: 'swap',
  variable: '--font-noto-serif-tc',
})

// 한국어 산세리프 폴백은 웹 글꼴을 받지 않는다 — Pretendard 에 없는 글자(주로 한자)는 OS 기본 한글
// 글꼴이 메운다. 스택은 globals.css :root 의 --font-noto-sans-kr.

// 한국어 세리프 - Noto Serif KR (서예 작품 제목·제목 글꼴)
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  preload: false,
  display: 'swap',
  variable: '--font-noto-serif-kr',
})

import { constructMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import { KakaoScript } from '@/components/seo/kakao-script'
import { Header } from '@/components/header/header'
import { SkipLink } from '@/components/layout/skip-link'
import { SiteWidgets } from '@/components/third-party/site-widgets'

// root layout은 정적 콘텐츠 이모저모를 렌더링하므로 force-dynamic 불필요

// google-adsense-account 는 Google 이 <head> 에서만 읽는다 — metadata.other 로 <head> 에 넣는다.
const ADSENSE_ACCOUNT = 'ca-pub-3536211002609340'

// Google Search Console·네이버 서치어드바이저 소유 확인(HTML 태그 방식) 코드. Vercel 환경 변수에 넣고
// 다시 배포하면 <head> 에 붙는다. 값이 없으면 태그를 달지 않는다
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION
const NAVER_SITE_VERIFICATION = process.env.NAVER_SITE_VERIFICATION

export const metadata: Metadata = {
  ...constructMetadata(),
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
  other: {
    'google-adsense-account': ADSENSE_ACCOUNT,
    ...(NAVER_SITE_VERIFICATION ? { 'naver-site-verification': NAVER_SITE_VERIFICATION } : {}),
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='ko'
      className={`${notoSerifKr.variable} ${notoSerifTc.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel='preconnect' href='https://cdn.jsdelivr.net' crossOrigin='anonymous' />
        <link rel='stylesheet' href={PRETENDARD_CSS} crossOrigin='anonymous' />
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

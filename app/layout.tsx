import type { Metadata } from 'next'
import { Playfair_Display, Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/client-providers'

// UI 본문 - Pretendard (한글+라틴). next/font 에 없어 공식 dynamic-subset CDN 으로 싣는다.
// 버전을 고정해야 CSP(next.config.js THIRD_PARTY.pretendard)와 캐시가 어긋나지 않는다.
const PRETENDARD_CSS =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css'

// 영문 디스플레이 - Playfair Display (ASCA Ink System, DESIGN.md §3)
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
})

// 번체 한자 - Noto Serif TC (협회명·슬로건 등 [lang=zh-Hant] / .cjk-tc-strict 전용, BRAND.md §3)
// next/font 로 받으면 Vercel 빌드가 loader 에서 죽는다(#49 이후 'reading 1' TypeError) — Google Fonts CSS 로 직접 싣는다.
// unicode-range 조각이라 실제로 쓰인 글자만 받는다. CSS 변수는 globals.css :root 에서 정의한다.
const NOTO_SERIF_TC_CSS =
  'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600;700&display=swap'

// 한국어 산세리프 폴백 - Noto Sans KR (Pretendard 가 못 실렸을 때만 쓰인다)
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'], // 500 제거 (시각 인식 차이 미미, 폰트 파일 1개 절감)
  display: 'swap',
  preload: false, // 주 폰트는 Pretendard — 폴백까지 preload 하면 첫 화면에 두 벌을 받는다
  variable: '--font-noto-sans-kr',
})

// 한국어 세리프 - Noto Serif KR (서예 작품 제목용)
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'], // 600 제거 (400과 700으로 충분히 구분)
  display: 'swap',
  preload: false, // 서예 작품 페이지 외에는 불필요
  variable: '--font-noto-serif-kr',
})

import { constructMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import { KakaoScript } from '@/components/seo/kakao-script'
import { VideoBackground } from '@/components/layout/video-background'
import { Header } from '@/components/header/header'

// root layout은 정적 콘텐츠 이모저모를 렌더링하므로 force-dynamic 불필요

export const metadata = constructMetadata()

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
        className={`${playfair.variable} ${notoSansKr.variable} ${notoSerifKr.variable} font-sans bg-background transition-colors duration-300`}
        suppressHydrationWarning={true}
      >
        <ClientProviders>
          <a
            href='#main-content'
            className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-celadon-green focus:text-ink-black focus:rounded-md focus:text-sm focus:font-medium'
          >
            본문으로 건너뛰기
          </a>
          <VideoBackground />
          <div className='min-h-screen flex flex-col relative'>
            <Header transparentOnTop={true} />

            <main id='main-content' className='flex-1 relative z-10 scroll-mt-20'>
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}

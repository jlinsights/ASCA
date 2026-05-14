import type { Metadata } from 'next'
import { Inter, Playfair_Display, Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/client-providers'

// 주 폰트 - Inter (영문)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// 장식 폰트 - Playfair Display
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
})

// 한국어 산세리프 - Noto Sans KR
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'],      // 500 제거 (시각 인식 차이 미미, 폰트 파일 1개 절감)
  display: 'swap',
  preload: true,               // 주요 한국어 폰트는 preload 유지
  variable: '--font-noto-sans-kr',
})

// 한국어 세리프 - Noto Serif KR (서예 작품 제목용)
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],      // 600 제거 (400과 700으로 충분히 구분)
  display: 'swap',
  preload: false,              // 서예 작품 페이지 외에는 불필요
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
        <KakaoScript />
        {/* Global JSON-LD for AEO */}
        <JsonLd />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${notoSansKr.variable} ${notoSerifKr.variable} font-sans bg-background transition-colors duration-300`}
        suppressHydrationWarning={true}
      >
        <ClientProviders>
          <a
            href='#main-content'
            className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-celadon-green focus:text-white focus:rounded-md focus:text-sm focus:font-medium'
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

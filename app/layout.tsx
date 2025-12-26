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
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
})

// 한국어 세리프 - Noto Serif KR (서예 작품 제목용)
const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-noto-serif-kr',
})

import { constructMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'

export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Kakao SDK for sharing */}
        <script 
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" 
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4" 
          crossOrigin="anonymous"
          async
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.Kakao) {
                if (!window.Kakao.isInitialized()) {
                  window.Kakao.init('${process.env.NEXT_PUBLIC_KAKAO_APP_KEY || 'YOUR_KAKAO_APP_KEY'}');
                }
              }
            `,
          }}
        />
        {/* Global JSON-LD for AEO */}
        <JsonLd />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${notoSansKr.variable} ${notoSerifKr.variable} font-sans bg-rice-paper dark:bg-ink-black transition-colors duration-300`}>
        <ClientProviders>
          <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-celadon-green/5 blur-[100px] animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-scholar-red/5 blur-[100px] animate-pulse delay-1000" />
            </div>
            
            <main className="flex-1 relative z-10">
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
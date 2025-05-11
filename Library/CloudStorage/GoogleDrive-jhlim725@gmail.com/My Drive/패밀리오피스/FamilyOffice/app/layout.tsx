import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Noto_Sans_KR, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

// 폰트 최적화: 필요한 서브셋만 로드
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
  display: "swap", // 폰트 로딩 중 텍스트 표시
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "패밀리오피스 VIP - 통합적인 자산관리 서비스",
  description: "자산 가치의 보존과 성장, 세대를 넘어선 자산 이전까지 대한민국 상위 1% 자산가를 위한 맞춤형 솔루션",
  keywords: "패밀리오피스, 자산관리, 상속, 증여, 세무, 법률, 부동산, 가업승계",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSansKr.variable} ${playfair.variable} font-body`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap'
})

export const metadata: Metadata = {
  title: "ASCA | 사단법인 동양서예협회",
  description: "正法의 계승, 創新의 조화 - 동양 서예 문화의 발전과 보급을 선도하는 사단법인 동양서예협회입니다.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${inter.variable} font-sans`}>
      <body>
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="text-2xl font-bold text-gray-900">
                동양서예협회
              </a>
              <nav className="hidden md:flex space-x-8">
                <a href="/exhibitions" className="text-gray-600 hover:text-gray-900">전시</a>
                <a href="/artworks" className="text-gray-600 hover:text-gray-900">작품</a>
                <a href="/artists" className="text-gray-600 hover:text-gray-900">작가</a>
                <a href="/events" className="text-gray-600 hover:text-gray-900">행사</a>
                <a href="/about" className="text-gray-600 hover:text-gray-900">소개</a>
              </nav>
            </div>
          </div>
        </header>
        
        <main>
          {children}
        </main>
        
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">사단법인 동양서예협회</h3>
              <p className="text-gray-400 mb-2">正法의 계승, 創新의 조화</p>
              <p className="text-gray-400">동양 서예 문화의 발전과 보급을 선도합니다</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
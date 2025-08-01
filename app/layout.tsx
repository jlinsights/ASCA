import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { ClientProviders } from "@/components/client-providers"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
// import { PerformanceMonitor } from "@/components/performance-monitor"

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
    <html lang="ko" className={`${inter.variable} font-sans`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientProviders>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  )
}
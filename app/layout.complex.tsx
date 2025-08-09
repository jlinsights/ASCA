import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/contexts/language-context-new'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ASCA | 사단법인 동양서예협회',
  description: '正法의 계승, 創新의 조화 - 동양서예협회 공식 웹사이트',
  keywords: '동양서예협회, 서예, 한글서예, 한자서예, 문인화, 수묵화, 민화, 현대서예, 캘리그라피, 전각, 서각',
  authors: [{ name: '사단법인 동양서예협회' }],
  creator: '사단법인 동양서예협회',
  publisher: '사단법인 동양서예협회',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://orientalcalligraphy.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ASCA | 사단법인 동양서예협회',
    description: '正法의 계승, 創新의 조화 - 동양서예협회 공식 웹사이트',
    url: 'https://orientalcalligraphy.org',
    siteName: '동양서예협회',
    images: [
      {
        url: '/logo/Logo & Tagline_white BG.png',
        width: 1200,
        height: 630,
        alt: '동양서예협회 로고',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASCA | 사단법인 동양서예협회',
    description: '正法의 계승, 創新의 조화 - 동양서예협회 공식 웹사이트',
    images: ['/logo/Logo & Tagline_white BG.png'],
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
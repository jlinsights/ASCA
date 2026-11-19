'use client'

import { ReactNode, useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from '@/contexts/language-context'
import { SessionProvider } from '@/components/auth/session-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import type { Language } from '@/lib/i18n/types'
import type { LocaleTable } from '@/lib/i18n/locales'

interface ClientProvidersProps {
  children: ReactNode
  /** 주소(/en·/ja·/zh)로 정한 언어 — app/layout.tsx 가 넘긴다 */
  language?: Language
  /** 한국어가 아니면 그 언어 표 */
  localeTable?: LocaleTable
}

export function ClientProviders({ children, language, localeTable }: ClientProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <LanguageProvider initialLanguage={language} initialTable={localeTable}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </LanguageProvider>
  )
}

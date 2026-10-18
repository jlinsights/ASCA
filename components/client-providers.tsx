'use client'

import { ReactNode, useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from '@/contexts/language-context'
import { LocalizedClerkProvider } from '@/components/auth/localized-clerk-provider'

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
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

  // Clerk 위젯 언어가 사이트 언어를 따라가도록 LanguageProvider 가 ClerkProvider 를 감싼다.
  return (
    <LanguageProvider>
      <LocalizedClerkProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </LocalizedClerkProvider>
    </LanguageProvider>
  )
}

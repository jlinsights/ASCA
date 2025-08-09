'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
} 
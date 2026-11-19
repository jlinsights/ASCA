'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme, type ThemeProviderProps } from 'next-themes'

const themes = ['light', 'dark']
const classes = { light: 'light', dark: 'dark', system: 'light' }

function ExplicitThemePreference() {
  const { theme, setTheme } = useTheme()
  React.useEffect(() => {
    if (theme && theme !== 'light' && theme !== 'dark') setTheme('light')
  }, [theme, setTheme])
  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      attribute='class'
      defaultTheme='light'
      enableSystem={false}
      themes={themes}
      value={classes}
      disableTransitionOnChange
    >
      <ExplicitThemePreference />
      {children}
    </NextThemesProvider>
  )
}

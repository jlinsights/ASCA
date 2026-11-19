'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface ThemeToggleProps {
  onToggle?: (position: { x: number; y: number }) => void
}

export function ThemeToggle({ onToggle }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const dark = (resolvedTheme ?? theme) === 'dark'

  const handleToggle = (e: React.MouseEvent) => {
    setTheme(dark ? 'light' : 'dark')
    const bounds = e.currentTarget.getBoundingClientRect()
    onToggle?.({
      x: e.detail === 0 ? bounds.left + bounds.width / 2 : e.clientX,
      y: e.detail === 0 ? bounds.top + bounds.height / 2 : e.clientY,
    })
  }

  return (
    <button
      type='button'
      onClick={handleToggle}
      disabled={!mounted}
      className='inline-flex shrink-0 items-center justify-center min-w-12 min-h-12 rounded-md relative z-10 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
      aria-label={t('siteDarkMode')}
      title={t(mounted && dark ? 'siteUseLightMode' : 'siteUseDarkMode')}
      aria-pressed={mounted && dark}
    >
      <Sun aria-hidden='true' className='h-5 w-5 dark:hidden text-foreground' />
      <Moon aria-hidden='true' className='absolute hidden h-5 w-5 dark:block text-foreground' />
    </button>
  )
}

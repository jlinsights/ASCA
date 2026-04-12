'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SIDEBAR_SECTIONS } from './brand-data'

export function BrandSidebar() {
  const [activeSection, setActiveSection] = useState<string>(SIDEBAR_SECTIONS[0].id)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )

    for (const section of SIDEBAR_SECTIONS) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  const activeLabel =
    SIDEBAR_SECTIONS.find(s => s.id === activeSection)?.label ?? SIDEBAR_SECTIONS[0].label

  return (
    <aside className='lg:w-56 shrink-0'>
      <button
        type='button'
        className='flex w-full items-center justify-between rounded-lg border bg-card p-3 text-sm font-medium lg:hidden'
        onClick={() => setIsMobileOpen(v => !v)}
      >
        {activeLabel}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isMobileOpen && 'rotate-180')} />
      </button>

      <nav
        className={cn(
          'mt-2 space-y-1 lg:sticky lg:top-24 lg:mt-0',
          isMobileOpen ? 'block' : 'hidden lg:block'
        )}
      >
        {SIDEBAR_SECTIONS.map(section => (
          <Link
            key={section.id}
            href={`#${section.id}`}
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              'block rounded-md px-3 py-2 text-sm transition-colors',
              activeSection === section.id
                ? 'bg-scholar-red/10 font-semibold text-scholar-red'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {section.label}
          </Link>
        ))}

        <div className='pt-4 border-t mt-4'>
          <a
            href='mailto:info@orientalcalligraphy.org?subject=브랜드 가이드라인 문의'
            className='flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          >
            <Download className='h-3.5 w-3.5' />
            브랜드 가이드 문의
          </a>
        </div>
      </nav>
    </aside>
  )
}

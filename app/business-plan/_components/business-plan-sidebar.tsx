'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EXHIBITION_YEARS, QUICK_LINKS } from './business-plan-data'

const YEAR_SECTIONS = EXHIBITION_YEARS.map(e => ({
  id: String(e.year),
  label: `${e.year}년`,
}))

export function BusinessPlanSidebar() {
  const [activeSection, setActiveSection] = useState<string>(YEAR_SECTIONS[0]?.id ?? '2025')
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )

    YEAR_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const activeLabel =
    YEAR_SECTIONS.find(s => s.id === activeSection)?.label ?? YEAR_SECTIONS[0]?.label ?? '2025년'

  return (
    <aside className='lg:sticky lg:top-24 lg:self-start w-full lg:w-56 shrink-0'>
      <button
        type='button'
        onClick={() => setIsMobileOpen(o => !o)}
        className='flex w-full items-center justify-between rounded-lg border bg-card p-3 text-sm font-semibold lg:hidden'
      >
        {activeLabel}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isMobileOpen && 'rotate-180')} />
      </button>

      <nav className={cn('mt-2 space-y-1 lg:mt-0', isMobileOpen ? 'block' : 'hidden lg:block')}>
        <p className='px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          사 업 계 획
        </p>
        {YEAR_SECTIONS.map(section => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              'block rounded-md px-3 py-1.5 text-sm transition-colors',
              activeSection === section.id
                ? 'bg-scholar-red/10 font-semibold text-scholar-red'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {section.label}
          </a>
        ))}

        <div className='my-3 border-t' />

        <p className='px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          바로 가기
        </p>
        {QUICK_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className='flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          >
            <ExternalLink className='h-3 w-3' />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

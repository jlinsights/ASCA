'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BYLAWS_SECTIONS, QUICK_LINKS } from './bylaws-data'

export function BylawsSidebar() {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.find(e => e.isIntersecting)
        if (visible?.target.id) {
          setActiveId(visible.target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )

    BYLAWS_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsOpen(false)
    }
  }

  return (
    <aside className='lg:w-72 shrink-0'>
      <div className='lg:sticky lg:top-24'>
        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex w-full items-center justify-between rounded-lg border bg-card p-4 lg:hidden'
        >
          <span className='font-semibold'>정관 및 관련 규정</span>
          <ChevronDown className={cn('h-5 w-5 transition-transform', isOpen && 'rotate-180')} />
        </button>

        <nav
          className={cn(
            'mt-2 space-y-1 overflow-hidden transition-all lg:mt-0 lg:max-h-none lg:opacity-100',
            isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 lg:opacity-100'
          )}
        >
          <div className='rounded-lg border bg-card p-4'>
            <h3 className='mb-3 text-sm font-bold text-muted-foreground'>정관 및 관련 규정</h3>
            <ul className='space-y-1'>
              {BYLAWS_SECTIONS.map(({ id, title }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                      activeId === id
                        ? 'bg-scholar-red/10 font-medium text-scholar-red'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <ChevronDown className='h-3 w-3 shrink-0 -rotate-90' />
                    <span>{title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className='rounded-lg border bg-card p-4'>
            <h3 className='mb-3 text-sm font-bold text-muted-foreground'>바로 가기</h3>
            <ul className='space-y-1'>
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className='flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
                  >
                    <ChevronDown className='h-3 w-3 shrink-0 -rotate-90' />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  )
}

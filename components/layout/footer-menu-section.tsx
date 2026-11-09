'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useLocalizedHref } from '@/lib/i18n/use-locale-path'
import { ChevronDown } from 'lucide-react'
import type { FooterLink } from './footer-data'

// Tailwind sm 경계와 같다 — 이보다 좁으면 묶음을 접는다
const DESKTOP_QUERY = '(min-width: 640px)'

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(DESKTOP_QUERY)
    setDesktop(query.matches)
    const onChange = (event: MediaQueryListEvent) => setDesktop(event.matches)
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])
  return desktop
}

interface FooterMenuSectionProps {
  title: string
  items: FooterLink[]
  label: (key: string) => string
  linkClassName: string
}

// 모바일에서는 제목을 눌러 펼치는 접이식, sm 이상에서는 늘 펼친 목록.
// 하이드레이션 전에도 sm 이상은 sm:grid 로 목록이 보여 깜빡이지 않는다.
export function FooterMenuSection({ title, items, label, linkClassName }: FooterMenuSectionProps) {
  const desktop = useIsDesktop()
  const localized = useLocalizedHref()
  const [open, setOpen] = useState(false)
  const listId = useId()
  const expanded = desktop || open

  return (
    <section className='border-t border-rice-paper/20 sm:border-t-0'>
      <h2 className='font-serif text-2xl font-normal leading-snug'>
        {desktop ? (
          <span className='mb-5 block'>{title}</span>
        ) : (
          <button
            type='button'
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen(value => !value)}
            className='flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:mb-5 sm:min-h-0 sm:py-0'
          >
            {title}
            <ChevronDown
              aria-hidden='true'
              strokeWidth={1.5}
              className={`h-5 w-5 shrink-0 text-rice-paper/70 transition-transform duration-200 motion-reduce:transition-none sm:hidden ${open ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </h2>
      <ul
        id={listId}
        className={`${expanded ? 'grid' : 'hidden'} grid-cols-2 gap-x-4 gap-y-2 pb-6 sm:grid sm:pb-0`}
      >
        {items.map(item => (
          <li key={item.href} className='min-w-0'>
            <Link
              href={item.external ? item.href : localized(item.href)}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              className={linkClassName}
            >
              {label(item.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

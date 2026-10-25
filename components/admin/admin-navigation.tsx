'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { ADMIN_NAV_ITEMS } from './admin-nav-items'

interface AdminNavigationProps {
  // Optional: Allow overriding for specific cases
  currentPage?: string
}

export const AdminNavigation = React.memo(
  ({ currentPage: propCurrentPage }: AdminNavigationProps = {}) => {
    const { language } = useLanguage()
    const pathname = usePathname()
    const lang = language === 'ko' ? 'ko' : 'en'

    const currentPage = useMemo(
      () => propCurrentPage ?? ADMIN_NAV_ITEMS.find(item => pathname?.startsWith(item.href))?.key,
      [propCurrentPage, pathname]
    )

    return (
      <nav aria-label='관리자 메뉴' className='border-b border-border bg-muted/30'>
        <div className='container'>
          <div className='flex items-center gap-2 py-3 overflow-x-auto'>
            <Link href='/'>
              <Button variant='ghost' size='sm' className='gap-2 flex-shrink-0'>
                <ArrowLeft className='h-4 w-4' />
                {lang === 'ko' ? '사이트로' : 'Back to site'}
              </Button>
            </Link>

            <div className='w-px h-6 bg-border flex-shrink-0' />

            {ADMIN_NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isCurrent = item.key === currentPage
              return (
                <Link key={item.key} href={item.href} aria-current={isCurrent ? 'page' : undefined}>
                  <Button
                    variant={isCurrent ? 'secondary' : 'ghost'}
                    size='sm'
                    className={`gap-2 flex-shrink-0 ${isCurrent ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                  >
                    <Icon className='h-4 w-4' />
                    {item.label[lang]}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    )
  }
)

AdminNavigation.displayName = 'AdminNavigation'

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
export function ArchiveNav() {
  const { t } = useLanguage()
  const path = usePathname()
  return (
    <nav
      aria-label={t('arNav')}
      className='flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 mb-12'
    >
      <Link href='/archive' className='font-serif text-xl'>
        {t('arTitle')}
      </Link>
      <div className='flex gap-6 text-sm'>
        <Link
          href='/archive'
          aria-current={path === '/archive' ? 'page' : undefined}
          className='underline-offset-8 hover:underline'
        >
          {t('arArtists')}
        </Link>
        <Link
          href='/archive/submit'
          aria-current={path === '/archive/submit' ? 'page' : undefined}
          className='underline-offset-8 hover:underline'
        >
          {t('arSubmit')}
        </Link>
      </div>
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

// 404 본문은 고른 언어로 쓴다 — 문구는 lib/i18n/locales/<언어>/not-found.ts 에 있다.
export function NotFoundBody() {
  const { t } = useLanguage()

  return (
    <div className='min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 pt-28 pb-16 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md text-center space-y-6'>
        <div className='space-y-4'>
          <h1 className='text-6xl font-bold text-muted-foreground'>404</h1>
          <h2 className='text-2xl font-semibold'>{t('notFoundTitle')}</h2>
          <p className='text-muted-foreground'>{t('notFoundDescription')}</p>
        </div>

        <div className='space-y-3'>
          <Link
            href='/'
            className='inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
          >
            {t('notFoundHome')}
          </Link>

          <Link
            href='/search'
            className='inline-flex items-center justify-center w-full px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors'
          >
            {t('notFoundSearch')}
          </Link>
        </div>

        <div className='border-t pt-4'>
          <p className='text-xs text-muted-foreground'>
            {t('notFoundHelpBefore')}
            <Link href='/contact' className='text-primary hover:underline'>
              {t('notFoundHelpLink')}
            </Link>
            {t('notFoundHelpAfter')}
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useLanguage } from '@/contexts/language-context'

export function SkipLink() {
  const { t } = useLanguage()

  return (
    <a
      href='#main-content'
      className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-celadon-green focus:text-ink-black focus:rounded-md focus:text-sm focus:font-medium'
    >
      {t('siteSkipToContent')}
    </a>
  )
}

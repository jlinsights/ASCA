'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

/** /community 에서 회원 게시판으로 들어가는 입구 */
export function BoardEntry() {
  const { t } = useLanguage()
  return (
    <section aria-labelledby='community-board-entry' className='bg-background py-20 md:py-28'>
      <div className='container'>
        <div className='mx-auto grid max-w-4xl gap-6 border-y border-foreground/80 py-10 md:grid-cols-[1fr_auto] md:items-end md:gap-12'>
          <div className='space-y-3'>
            <h2
              id='community-board-entry'
              className='font-serif text-3xl font-medium tracking-wide text-foreground md:text-4xl'
            >
              {t('boardEntryTitle')}
            </h2>
            <p className='max-w-xl leading-relaxed text-muted-foreground'>{t('boardEntryBody')}</p>
          </div>
          <Link
            href='/community/board'
            className='inline-flex min-h-12 items-center justify-between gap-6 border border-foreground bg-foreground px-5 text-background transition-colors hover:bg-transparent hover:text-foreground'
          >
            {t('boardEntryCta')}
            <span aria-hidden='true'>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

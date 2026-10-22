'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { Pagination } from './common'

export function ReviewList({
  works,
  total,
  page,
  status,
}: {
  works: { id: string; title: string; artists: { name: string; visibility: string } }[]
  total: number
  page: number
  status: 'pending_review' | 'published'
}) {
  const { t } = useLanguage()
  return (
    <section>
      <h1 className='font-serif text-4xl mb-6'>{t('arReviewTitle')}</h1>
      <p className='max-w-3xl leading-relaxed text-muted-foreground mb-8'>{t('arReviewIntro')}</p>
      <nav aria-label={t('arReviewStatus')} className='flex gap-8 border-b border-border pb-6 mb-8'>
        {(['pending_review', 'published'] as const).map(value => (
          <Link
            key={value}
            href={`/admin/archive/reviews?status=${value}`}
            aria-current={status === value ? 'page' : undefined}
            className={
              status === value
                ? 'font-semibold underline underline-offset-8'
                : 'text-muted-foreground'
            }
          >
            {t(value === 'published' ? 'arStatusPublished' : 'arStatusReview')}
          </Link>
        ))}
      </nav>
      {!works.length ? (
        <p role='status'>{t('arReviewEmpty')}</p>
      ) : (
        <ul className='space-y-4'>
          {works.map(work => (
            <li key={work.id} className='border border-border rounded-lg bg-card p-6'>
              <p className='text-sm text-muted-foreground mb-2'>{work.artists.name}</p>
              <Link
                href={`/admin/archive/reviews/${work.id}`}
                className='font-serif text-2xl underline underline-offset-4 break-words'
              >
                {work.title}
              </Link>
              {work.artists.visibility !== 'public' && (
                <p className='mt-4 text-sm'>{t('arReviewArtistPrivate')}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={page}
        total={total}
        href={p => `/admin/archive/reviews?status=${status}&page=${p}`}
      />
    </section>
  )
}

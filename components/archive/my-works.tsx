'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

export function MyWorks({
  works,
  page,
  total,
}: {
  works: {
    id: string
    title: string
    status: string | null
    artists: { name: string }
    feedback?: string | null
  }[]
  page: number
  total: number
}) {
  const { t } = useLanguage()
  return (
    <div>
      <header className='mb-12 max-w-3xl'>
        <h1 className='font-serif text-4xl md:text-5xl mb-6'>{t('arMyWorks')}</h1>
        <p className='text-muted-foreground leading-relaxed'>{t('arMyIntro')}</p>
        <Link
          href='/archive/submit'
          className='inline-block mt-6 rounded-md bg-primary text-primary-foreground px-6 py-3'
        >
          {t('arSubmit')}
        </Link>
      </header>
      {!works.length ? (
        <p role='status' className='border border-border rounded-lg p-8'>
          {t('arMyEmpty')}
        </p>
      ) : (
        <ul className='grid md:grid-cols-2 gap-6'>
          {works.map(work => (
            <li key={work.id} className='border border-border rounded-lg bg-card p-6'>
              <p className='text-sm text-muted-foreground mb-4'>{work.artists.name}</p>
              <h2 className='font-serif text-2xl break-words mb-4'>{work.title}</h2>
              <p className='text-sm mb-6'>
                {t(
                  work.status === 'draft'
                    ? 'arStatusDraft'
                    : work.status === 'published'
                      ? 'arStatusPublished'
                      : 'arStatusReview'
                )}
              </p>
              {work.feedback && (
                <p className='mb-6 whitespace-pre-wrap break-words text-sm'>
                  {t('arReviewFeedback')}: {work.feedback}
                </p>
              )}
              {work.status === 'draft' ? (
                <Link className='underline underline-offset-4' href={`/archive/my/${work.id}`}>
                  {t('arEditDraft')}
                </Link>
              ) : (
                <p className='text-sm text-muted-foreground'>{t('arLockedHint')}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <nav aria-label={t('arPages')} className='flex gap-8 mt-8'>
        {page > 1 && <Link href={`/archive/my?page=${page - 1}`}>{t('arPrev')}</Link>}
        {page * 24 < total && <Link href={`/archive/my?page=${page + 1}`}>{t('arNext')}</Link>}
      </nav>
    </div>
  )
}

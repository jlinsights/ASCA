'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { Pagination } from './common'

export function ExhibitionIndex({
  exhibitions,
  total,
  page,
  admin = false,
}: {
  exhibitions: {
    id: string
    title: string
    start_date: string
    end_date: string
    is_published: boolean | null
  }[]
  total: number
  page: number
  admin?: boolean
}) {
  const { t, metadata } = useLanguage()
  const base = admin ? '/admin/archive/exhibitions' : '/archive/exhibitions'
  const date = (value: string) => new Date(value + 'T00:00:00').toLocaleDateString(metadata.locale)
  return (
    <section>
      <h1 className='font-serif text-4xl mb-6'>
        {t(admin ? 'axManageExhibitions' : 'axExhibitionWorks')}
      </h1>
      <p className='max-w-3xl text-muted-foreground leading-relaxed mb-8'>
        {t(admin ? 'axReuseIntro' : 'axExhibitionIntro')}
      </p>
      {!exhibitions.length ? (
        <p role='status'>{t('axNoExhibitions')}</p>
      ) : (
        <ul className='space-y-6'>
          {exhibitions.map(exhibition => (
            <li key={exhibition.id} className='border border-border rounded-lg p-6 bg-card'>
              <Link
                href={`${base}/${exhibition.id}`}
                className='font-serif text-2xl underline underline-offset-4'
              >
                {exhibition.title}
              </Link>
              <p className='text-sm text-muted-foreground mt-4'>
                {date(exhibition.start_date)} – {date(exhibition.end_date)}
              </p>
              {admin && !exhibition.is_published && (
                <p className='mt-2 text-sm'>{t('axExhibitionPrivate')}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} total={total} href={p => `${base}?page=${p}`} />
    </section>
  )
}

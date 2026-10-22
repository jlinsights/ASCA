'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { ArchiveImage, Pagination } from './common'
import type { Image } from '@/lib/archive/queries'

export function ExhibitionWorks({
  exhibition,
  works,
  page,
  total,
}: {
  exhibition: { id: string; title: string; location: string | null }
  works: {
    id: string
    title: string
    title_en: string | null
    title_hanja: string | null
    style: string | null
    width_cm: number | null
    height_cm: number | null
    year_created: number
    artists: { name: string }
    artwork_images: Image[]
  }[]
  page: number
  total: number
}) {
  const { t, language } = useLanguage()
  return (
    <section>
      <Link href='/archive/exhibitions' className='underline text-sm'>
        {t('axExhibitionWorks')}
      </Link>
      <h1 className='font-serif text-4xl mt-8 mb-4'>{exhibition.title}</h1>
      <p className='text-muted-foreground mb-8'>{exhibition.location}</p>
      {!works.length ? (
        <p role='status'>{t('arNoWorks')}</p>
      ) : (
        <ul className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {works.map(work => (
            <li key={work.id}>
              <Link href={`/archive/artworks/${work.id}`} className='group'>
                <div className='h-80 bg-muted border border-border p-6 group-hover:bg-secondary transition-colors'>
                  <ArchiveImage path={work.artwork_images[0]?.thumb_path} alt={work.title} />
                </div>
                <h2 className='font-serif text-xl mt-4'>
                  {language === 'en' ? work.title_en || work.title : work.title_hanja || work.title}
                </h2>
                <p className='text-sm mt-2'>{work.artists.name}</p>
                <p className='text-xs text-muted-foreground mt-2'>
                  {[
                    work.style,
                    work.width_cm && work.height_cm
                      ? `${work.width_cm} × ${work.height_cm} cm`
                      : null,
                    work.year_created,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={page}
        total={total}
        href={p => `/archive/exhibitions/${exhibition.id}?page=${p}`}
      />
    </section>
  )
}

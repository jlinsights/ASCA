'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import type { Artist, Work, Image, RecordEntry } from '@/lib/archive/queries'
import { ImageGallery, Pagination } from './common'
import { RecordList } from './artist-profile'
export function ArtworkDetail({
  work,
  artist,
  records,
  recordTotal,
  page,
}: {
  work: Work & { artwork_images: Image[] }
  artist: Artist
  records: RecordEntry[]
  recordTotal: number
  page: number
}) {
  const { t, language } = useLanguage()
  const title = language === 'en' ? work.title_en || work.title : work.title_hanja || work.title
  const explanation =
    language === 'en' && work.interpretation_en ? work.interpretation_en : work.interpretation
  return (
    <>
      <nav
        aria-label={t('arBreadcrumb')}
        className='text-sm text-muted-foreground flex flex-wrap gap-3 mb-8'
      >
        <Link href='/archive' className='underline'>
          {t('arArtists')}
        </Link>
        <span>/</span>
        <Link href={`/archive/artists/${artist.id}`} className='underline'>
          {artist.art_name_ko || artist.name}
        </Link>
        <span>/</span>
        <span>{title}</span>
      </nav>
      <div className='grid lg:grid-cols-2 gap-12'>
        <ImageGallery images={work.artwork_images} title={title} />
        <div>
          <h1 className='font-serif text-4xl md:text-5xl leading-tight'>{title}</h1>
          <p className='mt-4 text-muted-foreground'>
            {work.title} · {artist.art_name_ko || artist.name}
          </p>
          <section className='my-8 p-6 md:p-8 border border-border rounded-lg bg-card'>
            <h2 className='text-sm font-medium mb-4'>{t('arReading')}</h2>
            {work.transcription && (
              <p className='font-serif text-2xl whitespace-pre-line mb-6'>{work.transcription}</p>
            )}
            <p
              className='leading-loose whitespace-pre-line'
              lang={language === 'en' && work.interpretation_en ? 'en' : 'ko'}
            >
              {explanation || t('arNoReading')}
            </p>
            {work.source_text && (
              <p className='text-sm text-muted-foreground mt-6'>
                {t('arSource')} · {work.source_text}
              </p>
            )}
          </section>
          <dl className='divide-y divide-border text-sm'>
            {[
              [t('arStyle'), work.style],
              [
                t('arSize'),
                work.width_cm && work.height_cm ? `${work.width_cm} × ${work.height_cm} cm` : null,
              ],
              [t('arMaterials'), work.materials?.join(' · ')],
              [t('arYear'), String(work.year_created)],
              [t('arSeal'), work.seal_description],
            ].map(([label, value]) => (
              <div key={label} className='grid grid-cols-[6rem_1fr] gap-4 py-4'>
                <dt className='text-muted-foreground'>{label}</dt>
                <dd>{value || '—'}</dd>
              </div>
            ))}
          </dl>
          <div className='flex flex-wrap items-center gap-4 mt-8'>
            <a
              href='mailto:info@orientalcalligraphy.org'
              className='rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm'
            >
              {t('arContact')}
            </a>
            <button
              type='button'
              disabled
              className='rounded-md border border-border px-6 py-3 text-sm text-muted-foreground cursor-not-allowed'
              aria-describedby='contest-hint'
            >
              {t('arContest')}
            </button>
          </div>
          <p id='contest-hint' className='text-xs text-muted-foreground mt-4'>
            {t('arContestHint')}
          </p>
          <section className='mt-12'>
            <h2 className='font-serif text-2xl mb-4'>{t('arRecords')}</h2>
            <RecordList records={records} />
            <Pagination
              page={page}
              total={recordTotal}
              href={p => `/archive/artworks/${work.id}?page=${p}`}
            />
          </section>
        </div>
      </div>
    </>
  )
}

'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import type { Artist, Work, Image, RecordEntry } from '@/lib/archive/queries'
import { ArchiveImage, Pagination } from './common'
export function ArtistProfile({
  artist,
  works,
  records,
  workTotal,
  recordTotal,
  page,
  tab,
}: {
  artist: Artist
  works: (Work & { artwork_images: Image[] })[]
  records: RecordEntry[]
  workTotal: number
  recordTotal: number
  page: number
  tab: string
}) {
  const { t, language, metadata } = useLanguage()
  const name =
    language === 'en'
      ? artist.name_en || artist.name
      : language === 'ja'
        ? artist.name_ja || artist.name
        : language === 'zh'
          ? artist.name_zh || artist.name
          : artist.name
  const bio =
    language === 'en' && artist.archive_bio_en ? artist.archive_bio_en : artist.archive_bio
  const base = `/archive/artists/${artist.id}`
  return (
    <>
      <Link href='/archive' className='text-sm underline'>
        {t('arBack')}
      </Link>
      <div className='grid lg:grid-cols-[20rem_1fr] gap-12 mt-8'>
        <aside>
          <div className='w-32 h-32 bg-muted rounded-full overflow-hidden mb-8'>
            <ArchiveImage path={artist.profile_image_path} alt={name} />
          </div>
          <h1 className='font-serif text-4xl mb-3'>{artist.art_name_ko || name}</h1>
          <p className='text-muted-foreground'>
            {[artist.art_name_hanja, artist.art_name_ko ? name : null].filter(Boolean).join(' · ')}
          </p>
          {artist.certification_grade && (
            <p className='inline-block bg-secondary text-secondary-foreground rounded-md px-3 py-1 text-sm mt-6'>
              {artist.certification_grade}
            </p>
          )}
          <p className='mt-6 text-sm'>{artist.calligraphy_styles.join(' · ')}</p>
          {bio && (
            <p
              className='mt-6 whitespace-pre-line leading-loose'
              lang={language === 'en' && artist.archive_bio_en ? 'en' : 'ko'}
            >
              {bio}
            </p>
          )}
          <dl className='text-sm mt-8 space-y-4'>
            {[
              [t('arTeacher'), artist.teacher_name],
              [t('arBranch'), artist.branch_name],
              [
                t('arCertifiedDate'),
                artist.certified_at
                  ? new Date(artist.certified_at + 'T00:00:00').toLocaleDateString(metadata.locale)
                  : null,
              ],
            ].map(([label, value]) =>
              value ? (
                <div key={label}>
                  <dt className='text-muted-foreground mb-1'>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ) : null
            )}
          </dl>
          <a
            className='inline-block mt-8 rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm'
            href='mailto:info@orientalcalligraphy.org'
          >
            {t('arContact')}
          </a>
          <p className='mt-4 text-xs leading-relaxed text-muted-foreground'>{t('arContactHint')}</p>
        </aside>
        <section>
          <nav className='flex gap-8 border-b border-border mb-8 text-sm'>
            <Link
              href={base}
              aria-current={tab === 'works' ? 'page' : undefined}
              className={`pb-4 ${tab === 'works' ? 'border-b-2 border-primary' : ''}`}
            >
              {t('arWorks')}
            </Link>
            <Link
              href={`${base}?tab=records`}
              aria-current={tab === 'records' ? 'page' : undefined}
              className={`pb-4 ${tab === 'records' ? 'border-b-2 border-primary' : ''}`}
            >
              {t('arRecords')}
            </Link>
          </nav>
          {tab === 'records' ? (
            <>
              <h2 className='sr-only'>{t('arRecords')}</h2>
              <RecordList records={records} />
              <Pagination
                page={page}
                total={recordTotal}
                href={p => `${base}?tab=records&page=${p}`}
              />
            </>
          ) : (
            <>
              <h2 className='sr-only'>{t('arWorks')}</h2>
              {works.length ? (
                <div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-8'>
                  {works.map(work => (
                    <Link href={`/archive/artworks/${work.id}`} key={work.id} className='group'>
                      <div className='h-80 bg-muted border border-border p-6 group-hover:bg-secondary transition-colors'>
                        <ArchiveImage path={work.artwork_images[0]?.thumb_path} alt={work.title} />
                      </div>
                      <h3 className='font-serif text-lg mt-4'>
                        {language === 'en'
                          ? work.title_en || work.title
                          : work.title_hanja || work.title}
                      </h3>
                      <p className='mt-1 text-xs text-muted-foreground'>
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
                  ))}
                </div>
              ) : (
                <p className='py-16 text-muted-foreground'>{t('arNoWorks')}</p>
              )}
              <Pagination page={page} total={workTotal} href={p => `${base}?page=${p}`} />
            </>
          )}
        </section>
      </div>
    </>
  )
}
export function RecordList({ records }: { records: RecordEntry[] }) {
  const { t } = useLanguage()
  return records.length ? (
    <ol className='divide-y divide-border'>
      {records.map(record => (
        <li key={record.id} className='py-5 flex gap-6'>
          <span className='text-sm text-muted-foreground w-12 shrink-0'>{record.year || '—'}</span>
          <div>
            <p>{record.title}</p>
            <p className='text-sm text-muted-foreground mt-1'>
              {[record.organizer, record.award_level].filter(Boolean).join(' · ')}
            </p>
            <p className='text-xs mt-2'>
              {record.is_asca_verified ? t('arVerified') : t('arUnverified')}
            </p>
          </div>
        </li>
      ))}
    </ol>
  ) : (
    <p className='py-16 text-muted-foreground'>{t('arNoRecords')}</p>
  )
}

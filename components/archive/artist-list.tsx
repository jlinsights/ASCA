'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import type { ArtistCard } from '@/lib/archive/queries'
import { ArchiveImage, Pagination } from './common'
export function ArtistList({
  artists,
  total,
  page,
  filters,
}: {
  artists: ArtistCard[]
  total: number
  page: number
  filters: { q?: string; style?: string; grade?: string }
}) {
  const { t, metadata, language } = useLanguage()
  const href = (p: number) => {
    const s = new URLSearchParams({ ...filters, page: String(p) })
    return `/archive?${s}`
  }
  return (
    <>
      <header className='mb-10 max-w-3xl'>
        <p className='uppercase tracking-widest text-xs text-muted-foreground mb-4'>
          ASCA · Artist Archive
        </p>
        <h1 className='text-4xl md:text-5xl font-serif mb-6'>{t('arArtists')}</h1>
        <p className='text-muted-foreground leading-relaxed'>{t('arIntro')}</p>
      </header>
      <form action='/archive' className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 items-end'>
        <label className='text-sm'>
          {t('arSearch')}
          <input
            name='q'
            defaultValue={filters.q}
            maxLength={50}
            className='mt-2 w-full rounded-md border border-input bg-background p-3'
            placeholder={t('arSearchPlaceholder')}
          />
        </label>
        <label className='text-sm'>
          {t('arStyle')}
          <input
            name='style'
            defaultValue={filters.style}
            maxLength={50}
            className='mt-2 w-full rounded-md border border-input bg-background p-3'
            placeholder={t('arStyleHint')}
          />
        </label>
        <label className='text-sm'>
          {t('arGrade')}
          <input
            name='grade'
            defaultValue={filters.grade}
            maxLength={100}
            className='mt-2 w-full rounded-md border border-input bg-background p-3'
            placeholder={t('arAll')}
          />
        </label>
        <div className='flex gap-4 items-center'>
          <button className='rounded-md bg-primary text-primary-foreground px-6 py-3'>
            {t('arSearch')}
          </button>
          <Link href='/archive' className='text-sm underline'>
            {t('arReset')}
          </Link>
        </div>
      </form>
      <p role='status' className='mb-6 text-sm text-muted-foreground'>
        {t('arResults')} · {total.toLocaleString(metadata.locale)}
      </p>
      {artists.length ? (
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {artists.map(artist => {
            const name =
              language === 'en'
                ? artist.name_en || artist.name
                : language === 'ja'
                  ? artist.name_ja || artist.name
                  : language === 'zh'
                    ? artist.name_zh || artist.name
                    : artist.name
            const cover =
              artist.artworks[0]?.artwork_images[0]?.thumb_path || artist.profile_image_path
            return (
              <Link
                key={artist.id}
                href={`/archive/artists/${artist.id}`}
                className='group border border-border rounded-lg overflow-hidden bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring'
              >
                <div className='h-64 p-6 bg-muted group-hover:bg-secondary transition-colors'>
                  <ArchiveImage path={cover} alt={artist.art_name_ko || name} />
                </div>
                <div className='p-6'>
                  <h2 className='font-serif text-2xl'>
                    {artist.art_name_ko || name}{' '}
                    {artist.art_name_ko && (
                      <span className='font-sans text-sm text-muted-foreground'>{name}</span>
                    )}
                  </h2>
                  <p className='text-sm text-muted-foreground mt-3'>
                    {[artist.calligraphy_styles.join(' · '), artist.certification_grade]
                      .filter(Boolean)
                      .join(' / ') || t('arNoDetails')}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className='border-y border-border py-20 text-center'>
          <h2 className='font-serif text-2xl mb-4'>{t('arEmpty')}</h2>
          <p className='text-muted-foreground'>{t('arEmptyHint')}</p>
        </div>
      )}
      <Pagination page={page} total={total} href={href} />
    </>
  )
}

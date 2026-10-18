'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import type { Artist, RecordEntry } from '@/lib/archive/queries'
import { groupCareer, recordTypes, recordTypeKey, sourceKey } from '@/lib/archive/cv'

export function ArtistCv({
  artist,
  records,
  complete,
}: {
  artist: Artist
  records: RecordEntry[]
  complete: boolean
}) {
  const { t, language } = useLanguage()
  const [type, setType] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [printError, setPrintError] = useState(false)
  const groups = useMemo(
    () => groupCareer(records, type, verifiedOnly),
    [records, type, verifiedOnly]
  )
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
  async function print() {
    setPrinting(true)
    setPrintError(false)
    try {
      await document.fonts.ready
      window.print()
    } catch {
      setPrintError(true)
    } finally {
      setPrinting(false)
    }
  }
  return (
    <article className='archive-cv max-w-4xl mx-auto'>
      <div className='cv-controls space-y-6 mb-12'>
        <Link href={`/archive/artists/${artist.id}`} className='underline'>
          {t('axBackProfile')}
        </Link>
        <p className='text-sm text-muted-foreground'>{t('axPrintHint')}</p>
        <div className='flex flex-wrap items-end gap-6'>
          <label className='text-sm'>
            {t('axRecordType')}
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className='block mt-2 rounded-md border border-input bg-background p-3'
            >
              <option value='all'>{t('arAll')}</option>
              {recordTypes.map(value => (
                <option key={value} value={value}>
                  {t(recordTypeKey(value))}
                </option>
              ))}
            </select>
          </label>
          <label className='flex gap-3 items-center py-3 text-sm'>
            <input
              type='checkbox'
              checked={verifiedOnly}
              onChange={e => setVerifiedOnly(e.target.checked)}
            />
            {t('axVerifiedOnly')}
          </label>
          <button
            type='button'
            disabled={!complete || printing}
            onClick={() => void print()}
            className='rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm disabled:opacity-50'
          >
            {t('axPrint')}
          </button>
        </div>
        {!complete && <p role='alert'>{t('axIncomplete')}</p>}
        {printError && <p role='alert'>{t('axPrintFailed')}</p>}
      </div>
      <div className='border-b border-border pb-8 mb-8 cv-heading'>
        <p className='text-sm text-muted-foreground mb-4'>ASCA · {t('axCv')}</p>
        <h1 className='font-serif text-4xl leading-tight break-words'>{name}</h1>
        <p className='font-serif text-xl mt-4'>
          {[artist.art_name_ko, artist.art_name_hanja].filter(Boolean).join(' · ')}
        </p>
        <p className='mt-4 text-sm'>
          {[artist.branch_name, ...artist.calligraphy_styles].filter(Boolean).join(' · ')}
        </p>
        {bio && (
          <p
            className='mt-6 leading-loose whitespace-pre-line'
            lang={language === 'en' && artist.archive_bio_en ? 'en' : 'ko'}
          >
            {bio}
          </p>
        )}
        <p className='mt-6 text-sm text-muted-foreground'>{t('axCvDisclaimer')}</p>
        <p className='mt-4 text-sm'>
          {t('axRecordType')}: {t(type === 'all' ? 'arAll' : recordTypeKey(type))}
          {' · '}
          {t(verifiedOnly ? 'axVerifiedOnly' : 'axAllVerification')}
        </p>
      </div>
      {groups.length ? (
        groups.map(([year, entries]) => (
          <section key={year || 'undated'} className='cv-year mb-10'>
            <h2 className='font-serif text-2xl mb-4'>{year || t('axUndated')}</h2>
            <ol className='divide-y divide-border'>
              {entries.map(entry => (
                <li key={entry.id} className='cv-entry py-4'>
                  <p className='text-xs text-muted-foreground mb-2'>
                    {t(recordTypeKey(entry.record_type))}
                  </p>
                  <h3 className='text-lg font-medium break-words'>{entry.title}</h3>
                  <p className='text-sm mt-2'>
                    {[entry.organizer, entry.award_level].filter(Boolean).join(' · ')}
                  </p>
                  <p className='text-xs mt-3'>
                    {t(entry.is_asca_verified ? 'arVerified' : 'arUnverified')}
                    {' · '}
                    {t(sourceKey(entry.source))}
                  </p>
                  {entry.artwork_id && (
                    <Link
                      href={`/archive/artworks/${entry.artwork_id}`}
                      className='cv-controls inline-block mt-3 text-sm underline'
                    >
                      {t('axRelatedWork')}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))
      ) : (
        <p className='py-8'>{t('arNoRecords')}</p>
      )}
      <p className='text-xs mt-12 border-t border-border pt-4'>ASCA · orientalcalligraphy.org</p>
    </article>
  )
}

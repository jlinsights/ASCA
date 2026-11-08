'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { PageHero, type PageHeroStat } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS, type PageHeroKey } from '@/components/layout/page-hero-marks'
import { useLanguage } from '@/contexts/language-context'
import type { ExhibitionRecords } from '../_data/exhibition-records'
import {
  exhibitionToday,
  getExhibitionListings,
  type ExhibitionSource,
} from '../_data/exhibition-listings'
import { ExhibitionListingCard } from './exhibition-listing-card'
import { ExhibitionServices } from './exhibition-services'
import { ExhibitionPromotionPreview, IndustryAdvertisement } from './exhibition-promotion-preview'
import styles from './exhibition-records.module.css'

type Variant = keyof ExhibitionRecords
const VARIANTS: Record<
  Variant,
  { mark: PageHeroKey; titleKey: string; ledeKey: string; emptyKey: string }
> = {
  all: {
    mark: 'exhibitions',
    titleKey: 'exhibition',
    ledeKey: 'exPageLede',
    emptyKey: 'exPageEmptyTitle',
  },
  current: {
    mark: 'exhibitionsCurrent',
    titleKey: 'exCurrentTitle',
    ledeKey: 'exCurrentLede',
    emptyKey: 'exCurrentEmpty',
  },
  upcoming: {
    mark: 'exhibitionsUpcoming',
    titleKey: 'exUpcomingTitle',
    ledeKey: 'exUpcomingLede',
    emptyKey: 'exUpcomingEmpty',
  },
  past: {
    mark: 'exhibitionsPast',
    titleKey: 'exPastTitle',
    ledeKey: 'exPastLede',
    emptyKey: 'exPastEmpty',
  },
  online: {
    mark: 'exhibitionsOnline',
    titleKey: 'exOnlineTitle',
    ledeKey: 'exOnlineLede',
    emptyKey: 'exOnlineEmpty',
  },
}
const PAGE_SIZE = 6

export function ExhibitionRecordsPage({
  variant,
  today = exhibitionToday(),
}: {
  variant: Variant
  today?: string
}) {
  const { t, language } = useLanguage()
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<'all' | ExhibitionSource>('all')
  const [year, setYear] = useState('all')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const config = VARIANTS[variant]
  const listings = getExhibitionListings(language, today)
  const records = listings.filter(
    item => variant === 'all' || (variant === 'online' ? item.online : item.status === variant)
  )
  if (variant === 'upcoming') records.reverse()
  const years = [...new Set(records.map(item => item.year))].sort((a, b) => b - a)
  const term = query.trim().toLocaleLowerCase()
  const filtered = records.filter(
    item =>
      (source === 'all' || item.source === source) &&
      (year === 'all' || String(item.year) === year) &&
      [item.title, item.subtitle, item.venue, item.organizer]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()
        .includes(term)
  )
  const shown = filtered.slice(0, limit)
  const [featured, ...rest] = shown
  const hasFilters = Boolean(term || source !== 'all' || year !== 'all')
  const ledger: PageHeroStat[] = [{ label: t('exLedgerCount'), value: records.length }]
  if (years.length)
    ledger.push({
      label: t('exLedgerYears'),
      value: years.length === 1 ? years[0] : `${years.at(-1)}–${years[0]}`,
    })
  function reset() {
    setQuery('')
    setSource('all')
    setYear('all')
    setLimit(PAGE_SIZE)
  }

  return (
    <div className={styles.root}>
      <PageHero
        {...PAGE_HERO_MARKS[config.mark]}
        title={t(config.titleKey)}
        lede={t(config.ledeKey)}
        ledger={ledger}
        actions={
          <a href='#exhibition-services' className={styles.heroCta}>
            {t('exPromotionCta')}
            <ArrowUpRight aria-hidden='true' />
          </a>
        }
      />
      <div className={styles.frame}>
        <nav className={styles.tabs} aria-label={t('exBrowseLabel')}>
          {(['current', 'upcoming', 'past'] as const).map(tab => (
            <Link
              key={tab}
              href={`/exhibitions/${tab}`}
              aria-current={variant === tab ? 'page' : undefined}
            >
              {t(`exTab${tab[0]!.toUpperCase()}${tab.slice(1)}`)}
              <span>{listings.filter(item => item.status === tab).length}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.mainGrid}>
          <section aria-labelledby='ex-list-title' className={styles.listSection}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>{t('exDiscoverEyebrow')}</p>
                <h2 id='ex-list-title'>{t('exDiscoverTitle')}</h2>
              </div>
              <span aria-live='polite' className={styles.resultCount}>
                {t('exResultsCount').replace('{n}', String(filtered.length))}
              </span>
            </div>
            <div className={styles.filters}>
              <div className={styles.search}>
                <Search aria-hidden='true' />
                <label htmlFor='ex-search' className='sr-only'>
                  {t('exSearchLabel')}
                </label>
                <input
                  id='ex-search'
                  type='search'
                  placeholder={t('exPageSearchPlaceholder')}
                  value={query}
                  onChange={event => {
                    setQuery(event.target.value)
                    setLimit(PAGE_SIZE)
                  }}
                />
              </div>
              <label className={styles.filterLabel}>
                <span className='sr-only'>{t('exSourceFilter')}</span>
                <select
                  value={source}
                  onChange={event => {
                    setSource(event.target.value as typeof source)
                    setLimit(PAGE_SIZE)
                  }}
                >
                  <option value='all'>{t('exSourceAll')}</option>
                  <option value='association'>{t('exSourceAssociation')}</option>
                  <option value='external'>{t('exSourceExternal')}</option>
                </select>
              </label>
              <label className={styles.filterLabel}>
                <span className='sr-only'>{t('exYearFilter')}</span>
                <select
                  value={year}
                  onChange={event => {
                    setYear(event.target.value)
                    setLimit(PAGE_SIZE)
                  }}
                >
                  <option value='all'>{t('exAllYears')}</option>
                  {years.map(value => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className={styles.catalogNote}>{t('exCatalogNote')}</p>
            {featured ? (
              <>
                <ExhibitionListingCard item={featured} featured />
                <div className={styles.recordList}>
                  {rest.map(item => (
                    <ExhibitionListingCard key={item.id} item={item} />
                  ))}
                </div>
                {limit < filtered.length && (
                  <button
                    type='button'
                    className={styles.moreButton}
                    onClick={() => setLimit(value => value + PAGE_SIZE)}
                  >
                    {t('exLoadMore')}
                    <ArrowRight aria-hidden='true' />
                  </button>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                <span aria-hidden='true' className={styles.emptyMark}>
                  展
                </span>
                <h3>{t(hasFilters ? 'exNoMatches' : config.emptyKey)}</h3>
                <p>{t(hasFilters ? 'exPageEmptyDesc' : 'exEmptyHint')}</p>
                {hasFilters ? (
                  <button type='button' onClick={reset}>
                    {t('exResetFilters')}
                  </button>
                ) : (
                  <Link href='/exhibitions/past'>
                    {t('exSeePast')}
                    <ArrowRight aria-hidden='true' />
                  </Link>
                )}
              </div>
            )}
            {records.length === 0 && (
              <ExhibitionPromotionPreview
                hasPaidListings={listings.some(item => item.paidPromotion)}
              />
            )}
            <p className={styles.archiveLink}>
              <Link href='/history'>
                {t('exSeeHistory')}
                <ArrowUpRight aria-hidden='true' />
              </Link>
            </p>
          </section>
          <aside className={styles.sidebar} aria-label={t('exSupportLabel')}>
            <div className={styles.invitation}>
              <span className={styles.invitationMark} aria-hidden='true'>
                傳
              </span>
              <p className={styles.eyebrow}>{t('exInviteEyebrow')}</p>
              <h2>{t('exInviteTitle')}</h2>
              <p>{t('exInviteBody')}</p>
              <a href='#exhibition-services'>
                {t('exExploreServices')}
                <ArrowUpRight aria-hidden='true' />
              </a>
            </div>
            <IndustryAdvertisement compact />
          </aside>
        </div>
        {records.length > 0 && (
          <ExhibitionPromotionPreview hasPaidListings={listings.some(item => item.paidPromotion)} />
        )}
        <IndustryAdvertisement />
        <ExhibitionServices />
      </div>
      <LayoutFooter />
    </div>
  )
}

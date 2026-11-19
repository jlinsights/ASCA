'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { useLocalizedHref } from '@/lib/i18n/use-locale-path'
import type { ExhibitionListing } from '../_data/exhibition-listings'
import styles from './exhibition-records.module.css'

export function ExhibitionListingCard({
  item,
  featured = false,
}: {
  item: ExhibitionListing
  featured?: boolean
}) {
  const { t } = useLanguage()
  const localHref = useLocalizedHref()
  const title = (
    <>
      {item.title}
      {item.href && <ArrowUpRight aria-hidden='true' />}
    </>
  )
  return (
    <article className={`${styles.listing} ${featured ? styles.featured : ''}`}>
      <div className={styles.poster}>
        {item.poster ? (
          <Image
            src={item.poster}
            alt={t('exPosterAlt').replace('{title}', item.title)}
            fill
            sizes={featured ? '(max-width: 700px) 80vw, 340px' : '(max-width: 700px) 104px, 150px'}
            className={styles.posterImage}
            priority={featured}
          />
        ) : (
          <div className={styles.posterType} aria-hidden='true'>
            <span>展</span>
            <small>{item.year}</small>
          </div>
        )}
      </div>
      <div className={styles.listingBody}>
        <div className={styles.badges}>
          <span className={styles.source}>
            {t(item.source === 'external' ? 'exSourceExternal' : 'exSourceAssociation')}
          </span>
          <span>{t(`exStatus${item.status[0]!.toUpperCase()}${item.status.slice(1)}`)}</span>
          {item.paidPromotion && <span className={styles.paid}>{t('exPaidPromotion')}</span>}
        </div>
        <h3>{item.href ? <Link href={localHref(item.href)}>{title}</Link> : title}</h3>
        {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
        <dl className={styles.details}>
          <div>
            <dt>
              <CalendarDays aria-hidden='true' />
              <span className='sr-only'>{t('exDateLabel')}</span>
            </dt>
            <dd>{item.date}</dd>
          </div>
          {item.venue && (
            <div>
              <dt>
                <MapPin aria-hidden='true' />
                <span className='sr-only'>{t('exVenueLabel')}</span>
              </dt>
              <dd>{item.venue}</dd>
            </div>
          )}
          {item.organizer && (
            <div>
              <dt>{t('exOrganizerLabel')}</dt>
              <dd>{item.organizer}</dd>
            </div>
          )}
        </dl>
        {item.href && (
          <Link href={localHref(item.href)} className={styles.textLink}>
            {t('exVisitDetails')}
            <ArrowUpRight aria-hidden='true' />
            <span className='sr-only'> — {item.title}</span>
          </Link>
        )}
      </div>
    </article>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { useLocalizedHref } from '@/lib/i18n/use-locale-path'
import styles from './exhibition-records.module.css'

export function ExhibitionPromotionPreview({ hasPaidListings }: { hasPaidListings: boolean }) {
  const { t } = useLanguage()
  const localHref = useLocalizedHref()
  return (
    <section aria-labelledby='ex-preview-title' className={styles.preview}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>{t('exPreviewEyebrow')}</p>
          <h2 id='ex-preview-title'>{t('exPreviewTitle')}</h2>
        </div>
        <a href='#exhibition-services' className={styles.textLink}>
          {t('exPromotionCta')}
          <ArrowUpRight aria-hidden='true' />
        </a>
      </div>
      <p className={styles.previewNote}>
        {t(hasPaidListings ? 'exPreviewNote' : 'exPreviewNoAds')}
      </p>
      <div className={styles.previewGrid}>
        {(['Solo', 'Group', 'Digital'] as const).map((kind, index) => (
          <article key={kind} className={styles.previewCard}>
            <div className={styles.previewPoster}>
              <Image
                src={`/images/exhibitions/promotion-demo-${index + 1}.png`}
                alt={t(`exMock${kind}Alt`)}
                fill
                sizes='(max-width: 600px) 90vw, (max-width: 1000px) 30vw, 360px'
                className={styles.posterImage}
              />
              <span className={styles.mockBadge}>{t('exMockLabel')}</span>
            </div>
            <p>{t(`exMock${kind}Type`)}</p>
            <h3>{t(`exMock${kind}Title`)}</h3>
            <Link
              href={localHref(
                `/contact?topic=exhibition&about=${encodeURIComponent(t(`exMock${kind}Type`))}#inquiry`
              )}
            >
              {t('exMockCta')}
              <ArrowUpRight aria-hidden='true' />
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export function IndustryAdvertisement({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage()
  const localHref = useLocalizedHref()
  return (
    <section
      aria-label={t('exAdAreaLabel')}
      className={compact ? styles.adCompact : styles.adBanner}
    >
      <div>
        <span className={styles.adLabel}>{t('exAdMockLabel')}</span>
        <p className={styles.adTitle}>{t(compact ? 'exAdCompactTitle' : 'exAdTitle')}</p>
        <p className={styles.adBody}>{t(compact ? 'exAdCompactBody' : 'exAdBody')}</p>
      </div>
      <div className={styles.adAction}>
        <Link
          href={localHref(
            `/contact?topic=other&about=${encodeURIComponent(t('exAdSubject'))}#inquiry`
          )}
        >
          {t('exAdCta')}
          <ArrowUpRight aria-hidden='true' />
        </Link>
        {!compact && <small>{t('exAdNote')}</small>}
      </div>
    </section>
  )
}

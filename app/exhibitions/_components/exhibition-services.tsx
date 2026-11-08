'use client'

import Link from 'next/link'
import { ArrowUpRight, Camera, BookOpen, PanelsTopLeft, Megaphone } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import styles from './exhibition-records.module.css'

export function ExhibitionServices() {
  const { t } = useLanguage()
  const services = [
    { id: 'Listing', icon: Megaphone },
    { id: 'Record', icon: Camera },
    { id: 'Catalog', icon: BookOpen },
    { id: 'Page', icon: PanelsTopLeft },
  ] as const
  const consultation = (subject: string) =>
    `/contact?topic=exhibition&about=${encodeURIComponent(subject)}#inquiry`
  return (
    <section
      id='exhibition-services'
      aria-labelledby='ex-services-title'
      className={styles.services}
    >
      <div className={styles.serviceIntro}>
        <p className={styles.eyebrow}>{t('exServiceEyebrow')}</p>
        <h2 id='ex-services-title'>{t('exServiceTitle')}</h2>
        <p>{t('exServiceLede')}</p>
        <Link href={consultation(t('exConsultSubject'))} className={styles.serviceCta}>
          {t('exConsultCta')}
          <ArrowUpRight aria-hidden='true' />
        </Link>
        <p className={styles.serviceNote}>{t('exServicePaidNote')}</p>
      </div>
      <div className={styles.serviceOptions}>
        {services.map(({ id, icon: Icon }, index) => (
          <Link
            key={id}
            href={consultation(t(`exService${id}Title`))}
            className={styles.serviceOption}
          >
            <span className={styles.serviceNumber}>0{index + 1}</span>
            <div>
              <h3>
                <Icon aria-hidden='true' />
                {t(`exService${id}Title`)}
              </h3>
              <p>{t(`exService${id}Body`)}</p>
            </div>
            <ArrowUpRight aria-hidden='true' />
          </Link>
        ))}
      </div>
      <ol className={styles.process} aria-label={t('exServiceProcess')}>
        {['Brief', 'Quote', 'Publish'].map((step, index) => (
          <li key={step}>
            <span>0{index + 1}</span>
            <div>
              <strong>{t(`exStep${step}`)}</strong>
              <p>{t(`exStep${step}Body`)}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.fundingNote}>{t('exFundingNote')}</p>
      <p className={styles.serviceTerms}>{t('exServiceTerms')}</p>
    </section>
  )
}

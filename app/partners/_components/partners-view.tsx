'use client'

import { ArrowUpRight } from 'lucide-react'
import { AboutChapter, AboutHero } from '@/components/about/about-layout'
import { AboutMarquee } from '@/components/about/about-marquee'
import { AboutNav } from '@/components/about/about-nav'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { useLanguage } from '@/contexts/language-context'
import { MARQUEE_NAMES, PARTNER_CATEGORIES, PARTNER_COUNT } from './partners-data'

/** 유관단체 화면 틀 — 고른 언어로. 기관 이름은 고유명사라 원문 그대로 둔다 */
export function PartnersView() {
  const { t } = useLanguage()
  const count = (key: string, n: number) => t(key).replace('{n}', String(n))

  return (
    <>
      <AboutHero
        tc={PAGE_HERO_MARKS.partners.tc}
        eyebrow={`ASCA · ${t('siteNavAboutShort')}`}
        title={t('partnersTitle')}
        lede={t('partnersLede')}
        facts={[
          {
            label: t('partnersFactCategories'),
            value: count('partnersCategoryCount', PARTNER_CATEGORIES.length),
          },
          { label: t('partnersFactListed'), value: count('partnersOrgCount', PARTNER_COUNT) },
        ]}
      />
      <AboutNav />
      <AboutMarquee
        names={MARQUEE_NAMES}
        label={t('partnersMarqueeLabel')}
        pauseLabel={t('partnersMarqueePause')}
        playLabel={t('partnersMarqueePlay')}
      />
      <AboutChapter
        id='partners'
        tone='gold'
        tc='同行'
        eyebrow='Partners · Institutions · Media'
        title={t('partnersChapterTitle')}
        note={t('partnersChapterNote')}
      >
        {PARTNER_CATEGORIES.map(category => (
          <section
            key={category.id}
            id={category.id}
            className='ab-links__group'
            aria-labelledby={`${category.id}-title`}
          >
            <h3 id={`${category.id}-title`} className='ab-links__title'>
              {t(`partnersCat_${category.id}`)}
              <span>{count('partnersOrgCount', category.partners.length)}</span>
            </h3>
            <ul className='ab-links'>
              {category.partners.map(partner => (
                <li key={`${category.id}-${partner.name}`} data-reveal>
                  {partner.url ? (
                    <a
                      href={partner.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='ab-link'
                    >
                      {partner.name}
                      <ArrowUpRight aria-hidden='true' className='ab-link__arrow' />
                      <span className='sr-only'>{t('partnersNewWindow')}</span>
                    </a>
                  ) : (
                    <span className='ab-link'>{partner.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </AboutChapter>
    </>
  )
}

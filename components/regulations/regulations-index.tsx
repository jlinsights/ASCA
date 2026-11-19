'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { regulationHref } from '@/lib/regulations/catalog'
import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { RegulationsContact } from './regulations-contact'

export interface RegulationSummary {
  slug: string
  legacyId: string
  nameKey: string
  hanja: string
  title: string
  titleEn: string
  effectiveNote: string
  articleCount: number
}

interface RegulationsIndexProps {
  regulations: RegulationSummary[]
  totalArticles: number
  /** '2026. 2. 13.' — 시행 표기 중 가장 늦은 날 */
  latestEffective: string
}

export function RegulationsIndex({
  regulations,
  totalArticles,
  latestEffective,
}: RegulationsIndexProps) {
  const { t, language } = useLanguage()

  return (
    <div className='asca-regs'>
      <PageHero
        {...PAGE_HERO_MARKS.regulations}
        title={t('regsHeroTitle')}
        lede={t('regsHeroLede')}
        ledger={[
          { label: t('regsStatRegulations'), value: regulations.length },
          { label: t('regsStatArticles'), value: totalArticles },
          { label: t('regsStatLatest'), value: <span lang='ko'>{latestEffective}</span> },
        ]}
      >
        {language !== 'ko' && <p className='asca-regs-lang-note'>{t('regsTranslationNote')}</p>}
      </PageHero>

      <section className='asca-regs-index' aria-labelledby='regs-index-title'>
        <h2 id='regs-index-title' className='sr-only'>
          {t('regsIndexTitle')}
        </h2>
        <ol className='asca-regs-index__list'>
          {regulations.map((regulation, index) => (
            // 옛 단일 페이지의 #앵커가 리다이렉트로 넘어오면 해당 줄에 닿는다
            <li key={regulation.slug} id={regulation.legacyId} className='asca-regs-row'>
              <Link href={regulationHref(regulation.slug)} className='asca-regs-row__link'>
                <span className='asca-regs-row__num' aria-hidden='true'>
                  {String(index).padStart(2, '0')}
                </span>
                <span className='asca-regs-row__main'>
                  <span className='asca-regs-row__name'>{t(regulation.nameKey)}</span>
                  {language !== 'ko' && (
                    <span className='asca-regs-row__ko' lang='ko'>
                      {regulation.title}
                    </span>
                  )}
                  <span className='asca-regs-row__note' lang='ko'>
                    {regulation.effectiveNote || t('regsNoEffective')}
                  </span>
                </span>
                <span className='asca-regs-row__count'>
                  {regulation.articleCount > 0
                    ? `${regulation.articleCount}${t('regsArticlesUnit')}`
                    : t('regsNoArticles')}
                </span>
                <span className='asca-regs-row__hanja tc' aria-hidden='true'>
                  {regulation.hanja}
                </span>
                <ArrowRight className='asca-regs-row__arrow' aria-hidden='true' />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <RegulationsContact />
    </div>
  )
}

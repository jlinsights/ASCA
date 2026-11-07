'use client'

import { useMemo } from 'react'
import { ListChecks, PenLine } from 'lucide-react'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { SiteFaqList } from '@/components/faq/site-faq-list'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  LedgerTable,
  RegCite,
} from '@/components/apply/apply-parts'
import { TallyEmbed } from '@/components/apply/tally-embed'
import { CONTACT_LABELS } from '@/app/contests/_components/contest-i18n'
import { localizeMembership } from '@/app/membership/_components/membership-copy'
import { useLanguage } from '@/contexts/language-context'
import type { Language } from '@/lib/i18n/types'

const TALLY_FORM_ID = 'w59jeo'

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

/**
 * 추천·초대작가 신청 화면 — 고른 언어로. 배점·요건·심사 절차·특별선임 비용은 /membership 과 같은
 * 데이터(membership-data.ts)와 같은 번역 키(mb.*)를 쓴다. 이 화면의 틀 글자만 rc.ui.* 다.
 */
export function RecommendedView() {
  const { t, language } = useLanguage() as { t: (key: string) => string; language: Language }
  const ui = (name: string) => t(`rc.ui.${name}`)
  const copy = useMemo(() => localizeMembership(key => t(key)), [t])
  const { src } = copy

  const toc = [
    { href: '#apply', label: ui('tocApply') },
    { href: '#criteria', label: ui('tocCriteria') },
    { href: '#review', label: ui('tocReview') },
    { href: '#special', label: ui('tocSpecial') },
    { href: '#faq', label: ui('tocFaq') },
    { href: '#contact', label: ui('tocContact') },
  ] as const

  return (
    <>
      <PageHero
        {...PAGE_HERO_MARKS.recommendedApplication}
        title={ui('heroTitle')}
        lede={ui('heroLede')}
        actions={
          <>
            <a
              href='#apply'
              className={`${heroAction} bg-foreground text-background hover:opacity-90`}
            >
              <PenLine className='h-4 w-4' aria-hidden='true' />
              {ui('heroOnline')}
            </a>
            <a href='#criteria' className={`${heroAction} border hover:bg-muted`}>
              <ListChecks className='h-4 w-4' aria-hidden='true' />
              {ui('heroCriteria')}
            </a>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: ui('factRecommended'), value: ui('factRecommendedValue') },
            { label: ui('factInvited'), value: ui('factInvitedValue') },
            { label: ui('factReview'), value: ui('factReviewValue') },
            { label: ui('factSpecial'), value: ui('factSpecialValue') },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={toc} label={ui('tocLabel')} />

        <section id='apply' aria-labelledby='apply-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='apply-title'
            eyebrow={ui('applyEyebrow')}
            title={ui('applyTitle')}
            lede={ui('applyLede')}
          />
          <div className='asca-apply__form'>
            <div className='asca-apply__form-head'>
              <h3 className='asca-apply__form-title'>{ui('formTitle')}</h3>
            </div>
            <TallyEmbed
              formId={TALLY_FORM_ID}
              title={ui('formFrameTitle')}
              initialHeight={699}
              labels={{
                fallback: ui('formFallback'),
                openNew: ui('formOpenNew'),
                newWindow: ui('newWindow'),
              }}
            />
          </div>
        </section>

        <section id='criteria' aria-labelledby='criteria-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='criteria-title'
            eyebrow={ui('criteriaEyebrow')}
            title={ui('criteriaTitle')}
            lede={copy.scoreNote}
          />
          <div className='asca-apply__split'>
            <div>
              <LedgerTable
                caption={ui('scoringCaption')}
                columns={[{ label: ui('colAward') }, { label: ui('colPoints'), numeric: true }]}
                rows={copy.scoring.map(row => ({
                  cells: [row.award, ui('pointsValue').replace('{n}', String(row.points))],
                }))}
              />
              <ul className='asca-apply__dash-list mt-6'>
                {copy.scoringRules.map(rule => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
            <div>
              <LedgerTable
                caption={ui('bandsCaption')}
                columns={[{ label: ui('colTotal') }, { label: ui('colLevel') }]}
                rows={copy.bands.map(band => ({
                  cells: [band.range, band.level],
                  lead: band.emphasis,
                }))}
              />
              <h3 className='asca-apply__subhead mt-8'>{ui('requiredTitle')}</h3>
              <ul className='asca-apply__dash-list'>
                {copy.required.map(condition => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
              <p className='asca-apply__note'>{ui('requiredNote')}</p>
            </div>
          </div>
          <RegCite
            sources={[src.select2, src.select3, src.select4, src.select9]}
            label={ui('cite')}
          />
        </section>

        <section id='review' aria-labelledby='review-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='review-title'
            eyebrow={ui('reviewEyebrow')}
            title={ui('reviewTitle')}
          />
          <ol className='asca-apply__numbered'>
            {copy.review.map(step => (
              <li key={step}>
                <div>
                  <span>{step}</span>
                </div>
              </li>
            ))}
          </ol>
          <RegCite sources={[src.select8]} label={ui('cite')} />
        </section>

        <section id='special' aria-labelledby='special-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='special-title'
            eyebrow={ui('specialEyebrow')}
            title={ui('specialTitle')}
            lede={copy.specialLede}
          />
          <div className='asca-apply__split'>
            <div>
              <h3 className='asca-apply__subhead'>{ui('specialEligible')}</h3>
              <ul className='asca-apply__dash-list'>
                {copy.specialEligible.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3 className='asca-apply__subhead mt-8'>{ui('specialSteps')}</h3>
              <ol className='asca-apply__numbered'>
                {copy.specialSteps.map(step => (
                  <li key={step}>
                    <div>
                      <span>{step}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <LedgerTable
                caption={ui('specialCaption')}
                columns={copy.specialColumns.map((label, index) => ({
                  label,
                  numeric: index > 0,
                }))}
                rows={copy.specialFees}
              />
              <dl className='asca-apply__defs mt-6'>
                {copy.specialCases.map(fact => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <RegCite sources={[src.select11, src.dues3, src.articles5]} label={ui('cite')} />
        </section>

        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead id='faq-title' eyebrow={ui('faqEyebrow')} title={ui('faqTitle')} />
          <SiteFaqList ids={['artist-selection', 'special-appointment']} />
        </section>

        <section id='contact' aria-labelledby='contact-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='contact-title'
            eyebrow={ui('contactEyebrow')}
            title={ui('contactTitle')}
            lede={ui('contactLede')}
          />
          <ContactList labels={CONTACT_LABELS[language]} />
        </section>
      </div>
    </>
  )
}

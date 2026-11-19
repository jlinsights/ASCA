'use client'

import { useMemo } from 'react'
import { BookOpen, PenLine } from 'lucide-react'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { CONTEST_FLIPBOOK_URL, ContestFlipbook } from '@/components/contests/contest-flipbook'
import { SiteFaqList } from '@/components/faq/site-faq-list'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  DownloadList,
  LedgerTable,
  RegCite,
} from '@/components/apply/apply-parts'
import { TallyEmbed } from '@/components/apply/tally-embed'
import { CONTACT_LABELS } from '@/app/contests/_components/contest-i18n'
import { useLanguage } from '@/contexts/language-context'
import { OFFICE, formatAddress } from '@/lib/content/contact-info'
import type { Language } from '@/lib/i18n/types'
import { ENTRY_FAQ_IDS, ENTRY_TALLY_FORM_ID, PODCAST_EMBED } from './application-data'
import { localizeApplication } from './application-copy'
import { localizeAwards } from './award-copy'

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

/** 출품원서 화면 — 고른 언어로. 금액·규격·배점의 원본은 application-data.ts(한국어) 하나다 */
export function ApplicationView() {
  const { t, language } = useLanguage() as { t: (key: string) => string; language: Language }
  const ui = (name: string) => t(`ap.ui.${name}`)
  const copy = useMemo(() => localizeApplication(key => t(key)), [t])
  const { awards, sources: awardSources } = useMemo(() => localizeAwards(key => t(key)), [t])

  const toc = [
    { href: '#apply', label: ui('tocApply') },
    { href: '#guide', label: ui('tocGuide') },
    { href: '#divisions', label: ui('tocDivisions') },
    { href: '#fees', label: ui('tocFees') },
    { href: '#judging', label: ui('tocJudging') },
    { href: '#awards', label: ui('tocAwards') },
    { href: '#faq', label: ui('tocFaq') },
    { href: '#contact', label: ui('tocContact') },
  ] as const

  const [flipPre, flipPost = ''] = ui('flipBody').split('{pages}')
  const steps = [1, 2, 3, 4] as const

  return (
    <>
      <PageHero
        {...PAGE_HERO_MARKS.application}
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
            <a href='#guide' className={`${heroAction} border hover:bg-muted`}>
              <BookOpen className='h-4 w-4' aria-hidden='true' />
              {ui('heroGuide')}
            </a>
          </>
        }
      >
        <HeroFacts
          facts={[
            {
              label: ui('factDivisions'),
              value: ui('factDivisionsValue').replace('{n}', String(copy.divisions.length)),
            },
            {
              label: ui('factSizes'),
              value: ui('factSizesValue').replace('{n}', String(copy.sizes.length)),
            },
            { label: ui('factTopPrize'), value: t('aw.ui.factTopPrizeValue') },
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
              <h3 className='asca-apply__form-title'>
                {ui('formTitle')}
                <small>{ui('formRecommended')}</small>
              </h3>
              <p className='asca-apply__form-hint'>
                <span lang='ko'>한국어</span> · <span lang='zh-Hant'>中文</span> ·{' '}
                <span lang='ja'>日本語</span> · <span lang='en'>English</span>
              </p>
            </div>
            <TallyEmbed
              formId={ENTRY_TALLY_FORM_ID}
              title={ui('formFrameTitle')}
              initialHeight={720}
              labels={{
                fallback: ui('formFallback'),
                openNew: ui('formOpenNew'),
                newWindow: ui('newWindow'),
              }}
            />
          </div>
          <DownloadList items={copy.downloads} newWindow={ui('newWindow')} />
          {/* 공모요강 플립북 5~7쪽에 출품원서 양식이 들어 있다 — 플립북에서 내려받거나 바로 인쇄할 수 있다 (2026-10-31) */}
          <p className='asca-apply__flipnote'>
            <strong>{ui('flipTitle')}</strong>
            {flipPre}
            <b>{ui('flipPages')}</b>
            {flipPost}
            <span className='asca-apply__flipnote-links'>
              <a href='#guide'>{ui('flipBelow')}</a>
              <a href={CONTEST_FLIPBOOK_URL} target='_blank' rel='noopener noreferrer'>
                {ui('flipOpen')}
                <span className='sr-only'>{ui('newWindow')}</span>
              </a>
            </span>
          </p>
          <p className='asca-apply__sendto'>
            <strong>{ui('sendTo').replace('{office}', ui('office'))}</strong>
            <span lang='ko'>{formatAddress(OFFICE)}</span>
            <br />
            {ui('sendToNote')}
          </p>
        </section>

        <section id='guide' aria-label={ui('guideLabel')} className='asca-apply__anchor'>
          <ContestFlipbook />
        </section>

        <section id='divisions' aria-labelledby='divisions-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='divisions-title'
            eyebrow={ui('divisionsEyebrow')}
            title={ui('divisionsTitle')}
            lede={ui('divisionsLede')}
          />
          <ul className='asca-apply__divisions'>
            {copy.divisions.map(division => (
              <li key={division.mark} className='asca-apply__division'>
                <span
                  className='asca-apply__division-mark'
                  aria-hidden='true'
                  lang={/[가-힣]/.test(division.mark) ? 'ko' : undefined}
                >
                  {division.mark}
                </span>
                <h3 className='asca-apply__division-title'>{division.title}</h3>
                <p className='asca-apply__division-body'>{division.body}</p>
              </li>
            ))}
          </ul>
          <dl className='asca-apply__sizes'>
            {copy.sizes.map(size => (
              <div key={size.size} className='asca-apply__size'>
                <dt>{size.name}</dt>
                <dd>{size.size}</dd>
              </div>
            ))}
          </dl>
          <RegCite sources={copy.divisionSources} label={ui('cite')} />
        </section>

        <section id='fees' aria-labelledby='fees-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='fees-title'
            eyebrow={ui('feesEyebrow')}
            title={ui('feesTitle')}
            lede={ui('feesLede')}
          />
          <div className='asca-apply__split'>
            <div>
              <LedgerTable
                caption={ui('entryCaption')}
                columns={[
                  { label: ui('colGrade') },
                  { label: ui('colFirst'), numeric: true },
                  { label: ui('colNext'), numeric: true },
                ]}
                rows={copy.entryFees}
              />
              <p className='asca-apply__note'>{ui('entryNote')}</p>
            </div>
            <div>
              <LedgerTable
                caption={ui('framingCaption')}
                columns={[
                  { label: ui('colSize') },
                  { label: ui('colNonMember'), numeric: true },
                  { label: ui('colMember'), numeric: true },
                ]}
                rows={copy.framingFees}
              />
              <p className='asca-apply__note'>{ui('framingNote')}</p>
            </div>
          </div>
          <RegCite sources={copy.feeSources} label={ui('cite')} />
        </section>

        <section id='judging' aria-labelledby='judging-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='judging-title'
            eyebrow={ui('judgingEyebrow')}
            title={ui('judgingTitle')}
            lede={ui('judgingLede')}
          />
          <ul className='asca-apply__criteria'>
            {copy.criteria.map(criterion => (
              <li key={criterion.han} className='asca-apply__criterion'>
                <h3 className='asca-apply__criterion-name'>
                  {criterion.name}
                  <span className='asca-apply__criterion-han'>{criterion.han}</span>
                </h3>
                <p className='asca-apply__criterion-score'>{criterion.score}</p>
                <p className='asca-apply__criterion-body'>{criterion.elements}</p>
              </li>
            ))}
          </ul>
          <div className='asca-apply__split'>
            <ol className='asca-apply__numbered'>
              {steps.map(step => (
                <li key={step}>
                  <div>
                    <strong>{ui(`step${step}Title`)}</strong>
                    <span>{ui(`step${step}Body`)}</span>
                  </div>
                </li>
              ))}
            </ol>
            <LedgerTable
              caption={ui('thresholdCaption')}
              columns={[{ label: ui('colScore') }, { label: ui('colCandidate') }]}
              rows={copy.thresholds}
            />
          </div>
          <RegCite sources={copy.judgingSources} label={ui('cite')} />
        </section>

        <section id='awards' aria-labelledby='awards-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='awards-title'
            eyebrow={ui('awardsEyebrow')}
            title={ui('awardsTitle')}
            lede={ui('awardsLede')}
          />
          <LedgerTable
            caption={t('aw.ui.prizesCaption')}
            columns={[
              { label: t('aw.ui.colPrize') },
              { label: t('aw.ui.colTier') },
              { label: t('aw.ui.colCount'), numeric: true },
              { label: t('aw.ui.colAward'), numeric: true },
            ]}
            rows={awards.map((award, index) => ({
              cells: [award.name, award.tier, award.count, award.prize],
              lead: index === 0,
            }))}
          />
          <p className='asca-apply__note'>{ui('awardsNote')}</p>
          <RegCite sources={awardSources} label={ui('cite')} />
        </section>

        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead id='faq-title' eyebrow={ui('faqEyebrow')} title={ui('faqTitle')} />
          <SiteFaqList ids={ENTRY_FAQ_IDS} />
          <div className='mt-12'>
            <h3 className='asca-apply__subhead'>{ui('podcastTitle')}</h3>
            <iframe
              src={PODCAST_EMBED}
              width='100%'
              height='152'
              loading='lazy'
              allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
              title={ui('podcastFrameTitle')}
              style={{ borderRadius: 12, border: 0 }}
            />
          </div>
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

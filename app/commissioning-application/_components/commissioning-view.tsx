'use client'

import { useMemo } from 'react'
import { PenLine, Users } from 'lucide-react'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
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
import type { Language } from '@/lib/i18n/types'
import { COMMISSION_TALLY_FORM_ID } from './commissioning-data'
import { localizeCommissioning } from './commissioning-copy'

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

/** 위원 위촉 지원 화면 — 고른 언어로. 자격·절차·수당의 원본은 commissioning-data.ts(한국어) 하나다 */
export function CommissioningView() {
  const { t, language } = useLanguage() as { t: (key: string) => string; language: Language }
  const ui = (name: string) => t(`cm.ui.${name}`)
  const copy = useMemo(() => localizeCommissioning(key => t(key)), [t])

  const toc = [
    { href: '#roles', label: ui('tocRoles') },
    { href: '#process', label: ui('tocProcess') },
    { href: '#pay', label: ui('tocPay') },
    { href: '#fairness', label: ui('tocFairness') },
    { href: '#apply', label: ui('tocApply') },
    { href: '#contact', label: ui('tocContact') },
  ] as const

  const payColumns = [
    { label: ui('colKind') },
    { label: ui('colBasis') },
    { label: ui('colPrinciple') },
  ]

  return (
    <>
      <PageHero
        {...PAGE_HERO_MARKS.commissioning}
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
            <a href='#roles' className={`${heroAction} border hover:bg-muted`}>
              <Users className='h-4 w-4' aria-hidden='true' />
              {ui('heroRoles')}
            </a>
          </>
        }
      >
        <HeroFacts
          facts={[
            {
              label: ui('factRoles'),
              value: ui('factRolesValue').replace('{n}', String(copy.roles.length)),
            },
            { label: ui('factDecision'), value: ui('factDecisionValue') },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={toc} label={ui('tocLabel')} />

        <section id='roles' aria-labelledby='roles-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='roles-title'
            eyebrow={ui('rolesEyebrow')}
            title={ui('rolesTitle')}
            lede={ui('rolesLede')}
          />
          <div className='asca-apply__roles'>
            {copy.roles.map(role => (
              <article key={role.mark} aria-labelledby={`role-${role.mark}`}>
                <header className='asca-apply__role-head'>
                  <span className='asca-apply__role-mark' aria-hidden='true'>
                    {role.mark}
                  </span>
                  <h3 id={`role-${role.mark}`} className='asca-apply__role-title'>
                    {role.title}
                  </h3>
                  <p className='asca-apply__role-duty'>{role.duty}</p>
                </header>
                <h4 className='asca-apply__subhead'>{ui('qualifications')}</h4>
                <ul className='asca-apply__dash-list'>
                  {role.qualifications.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <RegCite sources={role.sources} label={ui('cite')} />
              </article>
            ))}
          </div>
        </section>

        <section id='process' aria-labelledby='process-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='process-title'
            eyebrow={ui('processEyebrow')}
            title={ui('processTitle')}
            lede={ui('processLede')}
          />
          <ol className='asca-apply__numbered'>
            {copy.steps.map(step => (
              <li key={step.title}>
                <div>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </div>
              </li>
            ))}
          </ol>
          <RegCite sources={copy.stepSources} label={ui('cite')} />
        </section>

        <section id='pay' aria-labelledby='pay-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='pay-title'
            eyebrow={ui('payEyebrow')}
            title={ui('payTitle')}
            lede={ui('payLede')}
          />
          <div className='grid gap-12'>
            <LedgerTable caption={ui('jurorCaption')} columns={payColumns} rows={copy.jurorPay} />
            <LedgerTable
              caption={ui('committeeCaption')}
              columns={payColumns}
              rows={copy.committeePay}
            />
            <div>
              <LedgerTable
                caption={ui('recruiterCaption')}
                columns={[
                  { label: ui('colKind') },
                  { label: ui('colRecruits'), numeric: true },
                  { label: ui('colPayBasis') },
                  { label: ui('colPayTotal'), numeric: true },
                ]}
                rows={copy.recruiterPay}
              />
              <p className='asca-apply__note'>{ui('recruiterNote')}</p>
            </div>
          </div>
          <RegCite sources={copy.paySources} label={ui('cite')} />
        </section>

        <section id='fairness' aria-labelledby='fairness-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='fairness-title'
            eyebrow={ui('fairnessEyebrow')}
            title={ui('fairnessTitle')}
            lede={ui('fairnessLede')}
          />
          <div className='asca-apply__split'>
            <div>
              <h3 className='asca-apply__subhead'>{ui('recusalTitle')}</h3>
              <ul className='asca-apply__dash-list'>
                {copy.recusalGrounds.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className='asca-apply__note'>{ui('recusalNote')}</p>
            </div>
            <div>
              <h3 className='asca-apply__subhead'>{ui('dualTitle')}</h3>
              <p className='asca-apply__lede'>{ui('dualBody')}</p>
            </div>
          </div>
          <RegCite sources={copy.fairnessSources} label={ui('cite')} />
        </section>

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
            </div>
            <TallyEmbed
              formId={COMMISSION_TALLY_FORM_ID}
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

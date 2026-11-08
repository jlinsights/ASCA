'use client'

import { useMemo } from 'react'
import { ArrowUpRight, CreditCard, ListChecks } from 'lucide-react'
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
import { CopyButton } from '@/components/apply/copy-button'
import { CONTACT_LABELS } from '@/app/contests/_components/contest-i18n'
import { useLanguage } from '@/contexts/language-context'
import type { Language } from '@/lib/i18n/types'
import {
  CMS_PDF_URL,
  DONUS_MYPAGE_URL,
  DONUS_PAYMENT_URL,
  FUNDRAISING_FAQ_IDS,
} from './fundraising-data'
import { localizeFundraising } from './fundraising-copy'

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

const external = { target: '_blank', rel: 'noopener noreferrer' } as const

/** 회비·후원 본문 — 고른 언어로. ko 표에도 같은 한국어가 있어 모든 언어가 t() 하나로 간다 */
export function FundraisingView() {
  const { t, language } = useLanguage() as { t: (key: string) => string; language: Language }
  const copy = useMemo(() => localizeFundraising(key => t(key)), [t])
  const ui = (name: string) => t(`fr.ui.${name}`)
  const cite = ui('cite')
  const newWindow = <span className='sr-only'>{ui('newWindow')}</span>

  const toc = [
    { href: '#pay', label: ui('tocPay') },
    { href: '#dues', label: ui('tocDues') },
    { href: '#use', label: ui('tocUse') },
    { href: '#accountability', label: ui('tocAccountability') },
    { href: '#faq', label: ui('tocFaq') },
    { href: '#contact', label: ui('tocContact') },
  ] as const

  return (
    <>
      <PageHero
        {...PAGE_HERO_MARKS.fundraising}
        title={ui('heroTitle')}
        lede={ui('heroLede')}
        actions={
          <>
            <a
              href={DONUS_PAYMENT_URL}
              {...external}
              className={`${heroAction} bg-foreground text-background hover:opacity-90`}
            >
              <CreditCard className='h-4 w-4' aria-hidden='true' />
              {ui('heroPay')}
              {newWindow}
            </a>
            <a href='#dues' className={`${heroAction} border hover:bg-muted`}>
              <ListChecks className='h-4 w-4' aria-hidden='true' />
              {ui('heroDues')}
            </a>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: ui('factFee'), value: ui('factFeeValue') },
            { label: ui('factDeadline'), value: ui('factDeadlineValue') },
            { label: ui('factSplit'), value: ui('factSplitValue') },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={toc} label={ui('tocLabel')} />

        <section id='pay' aria-labelledby='pay-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='pay-title'
            eyebrow={ui('payEyebrow')}
            title={ui('payTitle')}
            lede={ui('payLede')}
          />
          <ol className='asca-apply__ways'>
            <li className='asca-apply__way is-primary'>
              <p className='asca-apply__way-tag'>{ui('onlineTag')}</p>
              <h3 className='asca-apply__way-title'>{ui('onlineTitle')}</h3>
              <p className='asca-apply__way-body'>{ui('onlineBody')}</p>
              <div className='asca-apply__way-actions'>
                <a href={DONUS_PAYMENT_URL} {...external} className='asca-apply__way-link'>
                  {ui('onlinePay')}
                  <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
                  {newWindow}
                </a>
                <a href={DONUS_MYPAGE_URL} {...external} className='asca-apply__way-link is-quiet'>
                  {ui('onlineMypage')}
                  <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
                  {newWindow}
                </a>
              </div>
            </li>
            <li className='asca-apply__way'>
              <p className='asca-apply__way-tag'>{ui('bankTag')}</p>
              <h3 className='asca-apply__way-title'>{ui('bankTitle')}</h3>
              <p className='asca-apply__account'>
                <span>{copy.bank.bank}</span>
                <strong>{copy.bank.number}</strong>
                <span>{ui('bankHolder').replace('{holder}', copy.bank.holder)}</span>
              </p>
              <div className='asca-apply__way-actions'>
                <CopyButton
                  value={copy.bank.number}
                  label={ui('copyLabel')}
                  copiedText={ui('copied')}
                  failedText={ui('copyFailed')}
                />
              </div>
            </li>
            <li className='asca-apply__way'>
              <p className='asca-apply__way-tag'>{ui('cmsTag')}</p>
              <h3 className='asca-apply__way-title'>{ui('cmsTitle')}</h3>
              <p className='asca-apply__way-body'>{ui('cmsBody')}</p>
              <div className='asca-apply__way-actions'>
                <a href={CMS_PDF_URL} {...external} className='asca-apply__way-link'>
                  {ui('cmsPdf')}
                  <ArrowUpRight className='h-4 w-4' aria-hidden='true' />
                  {newWindow}
                </a>
              </div>
            </li>
          </ol>
          <RegCite sources={copy.sources.payment} label={cite} />
        </section>

        <section id='dues' aria-labelledby='dues-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='dues-title'
            eyebrow={ui('duesEyebrow')}
            title={ui('duesTitle')}
            lede={ui('duesLede')}
          />
          <div className='asca-apply__split'>
            <div>
              <LedgerTable
                caption={ui('duesCaption')}
                columns={[
                  { label: ui('colGrade') },
                  { label: ui('colAnnual'), numeric: true },
                  { label: ui('colRegistration'), numeric: true },
                  { label: ui('colWhen') },
                ]}
                rows={copy.dues}
              />
              <p className='asca-apply__note'>{ui('duesNote')}</p>
            </div>
            <div className='asca-apply__stack'>
              <div>
                <h3 className='asca-apply__subhead'>{ui('lifetimeTitle')}</h3>
                <ul className='asca-apply__dash-list'>
                  <li>{ui('lifetime1')}</li>
                  <li>{ui('lifetime2')}</li>
                </ul>
              </div>
              <div>
                <h3 className='asca-apply__subhead'>{ui('devTitle')}</h3>
                <ul className='asca-apply__dash-list'>
                  <li>{ui('dev1')}</li>
                  <li>{ui('dev2')}</li>
                  <li>{ui('dev3')}</li>
                  <li>{ui('dev4')}</li>
                </ul>
              </div>
            </div>
          </div>
          <h3 className='asca-apply__subhead'>{ui('arrearsTitle')}</h3>
          <LedgerTable
            caption={ui('arrearsCaption')}
            columns={[{ label: ui('colPeriod') }, { label: ui('colAction') }]}
            rows={copy.arrears}
          />
          <p className='asca-apply__note'>{ui('arrearsNote')}</p>
          <RegCite sources={copy.sources.dues} label={cite} />
        </section>

        <section id='use' aria-labelledby='use-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='use-title'
            eyebrow={ui('useEyebrow')}
            title={ui('useTitle')}
            lede={ui('useLede')}
          />
          <ol className='asca-apply__programs'>
            {copy.programs.map(program => (
              <li key={program.han} className='asca-apply__program'>
                <span className='asca-apply__program-mark' aria-hidden='true'>
                  {program.han}
                </span>
                <p className='asca-apply__program-title'>{program.title}</p>
              </li>
            ))}
          </ol>
          <p className='asca-apply__note'>{ui('useNote')}</p>
          <RegCite sources={copy.sources.program} label={cite} />
        </section>

        <section
          id='accountability'
          aria-labelledby='accountability-title'
          className='asca-apply__anchor'
        >
          <ApplySectionHead
            id='accountability-title'
            eyebrow={ui('accEyebrow')}
            title={ui('accTitle')}
            lede={ui('accLede')}
          />
          <ol className='asca-apply__timeline'>
            {copy.accountability.map((step, index) => (
              <li key={index} className='asca-apply__timeline-step'>
                <p className='asca-apply__timeline-when'>{step.when}</p>
                <h3 className='asca-apply__timeline-title'>{step.title}</h3>
                <p className='asca-apply__timeline-body'>{step.body}</p>
              </li>
            ))}
          </ol>
          <p className='asca-apply__note'>{ui('accNote')}</p>
          <RegCite sources={copy.sources.accountability} label={cite} />
        </section>

        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead id='faq-title' eyebrow={ui('faqEyebrow')} title={ui('faqTitle')} />
          <SiteFaqList ids={FUNDRAISING_FAQ_IDS} />
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

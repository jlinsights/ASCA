'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { PenLine } from 'lucide-react'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  LedgerTable,
  RegCite,
} from '@/components/apply/apply-parts'
import { localizeAwards } from '@/app/application/_components/award-copy'
import { CONTACT_LABELS } from '@/app/contests/_components/contest-i18n'
import { historyEvents } from '@/app/history/_data/history-events'
import { localizeHistoryEvent } from '@/app/history/_data/history-i18n'
import { useLanguage } from '@/contexts/language-context'
import type { Language } from '@/lib/i18n/types'
import { CONTEST_EDITIONS } from './awards-data'

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

const EVENTS = new Map(historyEvents.map(event => [event.id, event]))

/** 수상 화면 — 고른 언어로. 시상 내역은 출품원서와 같은 데이터, 역대 대전의 기간·장소는 연혁 번역을 쓴다 */
export function AwardsView() {
  const { t, language } = useLanguage() as { t: (key: string) => string; language: Language }
  const ui = (name: string) => t(`aw.ui.${name}`)
  const { awards, sources } = useMemo(() => localizeAwards(key => t(key)), [t])
  const latest = CONTEST_EDITIONS[0]

  const editionRows = CONTEST_EDITIONS.map((edition, index) => {
    const source = EVENTS.get(edition.eventId)
    const local = source ? localizeHistoryEvent(source, language) : undefined
    const venue = local?.venue ?? edition.venue
    const date = local?.date ?? edition.date
    return {
      cells: [
        ui('editionLabel').replace('{n}', String(edition.edition)),
        String(edition.year),
        date ?? '—',
        edition.online ? `${venue ?? ''} ${ui('online')}`.trim() : (venue ?? '—'),
      ],
      lead: index === 0,
    }
  })

  const toc = [
    { href: '#prizes', label: ui('tocPrizes') },
    { href: '#editions', label: ui('tocEditions') },
    { href: '#contact', label: ui('tocContact') },
  ] as const

  const [notePre, noteRest = ''] = ui('editionsNote').split('{past}')
  const [noteMid, notePost = ''] = noteRest.split('{history}')

  return (
    <>
      <PageHero
        {...PAGE_HERO_MARKS.awards}
        title={ui('heroTitle')}
        lede={ui('heroLede')}
        actions={
          <Link
            href='/application'
            className={`${heroAction} bg-foreground text-background hover:opacity-90`}
          >
            <PenLine className='h-4 w-4' aria-hidden='true' />
            {ui('heroApply')}
          </Link>
        }
      >
        <HeroFacts
          facts={[
            {
              label: ui('factEditions'),
              value: ui('factEditionsValue').replace('{n}', String(CONTEST_EDITIONS.length)),
            },
            {
              label: ui('factTiers'),
              value: ui('factTiersValue').replace('{n}', String(awards.length)),
            },
            { label: ui('factTopPrize'), value: ui('factTopPrizeValue') },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={toc} label={ui('tocLabel')} />

        <section id='prizes' aria-labelledby='prizes-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='prizes-title'
            eyebrow={ui('prizesEyebrow')}
            title={ui('prizesTitle')}
            lede={ui('prizesLede')}
          />
          <LedgerTable
            caption={ui('prizesCaption')}
            columns={[
              { label: ui('colPrize') },
              { label: ui('colTier') },
              { label: ui('colCount'), numeric: true },
              { label: ui('colAward'), numeric: true },
            ]}
            rows={awards.map((award, index) => ({
              cells: [award.name, award.tier, award.count, award.prize],
              lead: index === 0,
            }))}
          />
          <p className='asca-apply__note'>{ui('prizesNote')}</p>
          <RegCite sources={sources} label={ui('cite')} />
        </section>

        <section id='editions' aria-labelledby='editions-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='editions-title'
            eyebrow={ui('editionsEyebrow')}
            title={ui('editionsTitle').replace('{n}', String(latest?.edition ?? ''))}
            lede={ui('editionsLede')}
          />
          <LedgerTable
            caption={ui('editionsCaption')}
            columns={[
              { label: ui('colEdition') },
              { label: ui('colYear'), numeric: true },
              { label: ui('colDates') },
              { label: ui('colVenue') },
            ]}
            rows={editionRows}
          />
          <p className='asca-apply__note'>
            {notePre}
            <Link href='/exhibitions/past'>{ui('pastExhibitions')}</Link>
            {noteMid}
            <Link href='/history'>{ui('history')}</Link>
            {notePost}
          </p>
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

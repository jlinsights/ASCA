'use client'

import Link from 'next/link'
import { ContestIntro } from '@/components/contests/contest-intro'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  LedgerTable,
  type TocItem,
} from '@/components/apply/apply-parts'
import { CONTEST_EDITIONS } from '@/app/awards/_components/awards-data'
import { localizeHistoryDate, localizeHistoryVenue } from '@/app/history/_data/history-i18n'
import { useLanguage } from '@/contexts/language-context'
import { ContestGuidelines } from './contest-guidelines'
import { CONTEST_23 } from './contest-23-data'
import { CONTACT_LABELS, TOC_LABEL, contestDate, editionLabel } from './contest-i18n'
import { CONTESTS_PAGE_COPY } from './contests-page-copy'

/** /contests 본문 — 언어 선택을 따르는 클라이언트 화면. 메타데이터는 page.tsx(서버, 한국어)에 남는다 */

const TOC_HREFS = [
  '#next',
  '#entry',
  '#specs',
  '#fees',
  '#how',
  '#prizes',
  '#notice',
  '#editions',
  '#contact',
] as const

export function ContestsView() {
  const { language } = useLanguage()
  const copy = CONTESTS_PAGE_COPY[language]
  const latest = CONTEST_EDITIONS[0]
  const toc: TocItem[] = TOC_HREFS.map((href, index) => ({ href, label: copy.toc[index] ?? '' }))
  const date = (iso: string, withYear = true) => contestDate(iso, language, withYear)

  return (
    <>
      <ContestIntro
        facts={[
          { label: copy.toc[7] ?? '', value: copy.facts.editions(CONTEST_EDITIONS.length) },
          { label: copy.facts.next, value: copy.nextEdition(CONTEST_23.edition) },
          { label: copy.facts.deadline, value: date(CONTEST_23.deadline) },
          {
            label: copy.facts.exhibition,
            value: `${date(CONTEST_23.exhibitionStart, false)} ~ ${date(CONTEST_23.exhibitionEnd, false)}`,
          },
        ]}
      />

      <div className='asca-apply__body'>
        <ApplyToc items={toc} label={TOC_LABEL[language]} />

        <p className='asca-apply__note'>
          {copy.hubLead} <Link href='/contests/23'>{copy.hubLink(CONTEST_23.edition)}</Link>
        </p>

        <ContestGuidelines />

        <section id='editions' aria-labelledby='editions-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='editions-title'
            eyebrow={copy.editions.eyebrow}
            title={copy.editions.title(latest?.edition ?? 0)}
            lede={copy.editions.lede}
          />
          <LedgerTable
            caption={copy.editions.caption}
            columns={copy.editions.columns.map((label, index) => ({
              label,
              numeric: index === 1,
            }))}
            rows={CONTEST_EDITIONS.map((edition, index) => {
              const venue = edition.venue ? localizeHistoryVenue(edition.venue, language) : ''
              return {
                cells: [
                  editionLabel(edition.edition, language),
                  String(edition.year),
                  edition.date ? localizeHistoryDate(edition.date, language) : '—',
                  edition.online ? `${venue} ${copy.editions.online}`.trim() : venue || '—',
                ],
                lead: index === 0,
              }
            })}
          />
        </section>

        <section id='contact' aria-labelledby='contact-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='contact-title'
            eyebrow={copy.contact.eyebrow}
            title={copy.contact.title}
            lede={copy.contact.lede}
          />
          <ContactList labels={CONTACT_LABELS[language]} />
        </section>
      </div>
    </>
  )
}

'use client'

import Link from 'next/link'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  LedgerTable,
  type TocItem,
} from '@/components/apply/apply-parts'
import { CONTEST_FLIPBOOK_URL } from '@/components/contests/contest-flipbook'
import { SiteFaqList } from '@/components/faq/site-faq-list'
import { CALENDAR_2027 } from '@/app/events/calendar-2027/_components/calendar-2027-data'
import { useLanguage } from '@/contexts/language-context'
import { CONTEST_23 } from '@/app/contests/_components/contest-23-data'
import { GUIDELINE_COPY } from '@/app/contests/_components/contest-23-copy'
import {
  CONTACT_LABELS,
  TOC_LABEL,
  contestDate,
  contestTitle,
} from '@/app/contests/_components/contest-i18n'
import { HUB_COPY, hubCrumbEdition, type HubCopy } from './daejeon-23-hub-copy'

/** /contests/23 본문 — 언어 선택을 따른다. 메타데이터·구조화 데이터는 page.tsx(서버, 한국어)에 남는다 */

// 목차 이름은 각 절의 머리(eyebrow)와 같다 — 한국어 예전 목차와도 같은 말
const TOC_HREFS = ['#halls', '#paths', '#dates', '#faq', '#contact'] as const

const HUB_FAQ_IDS = ['entry-fees', 'awards', 'special-appointment'] as const

function EntryActions({ copy }: { copy: HubCopy }) {
  return (
    <p className='asca-events__cta'>
      <Link href='/application' className='asca-events__more is-primary'>
        {copy.actions.apply}
      </Link>
      <a
        href={CONTEST_FLIPBOOK_URL}
        target='_blank'
        rel='noopener noreferrer'
        className='asca-events__more'
      >
        {copy.actions.flipbook}
      </a>
      <Link href='/contests' className='asca-events__more'>
        {copy.actions.guidelines}
      </Link>
    </p>
  )
}

interface Daejeon23HubViewProps {
  /** 캘린더 증정 신청이 열려 있는지 — 서버가 다시 만들 때 판정해 넘긴다(revalidate 와 같은 시계) */
  calendarOpen: boolean
}

export function Daejeon23HubView({ calendarOpen }: Daejeon23HubViewProps) {
  const { language } = useLanguage()
  const copy = HUB_COPY[language]
  const schedule = GUIDELINE_COPY[language].next
  const date = (iso: string, withYear = true) => contestDate(iso, language, withYear)
  const deadlineTime =
    language === 'ko'
      ? CONTEST_23.deadlineTime
      : (/\d{2}:\d{2}/.exec(CONTEST_23.deadlineTime)?.[0] ?? '')
  const toc: TocItem[] = [
    copy.halls.eyebrow,
    copy.paths.eyebrow,
    copy.dates.eyebrow,
    copy.faq.eyebrow,
    copy.contact.eyebrow,
  ].map((label, index) => ({ href: TOC_HREFS[index]!, label }))

  return (
    <>
      <PageHero
        {...PAGE_HERO_MARKS.contests}
        title={contestTitle(language)}
        crumbs={[{ label: copy.crumb, href: '/contests' }, { label: hubCrumbEdition(language) }]}
        lede={copy.lede}
      >
        <HeroFacts
          facts={[
            {
              label: copy.facts.deadline,
              value: `${date(CONTEST_23.deadline, false)} ${deadlineTime}`,
            },
            {
              label: copy.facts.exhibition,
              value: `${date(CONTEST_23.exhibitionStart, false)} ~ ${date(CONTEST_23.exhibitionEnd, false)}`,
            },
            { label: copy.facts.ceremony, value: date(CONTEST_23.ceremony, false) },
            { label: copy.facts.admission, value: copy.facts.free },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={toc} label={TOC_LABEL[language]} />

        <div>
          <EntryActions copy={copy} />
          {calendarOpen && (
            <p className='asca-apply__note'>
              {copy.calendar(date(CALENDAR_2027.closes), CALENDAR_2027.closesTime)}{' '}
              <Link href={CALENDAR_2027.path}>{copy.calendarLink}</Link>
            </p>
          )}
        </div>

        <section id='halls' aria-labelledby='halls-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='halls-title'
            eyebrow={copy.halls.eyebrow}
            title={copy.halls.title}
            lede={copy.halls.lede}
          />
          <ol className='asca-apply__numbered'>
            {copy.halls.items.map(item => (
              <li key={item.hall}>
                <div>
                  <strong>
                    {item.hall} · {item.title}
                  </strong>
                  <span>{item.body}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className='asca-apply__note'>{copy.hallsNote}</p>
        </section>

        <section id='paths' aria-labelledby='paths-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='paths-title'
            eyebrow={copy.paths.eyebrow}
            title={copy.paths.title}
            lede={copy.paths.lede}
          />
          <ol className='asca-apply__numbered'>
            {copy.paths.items.map(path => (
              <li key={path.title}>
                <div>
                  <strong>{path.title}</strong>
                  <span>
                    {path.who}
                    <br />
                    {path.body}{' '}
                    {path.links.map((link, index) => (
                      <span key={link.href}>
                        {index > 0 && ' · '}
                        <Link href={link.href}>{link.label} →</Link>
                      </span>
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id='dates' aria-labelledby='dates-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='dates-title'
            eyebrow={copy.dates.eyebrow}
            title={copy.dates.title}
            lede={copy.dates.lede}
          />
          <LedgerTable
            caption={schedule.caption}
            columns={schedule.columns.map(label => ({ label }))}
            rows={schedule.rows.map(row => ({ cells: [row.label, row.value], lead: row.lead }))}
          />
          <EntryActions copy={copy} />
        </section>

        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='faq-title'
            eyebrow={copy.faq.eyebrow}
            title={copy.faq.title}
            lede={copy.faq.note}
          />
          {/* 사이트 FAQ 는 아직 한국어로만 있다 */}
          <div lang='ko'>
            <SiteFaqList ids={HUB_FAQ_IDS} />
          </div>
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

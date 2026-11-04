'use client'

import Link from 'next/link'
import { CONTACT_LABELS } from '@/app/contests/_components/contest-i18n'
import { ApplySectionHead, ContactList, LedgerTable } from '@/components/apply/apply-parts'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { useLanguage } from '@/contexts/language-context'
import { noticePeriod, type NoticeFact, type NoticeRow } from '@/lib/notices/notice-view'
import { NOTICE_COPY } from './notice-copy'
import { noticeDate, noticePeriodLabel } from './notice-format'
import { NoticeShare } from './notice-share'

/**
 * 공지 상세 본문 — 언어 선택을 따르는 클라이언트 화면. 공지 제목·본문·항목 값은 한국어 원문 그대로(lang='ko'),
 * 머리·항목 이름·안내 문구만 바꾼다. 데이터 읽기와 메타데이터는 page.tsx(서버)가 한다.
 */

interface NoticeDetailViewProps {
  notice: NoticeRow
  /** 설명 문단 — 빈 줄로 문단을 나눈다 */
  lead: string
  facts: readonly NoticeFact[]
  related: readonly NoticeRow[]
}

export function NoticeDetailView({ notice, lead, facts, related }: NoticeDetailViewProps) {
  const { language } = useLanguage()
  const copy = NOTICE_COPY[language]
  const { detail } = copy
  const category = copy.categories[notice.category]
  const isAhead = notice.phase === 'upcoming' || notice.phase === 'ongoing'
  // 기간 줄은 'YYYY-MM-DD ~ YYYY-MM-DD' 원문 대신 언어별 날짜로 — 날짜를 못 읽으면 원문 그대로
  const factValue = (fact: NoticeFact): string => {
    const period = fact.key === '기간' || fact.key === '장례기간' ? noticePeriod(fact.value) : null
    return period ? noticePeriodLabel(period, language) : fact.value
  }
  const paragraphs = lead.split(/\n{2,}/).filter(paragraph => paragraph.trim())

  return (
    <>
      <PageHero
        {...PAGE_HERO_MARKS.notice}
        tier='band'
        title={notice.title}
        crumbs={[{ label: detail.crumb, href: '/notice' }, { label: notice.title }]}
      >
        <HeroFacts
          facts={[
            { label: detail.published, value: noticeDate(notice.published, language) },
            {
              label: detail.period,
              value: notice.period ? noticePeriodLabel(notice.period, language) : null,
            },
            {
              label: detail.place,
              value: notice.place ? <span lang='ko'>{notice.place}</span> : null,
            },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <div className='asca-events__detail'>
          <article className='asca-notice__article' aria-labelledby='notice-body-title'>
            <p className='asca-events__kicker'>
              {notice.phase && (
                <span className='asca-events__phase' data-phase={notice.phase}>
                  {copy.phases[notice.phase]}
                </span>
              )}
              {category}
            </p>
            <h2 id='notice-body-title' className='sr-only'>
              {detail.bodyTitle}
            </h2>
            {paragraphs.length > 0 && (
              <div className='asca-events__lead' lang='ko'>
                {paragraphs.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}

            <NoticeShare title={notice.title} labels={detail} />

            {facts.length > 0 && (
              <section aria-labelledby='notice-facts-title' className='asca-events__facts'>
                <ApplySectionHead
                  id='notice-facts-title'
                  eyebrow={detail.factsEyebrow}
                  title={detail.factsTitle}
                />
                <LedgerTable
                  caption={detail.factsCaption(notice.title)}
                  columns={detail.columns.map(label => ({ label }))}
                  rows={facts.map(fact => ({ cells: [copy.fields[fact.key], factValue(fact)] }))}
                />
              </section>
            )}

            {isAhead && (
              <section aria-labelledby='notice-ask-title' className='asca-events__facts'>
                <ApplySectionHead
                  id='notice-ask-title'
                  eyebrow={detail.contactEyebrow}
                  title={detail.contactTitle}
                  lede={detail.contactLede}
                />
                <ContactList labels={CONTACT_LABELS[language]} />
              </section>
            )}
          </article>

          <aside className='asca-events__aside' aria-labelledby='notice-related-title'>
            <h2 id='notice-related-title' className='asca-events__aside-title'>
              {related.length > 0 ? detail.relatedTitle(category) : detail.relatedFallback}
            </h2>
            {related.length > 0 && (
              <ol className='asca-events__related'>
                {related.map(row => (
                  <li key={row.id}>
                    <Link href={`/notice/${row.id}`}>
                      <time className='asca-events__related-date' dateTime={row.published}>
                        {row.year}.{row.monthDay}
                      </time>
                      <span className='asca-events__related-title' lang='ko'>
                        {row.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
            <Link href='/notice#archive' className='asca-events__more'>
              {detail.back}
            </Link>
          </aside>
        </div>
      </div>
    </>
  )
}

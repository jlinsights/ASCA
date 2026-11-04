'use client'

import Link from 'next/link'
import { ApplySectionHead } from '@/components/apply/apply-parts'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { useLanguage } from '@/contexts/language-context'
import { noticeHref, type NoticeRow } from '@/lib/notices/notice-view'
import { NoticeArchive } from './notice-archive'
import { NOTICE_COPY } from './notice-copy'
import { noticeDate, noticePeriodLabel } from './notice-format'

/**
 * /notice 본문 — 언어 선택을 따르는 클라이언트 화면. 목록은 서버가 한 번에 읽어 넘긴다.
 * 고정 공지는 맨 위 띠에 따로 세우고, 장부에도 그대로 남긴다(분류·검색으로 찾을 수 있게).
 */

interface NoticeViewProps {
  rows: readonly NoticeRow[]
  initialCategory?: string
  initialQuery?: string
}

export function NoticeView({ rows, initialCategory, initialQuery }: NoticeViewProps) {
  const { language } = useLanguage()
  const copy = NOTICE_COPY[language]
  const pinned = rows.filter(row => row.pinned)
  const since = rows.at(-1)?.year
  const latest = rows[0]?.published

  return (
    <>
      <PageHero {...PAGE_HERO_MARKS.notice} title={copy.hero.title} lede={copy.hero.lede}>
        <HeroFacts
          facts={[
            { label: copy.facts.total, value: rows.length > 0 ? copy.count(rows.length) : null },
            {
              label: copy.facts.pinned,
              value: pinned.length > 0 ? copy.count(pinned.length) : null,
            },
            { label: copy.facts.since, value: since ? copy.year(since) : null },
            { label: copy.facts.latest, value: latest ? noticeDate(latest, language) : null },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        {pinned.length > 0 && (
          <section id='pinned' aria-labelledby='pinned-title' className='asca-apply__anchor'>
            <ApplySectionHead
              id='pinned-title'
              eyebrow={copy.pinned.eyebrow}
              title={copy.pinned.title}
            />
            <ul className='asca-notice__pinned'>
              {pinned.map(row => (
                <li key={row.id} className='asca-notice__pin'>
                  <p className='asca-events__kicker'>
                    {row.phase && row.phase !== 'past' && (
                      <span className='asca-events__phase' data-phase={row.phase}>
                        {copy.phases[row.phase]}
                      </span>
                    )}
                    <span>{copy.categories[row.category]}</span>
                    <time dateTime={row.published}>{noticeDate(row.published, language)}</time>
                  </p>
                  <h3 className='asca-notice__pin-title' lang='ko'>
                    <Link href={noticeHref(row)}>{row.title}</Link>
                  </h3>
                  {row.summary && (
                    <p className='asca-notice__pin-summary' lang='ko'>
                      {row.summary}
                    </p>
                  )}
                  {row.period && (
                    <p className='asca-notice__pin-period'>
                      {noticePeriodLabel(row.period, language)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id='archive' aria-labelledby='archive-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='archive-title'
            eyebrow={copy.archive.eyebrow}
            title={copy.archive.title(since)}
            lede={copy.archive.lede}
          />
          <NoticeArchive
            rows={rows}
            initialCategory={initialCategory}
            initialQuery={initialQuery}
          />
        </section>
      </div>
    </>
  )
}

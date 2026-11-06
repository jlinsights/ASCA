'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { eventTypeText, type EventRow } from './event-rows'

/**
 * 다가오는 행사 — 날짜를 크게(달·일), 그 옆에 제목·기간·장소. 가까운 행사부터.
 * 행사 사진이 한 장도 없어(2026-10) 사진 칸 대신 날짜를 그림처럼 쓴다.
 */

export function UpcomingEvents({ rows }: { rows: readonly EventRow[] }) {
  const { t } = useLanguage()
  if (rows.length === 0) {
    return (
      <p className='asca-apply__note'>
        {t('evNoneBefore')}
        <Link href='/notice'>{t('evNoneLink')}</Link>
        {t('evNoneAfter')}
      </p>
    )
  }
  return (
    <ol className='asca-events__upcoming'>
      {rows.map(row => (
        <li key={row.id} className='asca-events__feature'>
          <p className='asca-events__feature-date' aria-hidden='true'>
            <span className='asca-events__feature-year'>{row.year}</span>
            <span className='asca-events__feature-md'>
              {row.month}
              <span className='asca-events__feature-dot'>.</span>
              {row.day}
            </span>
          </p>
          <div className='asca-events__feature-body'>
            <p className='asca-events__feature-kicker'>
              <span className='asca-events__phase' data-phase={row.phase}>
                {t(`evPhase_${row.phase}`)}
              </span>
              {eventTypeText(row, t)}
            </p>
            <h3 className='asca-events__feature-title'>
              <Link href={row.href ?? `/events/${row.id}`}>{row.title}</Link>
            </h3>
            {row.summary && <p className='asca-events__feature-summary'>{row.summary}</p>}
            <dl className='asca-events__feature-facts'>
              <div>
                <dt>{t('evFieldPeriod')}</dt>
                <dd>{row.period}</dd>
              </div>
              {row.place && (
                <div>
                  <dt>{t('evFieldPlace')}</dt>
                  <dd>{row.place}</dd>
                </div>
              )}
            </dl>
            <p className='asca-events__feature-actions'>
              <Link href={row.href ?? `/events/${row.id}`} className='asca-events__more'>
                {t('evMore')}
              </Link>
              {row.link && (
                <Link href={row.link.href} className='asca-events__more is-primary'>
                  {t(row.link.labelKey)} →
                </Link>
              )}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

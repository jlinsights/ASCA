import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { ApplySectionHead, ContactList, LedgerTable } from '@/components/apply/apply-parts'
import { EVENT_LINKS } from '@/lib/events/event-links'
import { getPublishedEvent, listPublishedEvents } from '@/lib/events/events-data'
import {
  EVENT_TYPE_LABELS,
  PHASE_LABELS,
  eventFacts,
  eventPeriod,
  eventPhase,
  parseEventContent,
  todayKst,
} from '@/lib/events/event-view'
import type { Event } from '@/lib/types/cms-legacy'
import { log } from '@/lib/utils/logger'
import { toEventRow, type EventRow } from '../_components/event-rows'
import { EventViewBeacon } from './_components/event-view-beacon'
import '@/components/apply/apply.css'
import '../_components/events.css'

/**
 * 행사 상세 — 서버에서 그린다. 예전엔 브라우저에서 읽었고, 관련 행사 쿼리 400 하나에 모든 상세가 오류 화면이었다(2026-10-25).
 * 본문의 '구분: …' 항목 줄은 표로 옮기고, 옛 사이트 원문 링크는 버린다.
 */

type PageProps = { params: Promise<{ id: string }> }

const RELATED_LIMIT = 4

/** 같은 유형의 행사를 날짜가 가까운 순으로 — 관련 행사를 못 읽어도 본문은 그린다 */
async function loadRelated(event: Event, today: string): Promise<EventRow[]> {
  try {
    const all = await listPublishedEvents()
    const origin = new Date(event.event_date).getTime()
    return all
      .filter(other => other.id !== event.id && other.event_type === event.event_type)
      .sort(
        (a, b) =>
          Math.abs(new Date(a.event_date).getTime() - origin) -
          Math.abs(new Date(b.event_date).getTime() - origin)
      )
      .slice(0, RELATED_LIMIT)
      .map(other => toEventRow(other, today))
  } catch (err) {
    log.error('related events load failed', err)
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await getPublishedEvent((await params).id)
  if (!event) return { title: '행사를 찾을 수 없습니다 | 동양서예협회' }
  const description = parseEventContent(event.content, event.description ?? '')
    .lead.replace(/\s+/g, ' ')
    .slice(0, 150)
  const title = `${event.title} | 동양서예협회`
  return {
    title,
    description,
    alternates: { canonical: `/events/${event.id}` },
    openGraph: { title, description },
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const event = await getPublishedEvent((await params).id)
  if (!event) notFound()

  const today = todayKst()
  const parsed = parseEventContent(event.content, event.description ?? '')
  const facts = eventFacts(event, parsed)
  const phase = eventPhase(event, today)
  const link = EVENT_LINKS[event.id]
  const related = await loadRelated(event, today)
  const typeLabel = EVENT_TYPE_LABELS[event.event_type] ?? '행사'
  const isAhead = phase === 'upcoming' || phase === 'ongoing'

  return (
    <div className='asca-apply min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.events}
        tier='band'
        title={event.title}
        crumbs={[{ label: '행사', href: '/events' }, { label: event.title }]}
      >
        <HeroFacts
          facts={[
            { label: '일정', value: eventPeriod(event) },
            { label: '장소', value: event.location || event.venue || null },
            { label: '구분', value: typeLabel },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <div className='asca-events__detail'>
          <article className='asca-events__article' aria-labelledby='about-title'>
            <p className='asca-events__kicker'>
              <span className='asca-events__phase' data-phase={phase}>
                {PHASE_LABELS[phase]}
              </span>
              {typeLabel}
            </p>
            <h2 id='about-title' className='sr-only'>
              행사 소개
            </h2>
            <div className='asca-events__lead'>
              {parsed.lead.split(/\n{2,}/).map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {link && (
              <p className='asca-events__cta'>
                <Link href={link.href} className='asca-events__more is-primary'>
                  {link.label} →
                </Link>
              </p>
            )}

            <section aria-labelledby='facts-title' className='asca-events__facts'>
              <ApplySectionHead id='facts-title' eyebrow='행사 정보' title='언제, 어디서' />
              <LedgerTable
                caption={`${event.title} 행사 정보`}
                columns={[{ label: '항목' }, { label: '내용' }]}
                rows={facts.map(fact => ({ cells: [fact.label, fact.value] }))}
              />
            </section>

            {isAhead && (
              <section aria-labelledby='ask-title' className='asca-events__facts'>
                <ApplySectionHead
                  id='ask-title'
                  eyebrow='문의'
                  title='참가·일정 문의'
                  lede='세부 일정과 참가 방법은 사무국에서 안내합니다.'
                />
                <ContactList />
              </section>
            )}
          </article>

          <aside className='asca-events__aside' aria-labelledby='related-title'>
            <h2 id='related-title' className='asca-events__aside-title'>
              {related.length > 0 ? `다른 ${typeLabel} 행사` : '행사 기록'}
            </h2>
            {related.length > 0 && (
              <ol className='asca-events__related'>
                {related.map(row => (
                  <li key={row.id}>
                    <Link href={`/events/${row.id}`}>
                      <span className='asca-events__related-date'>
                        {row.year}.{row.monthDay}
                      </span>
                      <span className='asca-events__related-title'>{row.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
            <Link href='/events#archive' className='asca-events__more'>
              ← 행사 목록으로
            </Link>
          </aside>
        </div>
      </div>

      <EventViewBeacon eventId={event.id} />
      <LayoutFooter />
    </div>
  )
}

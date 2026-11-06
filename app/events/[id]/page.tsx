import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { EVENT_LINKS } from '@/lib/events/event-links'
import { getPublishedEvent, listPublishedEvents } from '@/lib/events/events-data'
import {
  EVENT_TYPE_LABELS,
  eventFacts,
  eventPeriod,
  eventPhase,
  parseEventContent,
  todayKst,
} from '@/lib/events/event-view'
import type { Event } from '@/lib/types/cms-legacy'
import { log } from '@/lib/utils/logger'
import { toEventRow, type EventRow } from '../_components/event-rows'
import { EventDetailView } from './_components/event-detail-view'
import { EventViewBeacon } from './_components/event-view-beacon'
import '@/components/apply/apply.css'
import '../_components/events.css'

/**
 * 행사 상세 — 서버에서 그린다. 예전엔 브라우저에서 읽었고, 관련 행사 쿼리 400 하나에 모든 상세가 오류 화면이었다(2026-10-25).
 * 본문의 '구분: …' 항목 줄은 표로 옮기고, 옛 사이트 원문 링크는 버린다.
 * 화면 틀은 언어 선택을 따르는 EventDetailView(클라이언트)가 그리고, 메타데이터는 여기서 한국어로 둔다.
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
      .sort((a, b) => b.event_date.localeCompare(a.event_date)) // 고른 뒤엔 최신순으로 보여 준다
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
      <EventDetailView
        event={{
          id: event.id,
          title: event.title,
          type: event.event_type,
          typeLabel,
          phase,
          period: eventPeriod(event),
          place: event.location || event.venue || null,
          lead: parsed.lead,
          facts,
          link: link ?? null,
          isAhead,
        }}
        related={related}
      />
      <EventViewBeacon eventId={event.id} />
      <LayoutFooter />
    </div>
  )
}

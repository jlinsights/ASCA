import type { Event } from '@/lib/types/cms-legacy'
import { EVENT_LINKS, type EventLink } from '@/lib/events/event-links'
import {
  EVENT_TYPE_LABELS,
  eventPeriod,
  eventPhase,
  kstDate,
  parseEventContent,
  type EventPhase,
} from '@/lib/events/event-view'

/**
 * 목록 한 줄에 필요한 값 — 날짜 문자열은 서버에서 한국 날짜로 만들어 넘긴다.
 * 브라우저 시간대로 다시 계산하면 해외 접속자에게 날짜가 어긋난다.
 */
export interface EventRow {
  id: string
  title: string
  summary: string
  type: string
  typeLabel: string
  phase: EventPhase
  year: number
  /** 'MM.DD' — 지난 행사 줄의 날짜 칸 */
  monthDay: string
  /** 큰 날짜 칸 — 예정 행사 */
  month: number
  day: number
  period: string
  place: string
  organizer: string
  link: EventLink | null
}

export function toEventRow(event: Event, today: string): EventRow {
  const start = kstDate(event.event_date)
  const [year, month, day] = start.split('-').map(Number) as [number, number, number]
  return {
    id: event.id,
    title: event.title,
    summary: parseEventContent(event.content, event.description ?? '').lead,
    type: event.event_type,
    typeLabel: EVENT_TYPE_LABELS[event.event_type] ?? '행사',
    phase: eventPhase(event, today),
    year,
    monthDay: start.slice(5).replace('-', '.'),
    month,
    day,
    period: eventPeriod(event),
    place: event.location?.trim() || event.venue?.trim() || '',
    organizer: event.organizer?.trim() || '',
    link: EVENT_LINKS[event.id] ?? null,
  }
}

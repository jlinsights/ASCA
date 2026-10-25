import type { Event } from '@/lib/types/cms-legacy'
import { koDate } from '@/lib/utils/ko-date'

/**
 * 행사 화면용 계산 — 목록과 상세가 같은 규칙으로 날짜·상태·항목을 읽는다.
 * 행사는 모두 날짜만 있다(자정 KST 로 저장). 시각을 그리면 "오전 12:00"이 붙고,
 * 서버(UTC)에서 날짜를 그대로 읽으면 하루씩 당겨진다 — 그래서 늘 한국 날짜로 바꿔 쓴다.
 */

export type EventPhase = 'upcoming' | 'ongoing' | 'past' | 'cancelled'

export const PHASE_LABELS: Readonly<Record<EventPhase, string>> = {
  upcoming: '예정',
  ongoing: '진행 중',
  past: '지난 행사',
  cancelled: '취소',
}

export interface EventFact {
  label: string
  value: string
}

export interface ParsedEventContent {
  lead: string
  fields: Readonly<Record<string, string>>
}

export interface EventYearGroup {
  year: number
  events: Event[]
}

export const EVENT_TYPE_LABELS: Readonly<Record<string, string>> = {
  workshop: '워크숍',
  lecture: '강좌',
  competition: '대회',
  exhibition: '전시',
  ceremony: '수여식',
  meeting: '총회·이사회',
  other: '기행·행사',
  viewing: '관람',
  opening: '개막',
  award_ceremony: '시상식',
}

const KST_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** ISO 시각 → 한국 날짜 'YYYY-MM-DD' */
export function kstDate(iso: string): string {
  return KST_DATE.format(new Date(iso))
}

export function todayKst(): string {
  return kstDate(new Date().toISOString())
}

function eventRange(event: Event): { start: string; end: string } {
  const start = kstDate(event.event_date)
  const end = event.end_date ? kstDate(event.end_date) : start
  return { start, end: end < start ? start : end }
}

/** '2025년 10월 3일(금) – 10월 10일(금)' — 같은 해면 끝 연도를 뺀다 */
export function eventPeriod(event: Event): string {
  const { start, end } = eventRange(event)
  if (start === end) return koDate(start)
  const sameYear = start.slice(0, 4) === end.slice(0, 4)
  return `${koDate(start)} – ${koDate(end, !sameYear)}`
}

export function eventYear(event: Event): number {
  return Number(kstDate(event.event_date).slice(0, 4))
}

/** DB status 는 손으로 넣은 값이라 낡을 수 있다 — 취소만 믿고 나머지는 날짜로 정한다 */
export function eventPhase(event: Event, today: string = todayKst()): EventPhase {
  if (event.status === 'cancelled') return 'cancelled'
  const { start, end } = eventRange(event)
  if (today < start) return 'upcoming'
  if (today <= end) return 'ongoing'
  return 'past'
}

const FIELD_LINE = /^([가-힣]{2,4})\s*:\s*(.+)$/
/** 옛 Webflow 원문 주소 — 도메인을 이 앱으로 옮기면 404 가 되므로 보여 주지 않는다 */
const DROPPED_FIELDS = new Set(['원문'])

/** content = 설명 문단 + '구분: …' 같은 항목 줄. 항목 줄을 떼어 표로 보여 준다 */
export function parseEventContent(
  content: string | undefined,
  description: string
): ParsedEventContent {
  if (!content?.trim()) return { lead: description.trim(), fields: {} }
  const fields: Record<string, string> = {}
  const prose: string[] = []
  for (const raw of content.split('\n')) {
    const line = raw.trim()
    const match = FIELD_LINE.exec(line)
    if (match) {
      const [, key, value] = match as unknown as [string, string, string]
      if (!DROPPED_FIELDS.has(key)) fields[key] = value.trim()
    } else {
      prose.push(raw)
    }
  }
  const lead = prose.join('\n').trim() || description.trim()
  return { lead, fields }
}

/** 상세의 행사 정보 표 — 날짜·장소·주최는 열 값을 믿고, 본문 항목은 그 밖의 것만 더한다 */
export function eventFacts(event: Event, parsed: ParsedEventContent): EventFact[] {
  const { fields } = parsed
  const place = [event.location, event.venue].filter(Boolean).join(' · ')
  const organizer = event.organizer?.trim() || fields.주최
  const facts: (EventFact | null)[] = [
    // 구분은 유형 하나로 — 본문의 '구분: 행사' 와 머리의 '기행·행사' 가 엇갈렸다
    { label: '구분', value: EVENT_TYPE_LABELS[event.event_type] ?? '행사' },
    { label: '기간', value: eventPeriod(event) },
    place ? { label: '장소', value: place } : null,
    organizer ? { label: '주최', value: organizer } : null,
    fields.주관 && fields.주관 !== organizer ? { label: '주관', value: fields.주관 } : null,
    fields.후원 ? { label: '후원', value: fields.후원 } : null,
    fields.협찬 ? { label: '협찬', value: fields.협찬 } : null,
  ]
  return facts.filter((fact): fact is EventFact => fact !== null)
}

/** 지난 행사를 해마다 묶는다 — 최근 해·최근 행사부터 */
export function groupPastByYear(events: readonly Event[]): EventYearGroup[] {
  const byYear = new Map<number, Event[]>()
  for (const event of [...events].sort((a, b) => b.event_date.localeCompare(a.event_date))) {
    const year = eventYear(event)
    byYear.set(year, [...(byYear.get(year) ?? []), event])
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, grouped]) => ({ year, events: grouped }))
}

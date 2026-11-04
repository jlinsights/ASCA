import type { Notice } from '@/lib/types/cms-legacy'
import { kstDate, todayKst } from '@/lib/events/event-view'

/**
 * 공지 화면용 계산 — 목록과 상세가 같은 규칙으로 날짜·분류·항목을 읽는다.
 * 공지 본문은 설명 문단 + '구분: 행사' 같은 항목 줄이다(옛 사이트에서 옮겨 온 43건 모두 이 꼴, 2026-11-03).
 * 게시일은 서버에서 한국 날짜로 바꿔 넘긴다 — 자정 KST 를 UTC 로 읽으면 하루(연말엔 한 해) 당겨진다.
 */

export const NOTICE_CATEGORIES = ['announcement', 'event', 'general', 'urgent'] as const
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number]

export type NoticePhase = 'upcoming' | 'ongoing' | 'past'

/** 표로 옮길 항목과 그 순서 — 여기 없는 '항목: 값' 줄은 본문에 남긴다. 원문(옛 Webflow 주소, 404)은 버린다 */
export const NOTICE_FIELD_KEYS = [
  '구분',
  '기간',
  '장례기간',
  '장소',
  '주최',
  '주관',
  '후원',
  '협찬',
] as const
export type NoticeFieldKey = (typeof NOTICE_FIELD_KEYS)[number]

export interface NoticeFact {
  key: NoticeFieldKey
  value: string
}

export interface NoticePeriod {
  start: string
  end: string
}

/** 목록 한 줄과 상세 머리에 필요한 값 — 직렬화할 수 있는 값만 담아 서버에서 넘긴다 */
export interface NoticeRow {
  id: string
  title: string
  summary: string
  category: NoticeCategory
  pinned: boolean
  /** 게시일 'YYYY-MM-DD'(KST) */
  published: string
  year: number
  /** 'MM.DD' — 장부의 날짜 칸 */
  monthDay: string
  period: NoticePeriod | null
  phase: NoticePhase | null
  place: string
}

const FIELD_LINE = /^([가-힣]{2,4})\s*:\s*(.+)$/
const DROPPED_FIELDS = new Set(['원문'])
const ISO_DAY = /(\d{4}-\d{2}-\d{2})(?:\s*~\s*(\d{4}-\d{2}-\d{2}))?/

const isFieldKey = (key: string): key is NoticeFieldKey =>
  (NOTICE_FIELD_KEYS as readonly string[]).includes(key)

export function noticeCategory(value: string | undefined): NoticeCategory {
  return (NOTICE_CATEGORIES as readonly string[]).includes(value ?? '')
    ? (value as NoticeCategory)
    : 'general'
}

/** 본문을 설명 문단(lead)과 항목으로 나눈다 */
export function parseNoticeContent(content: string | undefined): {
  lead: string
  fields: Partial<Record<NoticeFieldKey, string>>
} {
  const fields: Partial<Record<NoticeFieldKey, string>> = {}
  const prose: string[] = []
  for (const raw of (content ?? '').split('\n')) {
    const match = FIELD_LINE.exec(raw.trim())
    const key = match?.[1] ?? ''
    if (match && isFieldKey(key)) fields[key] = (match[2] ?? '').trim()
    else if (!(match && DROPPED_FIELDS.has(key))) prose.push(raw)
  }
  return { lead: prose.join('\n').trim(), fields }
}

export function noticeFacts(content: string | undefined): NoticeFact[] {
  const { fields } = parseNoticeContent(content)
  return NOTICE_FIELD_KEYS.flatMap(key => {
    const value = fields[key]
    return value ? [{ key, value }] : []
  })
}

/** '2027-04-07 ~ 2027-04-11' · '2026-03-14' → 기간. 날짜가 없으면 null */
export function noticePeriod(text: string | undefined): NoticePeriod | null {
  const match = ISO_DAY.exec(text ?? '')
  if (!match?.[1]) return null
  const start = match[1]
  const end = match[2] && match[2] >= start ? match[2] : start
  return { start, end }
}

export function noticePhase(period: NoticePeriod | null, today: string): NoticePhase | null {
  if (!period) return null
  if (today < period.start) return 'upcoming'
  if (today <= period.end) return 'ongoing'
  return 'past'
}

export function toNoticeRow(notice: Notice, today: string = todayKst()): NoticeRow {
  const published = kstDate(notice.published_at)
  const { lead, fields } = parseNoticeContent(notice.content)
  const period = noticePeriod(fields.기간 ?? fields.장례기간)
  return {
    id: notice.id,
    title: notice.title,
    summary: notice.excerpt?.trim() || lead,
    category: noticeCategory(notice.category),
    pinned: notice.is_pinned,
    published,
    year: Number(published.slice(0, 4)),
    monthDay: published.slice(5).replace('-', '.'),
    period,
    phase: noticePhase(period, today),
    place: fields.장소 ?? '',
  }
}

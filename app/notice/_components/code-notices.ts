import {
  calendarNoticeRow,
  isCalendarEventOpen,
} from '@/app/events/calendar-2027/_components/calendar-2027-data'
import type { NoticeRow } from '@/lib/notices/notice-view'

/**
 * 공지 표(notices) 밖에서 코드로 둔 안내를 공지 목록에 합친다 — 지금은 2027 캘린더 증정 행사 하나.
 * 행사 페이지·홈·행사 목록과 같은 마감(isCalendarEventOpen)을 따르고, 게시일 순서를 지킨다(2026-11-04).
 */
export function withCodeNotices(
  rows: readonly NoticeRow[],
  today: string,
  now: Date = new Date()
): NoticeRow[] {
  const extra = isCalendarEventOpen(now) ? [calendarNoticeRow(today)] : []
  // 정렬은 안정적이라 같은 날 공지끼리는 표에서 읽은 순서가 남는다
  return [...extra, ...rows].sort((a, b) => b.published.localeCompare(a.published))
}

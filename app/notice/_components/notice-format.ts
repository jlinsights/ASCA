import { contestDate } from '@/app/contests/_components/contest-i18n'
import type { Language } from '@/lib/i18n/types'
import type { NoticePeriod, NoticeRow } from '@/lib/notices/notice-view'

/** 공지 날짜 표기 — 날짜 꼴은 공모전 화면(contestDate)과 같은 규칙을 쓴다 */

export function noticeDate(iso: string, lang: Language, withYear = true): string {
  return contestDate(iso, lang, withYear)
}

/** 하루짜리는 날짜 하나, 같은 해면 끝 연도를 뺀다 */
export function noticePeriodLabel(period: NoticePeriod, lang: Language): string {
  if (period.start === period.end) return noticeDate(period.start, lang)
  const sameYear = period.start.slice(0, 4) === period.end.slice(0, 4)
  return `${noticeDate(period.start, lang)} – ${noticeDate(period.end, lang, !sameYear)}`
}

/** 검색 — 띄어 쓴 낱말이 모두 제목·발췌·본문 어딘가에 있어야 한다(옛 searchNotices 와 같은 범위) */
export function matchesQuery(row: NoticeRow, query: string): boolean {
  if (!query) return true
  const haystack = row.searchText
  return query
    .toLowerCase()
    .split(/\s+/)
    .every(term => haystack.includes(term))
}

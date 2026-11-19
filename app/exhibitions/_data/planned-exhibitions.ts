import { historyEvents, type HistoryEvent } from '@/app/history/_data/history-events'
import { CONTEST_23, koDate } from '@/app/contests/_components/contest-23-data'

// 아직 열리지 않은 전시 — 연혁(history-events.ts)은 지나간 일의 기록이라 여기 두지 않는다.
// 날짜·장소는 공모요강 값(CONTEST_23) 하나에서 읽는다. 전시가 끝나 연혁에 같은 제목이 실리면 여기 것은 빠진다.

const [startYear, startMonth] = CONTEST_23.exhibitionStart.split('-').map(Number) as [
  number,
  number,
]

export const PLANNED_EXHIBITIONS: readonly HistoryEvent[] = [
  {
    id: `contest-${CONTEST_23.edition}`,
    year: startYear,
    month: startMonth,
    // 역대 회차와 같은 공식 한자 전시명
    title: `第${CONTEST_23.edition}回 大韓民國 東洋書藝大展`,
    subtitle: '공모전 · 書境 초대작가전 · 개인전 · 부스전',
    venue: `${CONTEST_23.venue} 제1·2전시실`,
    date: `${koDate(CONTEST_23.exhibitionStart)} ~ ${koDate(CONTEST_23.exhibitionEnd, false)}`,
    type: 'exhibition',
    href: `/contests/${CONTEST_23.edition}`,
  },
]

/** 전시 페이지가 쓰는 목록 — 연혁 기록 + 아직 연혁에 없는 예정 전시 */
export function exhibitionEvents(
  history: readonly HistoryEvent[] = historyEvents,
  planned: readonly HistoryEvent[] = PLANNED_EXHIBITIONS
): HistoryEvent[] {
  const recorded = new Set(history.map(event => event.title))
  return [...history, ...planned.filter(event => !recorded.has(event.title))]
}

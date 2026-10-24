import type { HistoryEvent } from '@/app/history/_data/history-events'

// /exhibitions 의 현재·예정·지난·온라인 페이지는 협회 연혁 기록(history-events.ts)만 쓴다.
// 예전 페이지들은 실제 기록과 맞지 않는 예시 전시(가상 큐레이터·관람객 수 등)를 보여 줬다.
// 연혁에는 연·월만 있어 달 단위로 가른다: 이번 달 = 현재, 이후 = 예정, 이전 = 지난 전시.

export interface ExhibitionRecords {
  /** /exhibitions 목록 — 전 회차, 최신순 */
  all: HistoryEvent[]
  current: HistoryEvent[]
  upcoming: HistoryEvent[]
  past: HistoryEvent[]
  online: HistoryEvent[]
}

const monthKey = (year: number, month: number) => year * 100 + month

export function getExhibitionRecords(
  events: readonly HistoryEvent[],
  now: Date = new Date()
): ExhibitionRecords {
  const thisMonth = monthKey(now.getFullYear(), now.getMonth() + 1)
  const exhibitions = events
    .filter(e => e.type === 'exhibition')
    .toSorted((a, b) => monthKey(b.year, b.month) - monthKey(a.year, a.month))

  return {
    all: exhibitions,
    current: exhibitions.filter(e => monthKey(e.year, e.month) === thisMonth),
    upcoming: exhibitions.filter(e => monthKey(e.year, e.month) > thisMonth).toReversed(),
    past: exhibitions.filter(e => monthKey(e.year, e.month) < thisMonth),
    online: exhibitions.filter(e => e.online === true),
  }
}

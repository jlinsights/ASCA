import { historyEvents } from '@/app/history/_data/history-events'

/**
 * 역대 대한민국 동양서예대전 — 연혁(history-events.ts)에서 뽑는다.
 * 예전 /awards 는 회차 수(7+)·출품 수·수상 인원·개최일을 손으로 적어 연혁·규정과 어긋났고,
 * /awards/[year] 는 지어낸 수상자·심사위원 이름을 실제처럼 보였다. 수상자 명단은 공개 자료가 생기면 싣는다.
 */

export interface ContestEdition {
  edition: number
  year: number
  date?: string
  venue?: string
  online: boolean
}

const EDITION_TITLE = /^第(\d+)回 大韓民國 東洋書藝大展$/

export const CONTEST_EDITIONS: readonly ContestEdition[] = historyEvents
  .flatMap(event => {
    const match = EDITION_TITLE.exec(event.title)
    if (!match) return []
    return [
      {
        edition: Number(match[1]),
        year: event.year,
        date: event.date,
        venue: event.venue,
        online: event.online ?? false,
      },
    ]
  })
  .sort((a, b) => b.edition - a.edition)

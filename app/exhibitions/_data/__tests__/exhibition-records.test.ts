import { historyEvents, type HistoryEvent } from '@/app/history/_data/history-events'
import { getExhibitionRecords } from '../exhibition-records'

const OCT_2026 = new Date('2026-10-11T12:00:00+09:00')

describe('getExhibitionRecords — 연혁 기록에서 전시 페이지 목록을 만든다', () => {
  it('지난 전시: 실제 전시 기록만, 최신순', () => {
    const { past } = getExhibitionRecords(historyEvents, OCT_2026)
    expect(past.length).toBeGreaterThan(20)
    expect(past.every(e => e.type === 'exhibition')).toBe(true)
    expect(past[0]?.id).toBe('2026-4')
    const keys = past.map(e => e.year * 100 + e.month)
    expect(keys).toStrictEqual([...keys].sort((a, b) => b - a))
  })

  it('2026년 4월 書境 특별기획전은 2026년 10월 기준 지난 전시다', () => {
    const { past, current, upcoming } = getExhibitionRecords(historyEvents, OCT_2026)
    expect(past.some(e => e.id === '2026-4')).toBe(true)
    expect(current).toStrictEqual([])
    expect(upcoming).toStrictEqual([])
  })

  it('현재·예정은 달 단위로 가른다', () => {
    const future: HistoryEvent = { id: 'f', year: 2026, month: 12, title: 'F', type: 'exhibition' }
    const thisMonth: HistoryEvent = {
      id: 'c',
      year: 2026,
      month: 10,
      title: 'C',
      type: 'exhibition',
    }
    const meeting: HistoryEvent = { id: 'm', year: 2026, month: 12, title: 'M', type: 'event' }
    const r = getExhibitionRecords([future, thisMonth, meeting], OCT_2026)
    expect(r.upcoming.map(e => e.id)).toStrictEqual(['f'])
    expect(r.current.map(e => e.id)).toStrictEqual(['c'])
    expect(r.past).toStrictEqual([])
  })

  it('온라인 전시: 인터넷 전시로 열린 회차(2020)', () => {
    const { online } = getExhibitionRecords(historyEvents, OCT_2026)
    expect(online.map(e => e.year)).toStrictEqual([2020])
  })
})

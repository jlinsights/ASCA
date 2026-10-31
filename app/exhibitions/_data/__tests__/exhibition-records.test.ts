import { historyEvents, type HistoryEvent } from '@/app/history/_data/history-events'
import { getExhibitionRecords } from '../exhibition-records'
import { PLANNED_EXHIBITIONS, exhibitionEvents } from '../planned-exhibitions'

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
    const { past, current } = getExhibitionRecords(historyEvents, OCT_2026)
    expect(past.some(e => e.id === '2026-4')).toBe(true)
    expect(current).toStrictEqual([])
  })

  // 회귀: 연혁만 읽어 2026-10 에 /exhibitions/upcoming 이 비어 있었다(제23회 대전은 2027-04)
  it('제23회 대전(2027년 4월)은 2026년 10월 기준 예정 전시다', () => {
    const { upcoming, past } = getExhibitionRecords(exhibitionEvents(), OCT_2026)
    expect(upcoming.map(e => e.id)).toStrictEqual(['contest-23'])
    expect(upcoming[0]).toMatchObject({
      year: 2027,
      month: 4,
      title: '第23回 大韓民國 東洋書藝大展',
      date: '2027년 4월 21일(수) ~ 4월 30일(금)',
      href: '/contests/23',
    })
    expect(past.some(e => e.id === 'contest-23')).toBe(false)
  })

  it('전시가 열린 달엔 현재 전시, 지나면 지난 전시로 옮겨 간다', () => {
    const april = getExhibitionRecords(exhibitionEvents(), new Date('2027-04-25T12:00:00+09:00'))
    expect(april.current.map(e => e.id)).toContain('contest-23')
    const may = getExhibitionRecords(exhibitionEvents(), new Date('2027-05-02T12:00:00+09:00'))
    expect(may.past[0]?.id).toBe('contest-23')
  })

  it('연혁에 같은 전시명이 실리면 예정 항목은 빠진다(두 번 나오지 않는다)', () => {
    const recorded: HistoryEvent = { ...PLANNED_EXHIBITIONS[0]!, id: '2027-4', href: undefined }
    const events = exhibitionEvents([recorded])
    expect(events.map(e => e.id)).toStrictEqual(['2027-4'])
  })

  it('연혁 페이지가 쓰는 historyEvents 에는 예정 전시가 섞이지 않는다', () => {
    expect(historyEvents.some(e => e.id === 'contest-23')).toBe(false)
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

  it('전체 목록: 현재·예정·지난 전시를 빠짐없이 최신순으로', () => {
    const { all, past, current, upcoming } = getExhibitionRecords(exhibitionEvents(), OCT_2026)
    expect(all.length).toBe(past.length + current.length + upcoming.length)
    expect(all[0]?.id).toBe('contest-23')
  })

  it('온라인 전시: 인터넷 전시로 열린 회차(2020)', () => {
    const { online } = getExhibitionRecords(historyEvents, OCT_2026)
    expect(online.map(e => e.year)).toStrictEqual([2020])
  })
})

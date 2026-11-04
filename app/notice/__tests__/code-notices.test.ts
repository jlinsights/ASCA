import type { NoticeRow } from '@/lib/notices/notice-view'
import { noticeHref } from '@/lib/notices/notice-view'
import { withCodeNotices } from '../_components/code-notices'

const row = (id: string, published: string): NoticeRow => ({
  id,
  title: id,
  summary: '',
  category: 'announcement',
  pinned: false,
  published,
  year: Number(published.slice(0, 4)),
  monthDay: `${published.slice(5, 7)}.${published.slice(8, 10)}`,
  period: null,
  phase: null,
  place: '',
  searchText: id,
})

const DB = [row('late', '2026-11-20'), row('early', '2026-10-23')]

describe('코드로 둔 공지', () => {
  it('신청 기간에는 캘린더 증정 행사를 고정 행사 공지로, 게시일 순서 자리에 끼운다', () => {
    const rows = withCodeNotices(DB, '2026-11-04', new Date('2026-11-04T12:00:00+09:00'))
    expect(rows.map(r => r.id)).toEqual(['late', 'calendar-2027', 'early'])
    const calendar = rows[1]!
    expect(calendar).toMatchObject({
      title: '2027 동양서예 캘린더 증정 행사',
      category: 'event',
      pinned: true,
      published: '2026-10-25',
      year: 2026,
      monthDay: '10.25',
      period: { start: '2026-10-25', end: '2026-12-15' },
      phase: 'ongoing',
    })
    expect(calendar.searchText).toContain('캘린더')
  })

  it('누르면 공지 상세가 아니라 행사 페이지로 간다', () => {
    const [calendar] = withCodeNotices([], '2026-11-04', new Date('2026-11-04T12:00:00+09:00'))
    expect(noticeHref(calendar!)).toBe('/events/calendar-2027')
    expect(noticeHref(DB[0]!)).toBe('/notice/late')
  })

  it('신청 마감(2026-12-15 18:00 KST)이 지나면 빠진다', () => {
    const before = withCodeNotices(DB, '2026-12-15', new Date('2026-12-15T17:59:00+09:00'))
    expect(before.map(r => r.id)).toContain('calendar-2027')
    const after = withCodeNotices(DB, '2026-12-15', new Date('2026-12-15T18:00:00+09:00'))
    expect(after.map(r => r.id)).toEqual(['late', 'early'])
  })
})

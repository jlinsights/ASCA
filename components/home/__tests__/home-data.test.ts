import { getHomeStats, getRecentExhibitions, getLatestPosts } from '../home-data'
import type { HistoryEvent } from '@/app/history/_data/history-events'

const ev = (over: Partial<HistoryEvent>): HistoryEvent => ({
  id: 'x',
  year: 2020,
  month: 1,
  title: 't',
  type: 'exhibition',
  ...over,
})

describe('getHomeStats', () => {
  const events = [
    ev({ id: 'a', year: 1997, title: '韓·中·日 書藝文化交流聯合會展' }),
    ev({ id: 'b', year: 2024, title: '第21回 大韓民國 東洋書藝大展' }),
    ev({ id: 'c', year: 2025, title: '第22回 大韓民國 東洋書藝大展' }),
    ev({ id: 'd', year: 2025, title: '大韓民國 東洋書藝大展 現場揮毫 審査大會' }),
    ev({ id: 'e', year: 2025, title: '2025 임시총회', type: 'event' }),
  ]

  it('takes the founding year from the earliest entry', () => {
    expect(getHomeStats(events).sinceYear).toBe(1997)
  })

  it('takes the highest 東洋書藝大展 edition, ignoring unnumbered titles', () => {
    expect(getHomeStats(events).grandExhibitionEdition).toBe(22)
  })

  it('counts exhibition entries only', () => {
    expect(getHomeStats(events).exhibitionCount).toBe(4)
  })

  it('returns null edition when no numbered grand exhibition exists', () => {
    expect(getHomeStats([ev({ title: '특별전' })]).grandExhibitionEdition).toBeNull()
  })
})

describe('getRecentExhibitions', () => {
  const events = [
    ev({ id: 'old', year: 2023, month: 6 }),
    ev({ id: 'new', year: 2025, month: 6 }),
    ev({ id: 'mid', year: 2025, month: 2 }),
    ev({ id: 'meeting', year: 2026, month: 1, type: 'event' }),
  ]

  it('returns exhibitions newest first, excluding other types', () => {
    expect(getRecentExhibitions(events, 3).map(e => e.id)).toEqual(['new', 'mid', 'old'])
  })

  it('respects the limit', () => {
    expect(getRecentExhibitions(events, 1).map(e => e.id)).toEqual(['new'])
  })

  it('does not mutate the input order', () => {
    const before = events.map(e => e.id)
    getRecentExhibitions(events, 3)
    expect(events.map(e => e.id)).toEqual(before)
  })
})

describe('getLatestPosts', () => {
  const posts = [
    {
      id: 'p1',
      title: 'A',
      summary: 's1',
      publishedAt: '2025-10-16T15:00:00.000Z',
      link: 'https://x/1',
    },
    {
      id: 'p2',
      title: 'B',
      summary: 's2',
      publishedAt: '2025-12-13T15:00:00.000Z',
      link: 'https://x/2',
    },
    {
      id: 'p3',
      title: 'C',
      summary: '',
      publishedAt: '2025-12-01T15:00:00.000Z',
      link: 'https://x/3',
    },
  ]

  it('sorts by publishedAt descending and limits', () => {
    expect(getLatestPosts(posts, 2).map(p => p.id)).toEqual(['p2', 'p3'])
  })

  it('formats the date in KST as YYYY.MM.DD', () => {
    // 2025-12-13T15:00Z is 2025-12-14 00:00 in Seoul
    expect(getLatestPosts(posts, 1)[0]?.date).toBe('2025.12.14')
  })

  // 원본 요약은 HTML 을 공백 없이 벗긴 것이라 홈에 싣지 않는다
  // 옛 Webflow 주소(link)가 아니라 이 사이트의 /blog/<slug> 로 보낸다(리다이렉트 2번을 거치지 않게)
  it('carries title, date and the on-site /blog/<id> link only — no summary text', () => {
    expect(getLatestPosts(posts, 1)[0]).toEqual({
      id: 'p2',
      title: 'B',
      date: '2025.12.14',
      isoDate: '2025-12-13T15:00:00.000Z',
      href: '/blog/p2',
    })
  })
})

import type { Notice } from '@/lib/types/cms-legacy'
import {
  NOTICE_CATEGORIES,
  noticeCategory,
  noticeFacts,
  noticePeriod,
  noticePhase,
  toNoticeRow,
} from '../notice-view'

// 실제 공지 본문 모양 — 설명 문단 다음 줄마다 '항목: 값', 맨 끝 원문은 옛 Webflow 주소(404)
const TOUR = [
  '대만의 서예 유적과 박물관을 둘러보는 4박 5일 서예 문화 기행입니다.',
  '',
  '구분: 행사',
  '기간: 2027-04-07 ~ 2027-04-11',
  '장소: 대만 타오위안 · 타이베이 · 타이중',
  '주최: 사단법인 동양서예협회',
  '원문: https://orientalcalligraphy.org/event/2027-oriental-calligraphy-tour',
].join('\n')

function notice(overrides: Partial<Notice> & { category?: string } = {}): Notice {
  return {
    id: 'n1',
    title: '대만 서예 문화 기행',
    content: TOUR,
    excerpt: '대만의 서예 유적과 박물관을 둘러보는 4박 5일 서예 문화 기행입니다.',
    category: 'general',
    is_pinned: false,
    is_published: true,
    views: 0,
    author_name: '관리자',
    created_at: '2026-10-23T00:00:00+09:00',
    updated_at: '2026-10-23T00:00:00+09:00',
    // 자정 KST 는 UTC 로 전날 15시 — 연도·날짜를 UTC 로 읽으면 하루 당겨진다
    published_at: '2025-12-31T15:00:00Z',
    ...overrides,
  } as Notice
}

describe('noticeCategory', () => {
  it('DB 의 분류 값을 그대로 쓰고, 모르는 값은 일반으로 본다', () => {
    expect(noticeCategory('announcement')).toBe('announcement')
    expect(noticeCategory('event')).toBe('event')
    expect(noticeCategory('urgent')).toBe('urgent')
    expect(noticeCategory('exhibition')).toBe('general')
    expect(noticeCategory(undefined)).toBe('general')
  })

  it('분류 순서는 공지·행사·일반·긴급이다', () => {
    expect(NOTICE_CATEGORIES).toEqual(['announcement', 'event', 'general', 'urgent'])
  })
})

describe('noticePeriod', () => {
  it('"시작 ~ 끝" 과 하루짜리 기간을 읽는다', () => {
    expect(noticePeriod('2027-04-07 ~ 2027-04-11')).toEqual({
      start: '2027-04-07',
      end: '2027-04-11',
    })
    expect(noticePeriod('2026-03-14')).toEqual({ start: '2026-03-14', end: '2026-03-14' })
  })

  it('날짜가 없거나 끝이 시작보다 앞서면 믿지 않는다', () => {
    expect(noticePeriod(undefined)).toBeNull()
    expect(noticePeriod('추후 공지')).toBeNull()
    expect(noticePeriod('2027-04-11 ~ 2027-04-07')).toEqual({
      start: '2027-04-11',
      end: '2027-04-11',
    })
  })
})

describe('noticePhase', () => {
  const period = { start: '2027-04-07', end: '2027-04-11' }
  it('오늘(KST) 기준으로 예정·진행 중·지난 것을 가른다', () => {
    expect(noticePhase(period, '2027-04-06')).toBe('upcoming')
    expect(noticePhase(period, '2027-04-07')).toBe('ongoing')
    expect(noticePhase(period, '2027-04-11')).toBe('ongoing')
    expect(noticePhase(period, '2027-04-12')).toBe('past')
    expect(noticePhase(null, '2027-04-12')).toBeNull()
  })
})

describe('noticeFacts', () => {
  it('정한 순서의 항목만 표로 옮기고 원문 링크는 버린다', () => {
    expect(noticeFacts(TOUR)).toEqual([
      { key: '구분', value: '행사' },
      { key: '기간', value: '2027-04-07 ~ 2027-04-11' },
      { key: '장소', value: '대만 타오위안 · 타이베이 · 타이중' },
      { key: '주최', value: '사단법인 동양서예협회' },
    ])
  })

  it('목록에 없는 "항목: 값" 줄은 표로 옮기지 않는다', () => {
    expect(noticeFacts('안내문\n참고: 본문에 남는 줄\n구분: 공지')).toEqual([
      { key: '구분', value: '공지' },
    ])
  })
})

describe('toNoticeRow', () => {
  it('게시일은 한국 날짜로, 요약은 발췌를 쓰고, 기간이 있으면 상태를 단다', () => {
    const row = toNoticeRow(notice({ category: 'event', is_pinned: true }), '2026-11-03')
    expect(row).toMatchObject({
      id: 'n1',
      title: '대만 서예 문화 기행',
      summary: '대만의 서예 유적과 박물관을 둘러보는 4박 5일 서예 문화 기행입니다.',
      category: 'event',
      pinned: true,
      published: '2026-01-01',
      year: 2026,
      monthDay: '01.01',
      period: { start: '2027-04-07', end: '2027-04-11' },
      phase: 'upcoming',
      place: '대만 타오위안 · 타이베이 · 타이중',
    })
  })

  it('발췌가 없으면 본문 설명 문단을 요약으로 쓴다', () => {
    const row = toNoticeRow(notice({ excerpt: '' }), '2026-11-03')
    expect(row.summary).toBe('대만의 서예 유적과 박물관을 둘러보는 4박 5일 서예 문화 기행입니다.')
  })

  it('항목 줄이 없는 공지는 기간·상태 없이 그린다', () => {
    const row = toNoticeRow(notice({ content: '사무국 휴무 안내입니다.' }), '2026-11-03')
    expect(row.period).toBeNull()
    expect(row.phase).toBeNull()
    expect(row.place).toBe('')
  })

  it('검색용 글에는 요약에 없는 본문 항목(주최·후원)까지 담는다', () => {
    const row = toNoticeRow(notice({ content: '안내문\n주최: 동양서예협회\n후원: 문화체육관광부' }))
    expect(row.searchText).toContain('문화체육관광부')
  })
})

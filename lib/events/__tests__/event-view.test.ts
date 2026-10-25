import type { Event } from '@/lib/types/cms-legacy'
import {
  eventFacts,
  eventPeriod,
  eventPhase,
  groupPastByYear,
  kstDate,
  parseEventContent,
} from '../event-view'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'e1',
    title: '가상 서예전',
    description: '가상 설명입니다.',
    event_date: '2025-10-02T15:00:00+00:00', // 2025-10-03 00:00 KST
    end_date: '2025-10-09T15:00:00+00:00', // 2025-10-10 00:00 KST
    location: '가상 전시실',
    venue: '가상시 가상로 1',
    organizer: '가상 주최',
    event_type: 'exhibition',
    status: 'completed',
    is_featured: false,
    is_published: true,
    views: 0,
    current_participants: 0,
    registration_required: false,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

describe('kstDate', () => {
  // 서버(UTC)에서 그리면 자정 KST 가 전날 15시로 읽혀 하루씩 당겨진다
  it('UTC 로 저장된 자정 KST 를 한국 날짜로 읽는다', () => {
    expect(kstDate('2025-10-02T15:00:00+00:00')).toBe('2025-10-03')
    expect(kstDate('2026-02-13T00:00:00+09:00')).toBe('2026-02-13')
  })
})

describe('eventPeriod', () => {
  // 회귀: 날짜만 있는 행사에 "오전 12:00"이 붙었다
  it('시각 없이 날짜와 요일만 쓴다', () => {
    const period = eventPeriod(makeEvent({ end_date: undefined }))
    expect(period).toBe('2025년 10월 3일(금)')
    expect(period).not.toMatch(/오전|12:00/)
  })

  it('여러 날 행사는 시작–끝으로, 같은 해면 끝 연도를 뺀다', () => {
    expect(eventPeriod(makeEvent())).toBe('2025년 10월 3일(금) – 10월 10일(금)')
  })

  it('해를 넘기면 끝에도 연도를 쓴다', () => {
    const event = makeEvent({
      event_date: '2025-12-23T15:00:00Z',
      end_date: '2026-01-02T15:00:00Z',
    })
    expect(eventPeriod(event)).toBe('2025년 12월 24일(수) – 2026년 1월 3일(토)')
  })

  it('끝 날짜가 시작과 같으면 하루로 쓴다', () => {
    const event = makeEvent({ end_date: '2025-10-02T15:00:00Z' })
    expect(eventPeriod(event)).toBe('2025년 10월 3일(금)')
  })
})

describe('eventPhase', () => {
  // DB 의 status 는 손으로 넣은 값이라 날짜가 지나도 '예정'으로 남을 수 있다 — 날짜로 판단한다
  it('날짜로 예정·진행 중·지난 행사를 가른다', () => {
    const event = makeEvent({ status: 'upcoming' })
    expect(eventPhase(event, '2025-10-01')).toBe('upcoming')
    expect(eventPhase(event, '2025-10-03')).toBe('ongoing')
    expect(eventPhase(event, '2025-10-10')).toBe('ongoing')
    expect(eventPhase(event, '2025-10-11')).toBe('past')
  })

  it('취소된 행사는 날짜와 관계없이 취소', () => {
    expect(eventPhase(makeEvent({ status: 'cancelled' }), '2025-01-01')).toBe('cancelled')
  })
})

describe('parseEventContent', () => {
  const content = [
    '가상 작가의 서예 개인전입니다. 협회가 후원했습니다.',
    '',
    '구분: 전시회',
    '기간: 2025-10-03 ~ 2025-10-10',
    '장소: 가상 전시실 (가상시 가상로 1)',
    '주최: 가상 주최',
    '주관: 가상 주관',
    '후원: 사단법인 동양서예협회',
    '',
    '원문: https://orientalcalligraphy.org/event/sample',
  ].join('\n')

  it('본문과 항목 줄을 나눈다', () => {
    const parsed = parseEventContent(content, '짧은 설명')
    expect(parsed.lead).toBe('가상 작가의 서예 개인전입니다. 협회가 후원했습니다.')
    expect(parsed.fields).toMatchObject({ 구분: '전시회', 주관: '가상 주관' })
  })

  // 옛 Webflow 주소 — 도메인을 이 앱으로 옮기면 404 가 된다
  it('옛 사이트 원문 링크는 버린다', () => {
    const parsed = parseEventContent(content, '짧은 설명')
    expect(parsed.fields.원문).toBeUndefined()
    expect(parsed.lead).not.toContain('orientalcalligraphy.org')
  })

  it('본문이 없으면 짧은 설명을 쓴다', () => {
    expect(parseEventContent(undefined, '짧은 설명').lead).toBe('짧은 설명')
  })
})

describe('eventFacts', () => {
  it('장소는 이름과 주소를 함께, 주관이 주최와 같으면 뺀다', () => {
    const event = makeEvent()
    const facts = eventFacts(event, {
      lead: '',
      fields: { 구분: '전시회', 주관: '가상 주최', 후원: '사단법인 동양서예협회' },
    })
    expect(facts).toEqual([
      { label: '구분', value: '전시회' },
      { label: '기간', value: '2025년 10월 3일(금) – 10월 10일(금)' },
      { label: '장소', value: '가상 전시실 · 가상시 가상로 1' },
      { label: '주최', value: '가상 주최' },
      { label: '후원', value: '사단법인 동양서예협회' },
    ])
  })
})

describe('groupPastByYear', () => {
  it('최근 해부터 묶는다', () => {
    const groups = groupPastByYear([
      makeEvent({ id: 'a', event_date: '2024-03-01T00:00:00+09:00' }),
      makeEvent({ id: 'b', event_date: '2025-10-03T00:00:00+09:00' }),
      makeEvent({ id: 'c', event_date: '2025-01-01T00:00:00+09:00' }),
    ])
    expect(groups.map(group => [group.year, group.events.map(event => event.id)])).toEqual([
      [2025, ['b', 'c']],
      [2024, ['a']],
    ])
  })
})

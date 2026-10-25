import { render, screen, within } from '@testing-library/react'
import EventDetailPage, { generateMetadata } from '../page'
import type { Event } from '@/lib/types/cms-legacy'

const getPublishedEvent = jest.fn()
const listPublishedEvents = jest.fn()

jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/lib/utils/logger', () => ({ log: { error: jest.fn() } }))
jest.mock('@/lib/supabase/cms', () => ({
  incrementEventViews: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/lib/events/events-data', () => ({
  getPublishedEvent: (id: string) => getPublishedEvent(id),
  listPublishedEvents: () => listPublishedEvents(),
}))

const ID = '00000000-0000-4000-8000-000000000001'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: ID,
    title: '가상 서예 개인전',
    description: '짧은 설명',
    content: [
      '가상 작가의 서예 개인전입니다. 협회가 후원했습니다.',
      '',
      '구분: 전시회',
      '주관: 가상 주관',
      '후원: 사단법인 동양서예협회',
      '',
      '원문: https://orientalcalligraphy.org/event/sample',
    ].join('\n'),
    event_date: '2025-10-02T15:00:00+00:00',
    end_date: '2025-10-09T15:00:00+00:00',
    location: '가상 전시실',
    venue: '가상시 가상로 1',
    organizer: '가상 작가',
    event_type: 'exhibition',
    status: 'completed',
    is_featured: false,
    is_published: true,
    views: 3,
    current_participants: 0,
    registration_required: false,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

const render$ = async (id = ID) =>
  render(await EventDetailPage({ params: Promise.resolve({ id }) }))

describe('행사 상세 페이지', () => {
  beforeEach(() => {
    getPublishedEvent.mockResolvedValue(makeEvent())
    listPublishedEvents.mockResolvedValue([])
  })

  // 회귀: 날짜만 있는 행사에 "오전 12:00"이 붙고, 장소 칸에 주소가 들어갔다
  it('기간은 날짜로, 장소는 이름으로 보여 준다', async () => {
    await render$()
    expect(screen.getAllByText('2025년 10월 3일(금) – 10월 10일(금)').length).toBeGreaterThan(0)
    expect(screen.queryByText(/오전 12:00/)).not.toBeInTheDocument()
    expect(screen.getByText('가상 전시실')).toBeInTheDocument()
  })

  // 회귀: 본문(content)을 쓰지 않고 짧은 설명만 보였다
  it('본문을 보여 주고 항목 줄은 행사 정보 표로 옮긴다', async () => {
    await render$()
    expect(
      screen.getByText('가상 작가의 서예 개인전입니다. 협회가 후원했습니다.')
    ).toBeInTheDocument()
    const table = screen.getByRole('table', { name: /행사 정보/ })
    expect(within(table).getByText('가상 주관')).toBeInTheDocument()
    expect(within(table).getByText('가상 전시실 · 가상시 가상로 1')).toBeInTheDocument()
  })

  it('옛 사이트 원문 링크는 보이지 않는다', async () => {
    const { container } = await render$()
    expect(container.innerHTML).not.toContain('orientalcalligraphy.org/event')
  })

  // 회귀: 관련 행사 조회가 실패하자 이미 읽은 본문까지 오류 화면이 됐다
  it('관련 행사를 못 읽어도 본문은 그린다', async () => {
    listPublishedEvents.mockRejectedValue(new Error('column does not exist'))
    await render$()
    expect(screen.getByText(/가상 작가의 서예 개인전입니다/)).toBeInTheDocument()
  })

  it('같은 유형의 다른 행사를 잇는다', async () => {
    listPublishedEvents.mockResolvedValue([
      makeEvent(),
      makeEvent({
        id: 'other-1',
        title: '다른 가상 전시',
        event_date: '2024-05-01T00:00:00+09:00',
      }),
      makeEvent({ id: 'other-2', title: '가상 총회', event_type: 'meeting' }),
    ])
    await render$()
    expect(screen.getByRole('link', { name: /다른 가상 전시/ })).toHaveAttribute(
      'href',
      '/events/other-1'
    )
    expect(screen.queryByRole('link', { name: /가상 총회/ })).not.toBeInTheDocument()
  })

  it('없는 행사는 404', async () => {
    getPublishedEvent.mockResolvedValue(null)
    await expect(render$()).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('제목과 설명을 메타데이터로 낸다', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: ID }) })
    expect(metadata.title).toBe('가상 서예 개인전 | 동양서예협회')
    expect(metadata.description).toContain('가상 작가의 서예 개인전입니다')
  })
})

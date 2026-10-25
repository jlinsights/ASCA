import { fireEvent, render, screen, within } from '@testing-library/react'
import EventsPage from '../page'
import type { Event } from '@/lib/types/cms-legacy'

const listPublishedEvents = jest.fn()
const replace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/events',
}))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/lib/events/events-data', () => ({
  listPublishedEvents: () => listPublishedEvents(),
}))
jest.mock('@/lib/events/event-view', () => ({
  ...jest.requireActual('@/lib/events/event-view'),
  todayKst: () => '2026-10-25',
}))

function makeEvent(id: string, title: string, date: string, type: Event['event_type']): Event {
  return {
    id,
    title,
    description: `${title} 설명`,
    event_date: `${date}T00:00:00+09:00`,
    location: `${title} 장소`,
    organizer: '가상 주최',
    event_type: type,
    status: 'completed', // 일부러 낡은 값 — 화면은 날짜로 판단해야 한다
    is_featured: false,
    is_published: true,
    views: 0,
    current_participants: 0,
    registration_required: false,
    created_at: '',
    updated_at: '',
  }
}

const EVENTS = [
  makeEvent('future', '가상 문화 기행', '2027-04-07', 'other'),
  makeEvent('a', '가상 이사회', '2026-02-13', 'meeting'),
  makeEvent('b', '가상 개인전', '2025-10-03', 'exhibition'),
  makeEvent('c', '가상 회원전', '2025-07-13', 'exhibition'),
]

const renderPage = async (search: Record<string, string> = {}) =>
  render(await EventsPage({ searchParams: Promise.resolve(search) }))

describe('행사 목록', () => {
  beforeEach(() => {
    listPublishedEvents.mockResolvedValue(EVENTS)
    replace.mockReset()
  })

  it('다가오는 행사와 지난 행사를 날짜로 나눈다', async () => {
    await renderPage()
    const upcoming = screen.getByRole('region', { name: '곧 열리는 행사' })
    expect(within(upcoming).getByRole('link', { name: '가상 문화 기행' })).toBeInTheDocument()
    const archive = screen.getByRole('region', { name: /년부터의 기록/ })
    expect(within(archive).queryByText('가상 문화 기행')).not.toBeInTheDocument()
    expect(within(archive).getByText('가상 개인전')).toBeInTheDocument()
  })

  // 회귀: "불러온 행사 9" — 한 쪽의 건수를 전체처럼 보였다
  it('기록된 행사 수는 전체 건수다', async () => {
    await renderPage()
    expect(screen.getByText('4건')).toBeInTheDocument()
  })

  it('지난 행사는 해마다 묶는다', async () => {
    await renderPage()
    expect(screen.getByRole('heading', { name: '2026' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2025' })).toBeInTheDocument()
  })

  it('유형 칩으로 거르고 주소에 남긴다', async () => {
    await renderPage()
    fireEvent.click(screen.getByRole('button', { name: /전시/ }))
    expect(screen.queryByText('가상 이사회')).not.toBeInTheDocument()
    expect(screen.getByText('가상 회원전')).toBeInTheDocument()
    expect(replace).toHaveBeenCalledWith('/events?type=exhibition#archive', { scroll: false })
  })

  it('주소의 유형으로 첫 화면부터 거른다', async () => {
    await renderPage({ type: 'meeting' })
    expect(screen.getByText('가상 이사회')).toBeInTheDocument()
    expect(screen.queryByText('가상 개인전')).not.toBeInTheDocument()
  })

  it('검색어는 띄어쓴 낱말을 모두 포함하는 행사만 남긴다', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox', { name: '행사 검색' }), {
      target: { value: '가상 회원전' },
    })
    expect(screen.getByText('가상 회원전')).toBeInTheDocument()
    expect(screen.queryByText('가상 개인전')).not.toBeInTheDocument()
  })

  it('맞는 행사가 없으면 조건을 지울 수 있다', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox', { name: '행사 검색' }), {
      target: { value: '없는행사' },
    })
    fireEvent.click(screen.getByRole('button', { name: '조건 지우기' }))
    expect(screen.getByText('가상 개인전')).toBeInTheDocument()
  })
})

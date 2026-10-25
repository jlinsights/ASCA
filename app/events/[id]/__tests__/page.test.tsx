import { render, screen } from '@testing-library/react'
import EventDetailPage from '../page'
import { getEventById, getRelatedEvents, incrementEventViews } from '@/lib/supabase/cms'
import type { Event } from '@/lib/types/cms-legacy'

jest.mock('next/navigation', () => ({ useParams: () => ({ id: 'evt-1' }) }))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/lib/supabase/cms', () => ({
  getEventById: jest.fn(),
  getRelatedEvents: jest.fn(),
  incrementEventViews: jest.fn(),
}))

const EVENT = {
  id: 'evt-1',
  title: '가상 서예 행사',
  description: '테스트용 설명입니다.',
  event_date: '2026-02-13T00:00:00+09:00',
  location: '가상 전시실',
  organizer: '가상 주최',
  event_type: 'meeting',
  status: 'completed',
  views: 0,
  current_participants: 0,
  is_featured: false,
  registration_required: false,
} as unknown as Event

describe('행사 상세 페이지', () => {
  beforeEach(() => {
    jest.mocked(getEventById).mockResolvedValue(EVENT)
    jest.mocked(incrementEventViews).mockResolvedValue()
    jest.mocked(getRelatedEvents).mockResolvedValue([])
  })

  // 회귀: 관련 행사 쿼리가 없는 열(start_date)로 정렬해 400 이 나자 행사 본문 전체가 오류 화면으로 바뀌었다
  it('관련 행사를 못 불러와도 행사 본문은 보인다', async () => {
    jest.mocked(getRelatedEvents).mockRejectedValue(new Error('column does not exist'))
    render(<EventDetailPage />)
    expect(await screen.findByText('테스트용 설명입니다.')).toBeInTheDocument()
    expect(screen.queryByText('오류가 발생했습니다')).not.toBeInTheDocument()
  })

  it('조회수 올리기에 실패해도 행사 본문은 보인다', async () => {
    jest.mocked(incrementEventViews).mockRejectedValue(new Error('rpc failed'))
    render(<EventDetailPage />)
    expect(await screen.findByText('테스트용 설명입니다.')).toBeInTheDocument()
  })

  it('없는 행사는 오류가 아니라 찾을 수 없다고 안내한다', async () => {
    jest.mocked(getEventById).mockResolvedValue(null)
    render(<EventDetailPage />)
    expect(await screen.findByText(/행사를 찾을 수 없습니다/)).toBeInTheDocument()
    expect(screen.queryByText('오류가 발생했습니다')).not.toBeInTheDocument()
  })
})

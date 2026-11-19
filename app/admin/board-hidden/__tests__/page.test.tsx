import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import AdminBoardHiddenPage from '../page'

const fetchMock = jest.fn()
const originalFetch = global.fetch
const json = (body: unknown, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => body,
})

const hidden = {
  id: 't1',
  title: '광고 글',
  body: '첫 줄\n둘째 줄',
  created_at: '2026-10-25T03:00:00Z',
  updated_at: '2026-10-25T03:00:00Z',
  edited: false,
  mine: false,
  author: { kind: 'member', name: '시험 회원', role: null, image: null, href: null },
  hidden_at: '2026-10-26T05:00:00Z',
  hidden_reason: '홍보성 글',
  hidden_by_name: '사무국',
}
const listed = (threads: unknown[], total = threads.length) => json({ data: { threads, total } })

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

const card = () => screen.findByRole('article', { name: '광고 글 숨긴 글' })

it('shows who wrote it, when and why it was hidden, and who hid it', async () => {
  fetchMock.mockResolvedValueOnce(listed([hidden]))
  render(<AdminBoardHiddenPage />)
  const item = within(await card())
  expect(item.getByRole('link', { name: '광고 글' })).toHaveAttribute('href', '/community/board/t1')
  expect(item.getByText('시험 회원', { exact: false })).toBeInTheDocument()
  expect(item.getByText('홍보성 글')).toBeInTheDocument()
  expect(item.getByText('사무국', { exact: false })).toBeInTheDocument()
  expect(screen.getByText('숨긴 글 1편')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/community/threads', {
    credentials: 'include',
  })
})

it('marks missing reason, moderator and withdrawn authors plainly', async () => {
  fetchMock.mockResolvedValueOnce(
    listed([
      {
        ...hidden,
        author: { kind: 'deleted', name: null, role: null, image: null, href: null },
        hidden_reason: null,
        hidden_by_name: null,
      },
    ])
  )
  render(<AdminBoardHiddenPage />)
  const item = within(await card())
  expect(item.getByText('(탈퇴한 회원)', { exact: false })).toBeInTheDocument()
  expect(item.getByText('(사유 없음)')).toBeInTheDocument()
  expect(item.getByText('(처리자 확인 불가)', { exact: false })).toBeInTheDocument()
})

it('says when only the most recent part of a long list is shown', async () => {
  fetchMock.mockResolvedValueOnce(listed([hidden], 140))
  render(<AdminBoardHiddenPage />)
  expect(await screen.findByText('숨긴 글 140편 중 최근 1편')).toBeInTheDocument()
})

it('restores a thread and reloads the list', async () => {
  fetchMock
    .mockResolvedValueOnce(listed([hidden]))
    .mockResolvedValueOnce(json({ data: { id: 't1', action: 'restore' } }))
    .mockResolvedValueOnce(listed([]))
  render(<AdminBoardHiddenPage />)
  fireEvent.click(within(await card()).getByRole('button', { name: '다시 보이게 하기' }))
  expect(await screen.findByRole('status')).toHaveTextContent('광고 글')
  expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/admin/community/threads/t1', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'restore' }),
  })
  expect(await screen.findByText('숨긴 글이 없습니다.')).toBeInTheDocument()
})

it('explains a restore that lost a race and still reloads', async () => {
  fetchMock
    .mockResolvedValueOnce(listed([hidden]))
    .mockResolvedValueOnce(json({ code: 'THREAD_STATE_CHANGED' }, 409))
    .mockResolvedValueOnce(listed([]))
  render(<AdminBoardHiddenPage />)
  fireEvent.click(within(await card()).getByRole('button', { name: '다시 보이게 하기' }))
  expect(await screen.findByRole('status')).toHaveTextContent('이미 되살렸거나')
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
})

it('offers a retry when the list cannot load', async () => {
  fetchMock.mockResolvedValueOnce(json({ code: 'COMMUNITY_UNAVAILABLE' }, 500))
  fetchMock.mockResolvedValueOnce(listed([hidden]))
  render(<AdminBoardHiddenPage />)
  expect(await screen.findByRole('alert')).toHaveTextContent('불러오지 못했습니다')
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
  expect(await card()).toBeInTheDocument()
})

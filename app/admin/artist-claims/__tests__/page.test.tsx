import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import AdminArtistClaimsPage from '../page'

const fetchMock = jest.fn()
const originalFetch = global.fetch
const json = (body: unknown, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => body,
})
const base = {
  account_id: 'acc-1',
  claimant_email: 'claimant@example.test',
  claimed_name_hanja: null,
  claimed_art_name: null,
  note: '2019 대상 수상',
  status: 'pending',
  decision_note: null,
  created_at: '2026-10-25T01:00:00Z',
  reviewed_at: null,
}
const listed = {
  ...base,
  id: 'r1',
  claimed_name: '시험작가',
  artist_id: 'artist-1',
  artist: {
    id: 'artist-1',
    name: '시험작가',
    name_zh: '試驗作家',
    visibility: 'public',
    membership_type: '초대작가',
  },
}
const unlisted = { ...base, id: 'r2', claimed_name: '숨은작가', artist_id: null, artist: null }

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

const card = (name: string) => screen.findByRole('article', { name: `${name} 연결 요청` })

it('shows the pending queue with the claimant email and approves a listed request', async () => {
  fetchMock
    .mockResolvedValueOnce(json({ data: [listed] }))
    .mockResolvedValueOnce(json({ data: { id: 'r1', action: 'approve' } }))
    .mockResolvedValueOnce(json({ data: [] }))
  render(<AdminArtistClaimsPage />)
  const item = within(await card('시험작가'))
  expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/artist-claims?status=pending')
  expect(item.getByText('claimant@example.test')).toBeInTheDocument()
  expect(item.getByText('2019 대상 수상')).toBeInTheDocument()

  fireEvent.change(item.getByLabelText('시험작가 검토 메모'), {
    target: { value: '수상 이력 확인' },
  })
  fireEvent.click(item.getByRole('button', { name: '승인' }))

  expect(await screen.findByRole('status')).toHaveTextContent('시험작가: 승인했습니다')
  const [url, init] = fetchMock.mock.calls[1]
  expect(url).toBe('/api/admin/artist-claims/r1')
  expect(init.method).toBe('POST')
  expect(JSON.parse(init.body)).toEqual({ action: 'approve', note: '수상 이력 확인' })
})

it('requires choosing an artist row before approving an unlisted request', async () => {
  fetchMock
    .mockResolvedValueOnce(json({ data: [unlisted] }))
    .mockResolvedValueOnce(
      json({
        artists: [
          {
            id: 'hidden-1',
            name: '숨은작가',
            name_zh: null,
            membership_type: '준회원',
            visibility: 'hidden',
          },
        ],
      })
    )
    .mockResolvedValueOnce(json({ data: { id: 'r2', action: 'approve' } }))
    .mockResolvedValueOnce(json({ data: [] }))
  render(<AdminArtistClaimsPage />)
  const item = within(await card('숨은작가'))
  expect(item.getByRole('button', { name: '승인' })).toBeDisabled()

  fireEvent.change(item.getByLabelText('연결할 작가 검색'), { target: { value: '숨은' } })
  fireEvent.click(item.getByRole('button', { name: '검색' }))
  fireEvent.click(await item.findByRole('button', { name: '지정' }))
  expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/artists?q=%EC%88%A8%EC%9D%80')

  fireEvent.click(item.getByRole('button', { name: '승인' }))
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4))
  expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({
    action: 'approve',
    artistId: 'hidden-1',
  })
})

it('explains a conflict from the server and reloads', async () => {
  fetchMock
    .mockResolvedValueOnce(json({ data: [listed] }))
    .mockResolvedValueOnce(json({ code: 'ARTIST_ALREADY_LINKED' }, 409))
    .mockResolvedValueOnce(json({ data: [listed] }))
  render(<AdminArtistClaimsPage />)
  fireEvent.click(within(await card('시험작가')).getByRole('button', { name: '반려' }))
  expect(await screen.findByRole('status')).toHaveTextContent('이미 다른 계정과 연결')
  expect(fetchMock).toHaveBeenCalledTimes(3)
})

it('switches tabs and offers revoke on approved links', async () => {
  fetchMock
    .mockResolvedValueOnce(json({ data: [] }))
    .mockResolvedValueOnce(json({ data: [{ ...listed, status: 'approved' }] }))
  render(<AdminArtistClaimsPage />)
  expect(await screen.findByText('해당하는 요청이 없습니다.')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: '승인' }))
  const item = within(await card('시험작가'))
  expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/artist-claims?status=approved')
  expect(item.getByRole('button', { name: '연결 해제' })).toBeInTheDocument()
  expect(item.queryByRole('button', { name: '승인' })).not.toBeInTheDocument()
})

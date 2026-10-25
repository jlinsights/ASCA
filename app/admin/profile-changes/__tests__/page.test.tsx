import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import AdminProfileChangesPage from '../page'

const fetchMock = jest.fn()
const originalFetch = global.fetch
const json = (body: unknown, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => body,
})
const artist = { id: 'a1', name: '시험작가', name_zh: '試驗作家', visibility: 'public' }
const edit = {
  id: 'r1',
  artist_id: 'a1',
  account_id: 'acc-1',
  editor_email: 'artist@example.test',
  changes: {
    bio: { before: '처음 소개', after: '새 소개' },
    specialties: { before: ['해서'], after: ['행서', '초서'] },
  },
  revert_of: null,
  reverted_at: null,
  created_at: '2026-10-25T03:00:00Z',
  artist,
}

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

const card = () => screen.findByRole('article', { name: '시험작가 프로필 수정' })

it('shows each changed field before and after, with who edited it', async () => {
  fetchMock.mockResolvedValueOnce(json({ data: [edit] }))
  render(<AdminProfileChangesPage />)
  const item = within(await card())
  expect(item.getByText('artist@example.test', { exact: false })).toBeInTheDocument()
  expect(item.getByText('소개')).toBeInTheDocument()
  expect(item.getByText('처음 소개')).toBeInTheDocument()
  expect(item.getByText('새 소개')).toBeInTheDocument()
  expect(item.getByText('분야')).toBeInTheDocument()
  expect(item.getByText('행서, 초서')).toBeInTheDocument()
})

it('reverts a change and reloads', async () => {
  fetchMock
    .mockResolvedValueOnce(json({ data: [edit] }))
    .mockResolvedValueOnce(json({ data: { id: 'r1' } }))
    .mockResolvedValueOnce(json({ data: [{ ...edit, reverted_at: '2026-10-25T04:00:00Z' }] }))
  render(<AdminProfileChangesPage />)
  fireEvent.click(within(await card()).getByRole('button', { name: '이 수정 되돌리기' }))
  expect(await screen.findByRole('status')).toHaveTextContent('시험작가: 수정을 되돌렸습니다.')
  const [url, init] = fetchMock.mock.calls[1]
  expect(url).toBe('/api/admin/profile-revisions/r1')
  expect(JSON.parse(init.body)).toEqual({ action: 'revert' })
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: '이 수정 되돌리기' })).not.toBeInTheDocument()
  )
})

it('explains when a newer edit blocks the revert', async () => {
  fetchMock
    .mockResolvedValueOnce(json({ data: [edit] }))
    .mockResolvedValueOnce(json({ code: 'CHANGED_SINCE' }, 409))
    .mockResolvedValueOnce(json({ data: [edit] }))
  render(<AdminProfileChangesPage />)
  fireEvent.click(within(await card()).getByRole('button', { name: '이 수정 되돌리기' }))
  expect(await screen.findByRole('status')).toHaveTextContent('최신 수정부터 되돌려 주세요')
})

it('offers no revert for an office revert entry', async () => {
  fetchMock.mockResolvedValueOnce(json({ data: [{ ...edit, id: 'r2', revert_of: 'r1' }] }))
  render(<AdminProfileChangesPage />)
  const item = within(await card())
  expect(item.getByText(/사무국 되돌리기/)).toBeInTheDocument()
  expect(item.queryByRole('button')).not.toBeInTheDocument()
})

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import AdminContestEntriesPage from '../page'

const fetchMock = jest.fn()
const originalFetch = global.fetch
const json = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body })

const artist = {
  id: 'artist-1',
  name: '김정례',
  name_zh: '金貞禮',
  membership_type: '초대작가',
  visibility: 'public',
}
const base = {
  contest_year: 2026,
  contest_name: '대한민국 동양서예대전',
  title: '春風',
  division: '한문',
  script_style: '행서',
  fee_status: 'confirmed',
  result_status: 'pending',
  result_raw: null,
  entrant_name: '김정례',
  entrant_name_hanja: '金貞禮',
  entrant_email: 'entrant@example.test',
  matched_at: null,
  submitted_at: null,
}
const unmatched = {
  ...base,
  id: 'e1',
  artist_id: null,
  artist: null,
  candidates: [{ ...artist, reason: 'both' }],
}
const matched = {
  ...base,
  id: 'e2',
  artist_id: 'artist-1',
  artist,
  candidates: [],
  matched_at: '2026-10-26T01:00:00Z',
}

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

const card = () => screen.findByRole('article', { name: /김정례/ })

describe('관리자 — 출품 작가 연결', () => {
  it('연결 대기 출품에 후보를 보이고, 누르면 그 작가로 잇는다', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: [unmatched], limit: 100 }))
      .mockResolvedValueOnce(json({ data: { id: 'e1', action: 'link' } }))
      .mockResolvedValueOnce(json({ data: [], limit: 100 }))
    render(<AdminContestEntriesPage />)

    const article = await card()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/contest-entries?status=unmatched',
      expect.anything()
    )
    expect(within(article).getByText('이름·한자 일치')).toBeInTheDocument()
    expect(within(article).getByText('출품 이메일: entrant@example.test')).toBeInTheDocument()

    fireEvent.click(within(article).getByRole('button', { name: '이 작가로 연결' }))
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/contest-entries/e1',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'link', artistId: 'artist-1' }),
        })
      )
    )
    expect(await screen.findByRole('status')).toHaveTextContent('김정례: 연결했습니다')
  })

  it('연결됨 출품은 두 번 눌러야 풀린다', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: [], limit: 100 }))
      .mockResolvedValueOnce(json({ data: [matched], limit: 100 }))
      .mockResolvedValueOnce(json({ data: { id: 'e2', action: 'unlink' } }))
      .mockResolvedValueOnce(json({ data: [], limit: 100 }))
    render(<AdminContestEntriesPage />)
    await screen.findByText('해당하는 출품이 없습니다.')

    fireEvent.click(screen.getByRole('tab', { name: '연결됨' }))
    const article = await card()
    fireEvent.click(within(article).getByRole('button', { name: '연결 해제' }))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    fireEvent.click(within(article).getByRole('button', { name: '해제 확인' }))
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/contest-entries/e2',
        expect.objectContaining({ body: JSON.stringify({ action: 'unlink' }) })
      )
    )
  })

  it('다른 관리자가 먼저 이었으면 알리고 목록을 새로 읽는다', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: [unmatched], limit: 100 }))
      .mockResolvedValueOnce(json({ code: 'ENTRY_ALREADY_LINKED' }, 409))
      .mockResolvedValueOnce(json({ data: [], limit: 100 }))
    render(<AdminContestEntriesPage />)
    fireEvent.click(within(await card()).getByRole('button', { name: '이 작가로 연결' }))
    expect(await screen.findByRole('status')).toHaveTextContent('다른 관리자가 먼저 연결했습니다')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
  })

  it('목록을 못 불러오면 다시 시도를 보인다', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 500))
    render(<AdminContestEntriesPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('출품 목록을 불러오지 못했습니다.')
  })
})

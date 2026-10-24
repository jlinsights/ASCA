import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import AdminArtistsPage from '../page'

const fetchMock = jest.fn()
const originalFetch = global.fetch
const json = (body: unknown, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => body,
})
const artist = {
  id: 'a1',
  name: '김작가',
  name_zh: '金作家',
  membership_type: '초대작가',
  title: null,
  dues_status: '정상',
  visibility: 'public',
  updated_at: null,
}

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

describe('작가 회비 관리 화면', () => {
  it('회비 상태를 바꾸면 PATCH 하고, 서버가 돌려준 공개 여부로 표시를 갱신한다', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ artists: [artist], total: 1, page: 1, pageSize: 30 }))
      .mockResolvedValueOnce(
        json({ artist: { ...artist, dues_status: '자격 정지', visibility: 'hidden' } })
      )
    render(<AdminArtistsPage />)
    const select = await screen.findByLabelText('김작가 회비 상태')
    expect(screen.getByText('공개')).toBeInTheDocument()

    fireEvent.change(select, { target: { value: '자격 정지' } })

    await waitFor(() => expect(screen.getByText('비공개')).toBeInTheDocument())
    const [url, init] = fetchMock.mock.calls[1]
    expect(url).toBe('/api/admin/artists/a1')
    expect(init).toMatchObject({
      method: 'PATCH',
      body: JSON.stringify({ dues_status: '자격 정지' }),
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      '김작가: 회비 상태 자격 정지 · 웹사이트 비공개'
    )
  })

  it('관리자가 아니면 서버의 거부 사유를 보여 준다', async () => {
    fetchMock.mockResolvedValue(json({ error: '관리자만 볼 수 있습니다.' }, 403))
    render(<AdminArtistsPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('관리자만 볼 수 있습니다.')
  })

  it('회비 상태로 거르면 첫 페이지부터 다시 조회한다', async () => {
    fetchMock.mockResolvedValue(json({ artists: [artist], total: 1, page: 1, pageSize: 30 }))
    render(<AdminArtistsPage />)
    await screen.findByLabelText('김작가 회비 상태')
    fireEvent.change(screen.getByLabelText('회비 상태 필터'), { target: { value: '권한 제한' } })
    const lastParams = () =>
      new URLSearchParams((fetchMock.mock.calls.at(-1)?.[0] as string).split('?')[1])
    await waitFor(() => expect(lastParams().get('dues')).toBe('권한 제한'))
    expect(lastParams().get('page')).toBe('1')
  })
})

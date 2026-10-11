import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ArtistsPage from '../page'

jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/components/translated-content', () => ({ TranslatedContent: () => <span>작가</span> }))
jest.mock('../_components/artist-card', () => ({
  ArtistCard: ({ artist }: { artist: { name: string } }) => <article>{artist.name}</article>,
}))
jest.mock('@/contexts/language-context', () => ({ useLanguage: () => ({ language: 'ko' }) }))

const fetchMock = jest.fn()
const originalFetch = global.fetch
const response = (artists: { id: string; name: string }[], total = artists.length) => ({
  ok: true,
  json: async () => ({ artists, total }),
})

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

describe('Artists discovery states', () => {
  it('첫 로딩 중 검색창을 유지하고 통신 오류를 빈 목록과 구분해 재시도한다', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(response([{ id: '1', name: '김작가' }]))
    const user = userEvent.setup()
    render(<ArtistsPage />)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('목록을 불러오지 못했습니다')
    expect(screen.queryByText('등록된 작가가 없습니다')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findAllByText('김작가')).toHaveLength(2)
    expect(screen.getByRole('status')).toHaveTextContent('작가 1명')
  })

  it('빈 검색 결과에 초기화 동작을 제공하며 기존 검색 요청을 취소한다', async () => {
    fetchMock.mockResolvedValue(response([]))
    render(<ArtistsPage />)
    await screen.findByText('등록된 작가가 없습니다')
    const firstSignal = fetchMock.mock.calls[0][1].signal as AbortSignal
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '없는작가' } })
    expect(await screen.findByText('조건에 맞는 결과가 없습니다')).toBeInTheDocument()
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('q=%EC%97%86%EB%8A%94%EC%9E%91%EA%B0%80'),
        expect.anything()
      )
    )
    expect(firstSignal.aborted).toBe(true)
    fireEvent.click(screen.getAllByRole('button', { name: '전체 초기화' }).at(-1)!)
    expect(screen.getByRole('searchbox')).toHaveValue('')
    await waitFor(() => expect(fetchMock.mock.calls.at(-1)![0]).not.toContain('q='))
  })

  it('더 보기 실패 후 재시도는 같은 페이지를 받아 기존 결과에 이어 붙인다', async () => {
    fetchMock
      .mockResolvedValueOnce(response([{ id: '1', name: '김작가' }], 2))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(response([{ id: '2', name: '박작가' }], 2))
    const user = userEvent.setup()
    render(<ArtistsPage />)
    await user.click(await screen.findByRole('button', { name: '작가 더 보기' }))
    await user.click(await screen.findByRole('button', { name: '다시 시도' }))
    expect(await screen.findAllByText('박작가')).toHaveLength(2)
    expect(screen.getAllByText('김작가')).toHaveLength(2)
    expect(fetchMock.mock.calls[1][0]).toContain('page=2')
    expect(fetchMock.mock.calls[2][0]).toContain('page=2')
    expect(screen.queryByRole('button', { name: '작가 더 보기' })).not.toBeInTheDocument()
  })

  it('더 보기를 사용한 조건으로 돌아와도 첫 페이지부터 다시 조회한다', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      const params = new URL(url, 'http://localhost').searchParams
      if (params.get('q')) return response([{ id: 'b', name: '다른작가' }], 1)
      return response([{ id: params.get('page')!, name: `작가${params.get('page')}` }], 2)
    })
    const user = userEvent.setup()
    render(<ArtistsPage />)
    await user.click(await screen.findByRole('button', { name: '작가 더 보기' }))
    await screen.findAllByText('작가2')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '다른' } })
    await screen.findAllByText('다른작가')
    await user.click(screen.getByRole('button', { name: '검색어 지우기' }))
    await screen.findAllByText('작가1')
    expect(fetchMock.mock.calls.at(-1)![0]).toContain('page=1')
    expect(screen.queryByText('다른작가')).not.toBeInTheDocument()
    expect(screen.queryByText('작가2')).not.toBeInTheDocument()
  })
})

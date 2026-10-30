import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import AdminArtistApplicationsPage from '../page'

const fetchMock = jest.fn()
const originalFetch = global.fetch
const json = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body })

const application = (over: Record<string, unknown> = {}) => ({
  id: 'app-1',
  submitted_at: '2026-10-30T09:00:00Z',
  applicant_name: '홍길동',
  applicant_name_hanja: '洪吉童',
  applicant_name_en: 'Hong Gildong',
  pen_name: null,
  applicant_email: 'applicant@example.test',
  requested_grade: 'invited',
  requested_grade_raw: '초대작가',
  track: 'traditional',
  track_raw: '전통부문',
  genres: ['한글서예'],
  route: 'special',
  route_raw: '특별선임 (선임 규정 제11조)',
  membership_raw: '정회원 아님',
  special_basis_raw: '국내외 서예교육 25년',
  awards_text: null,
  status: 'received',
  review_note: null,
  reviewed_at: null,
  ...over,
})

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

const card = () => screen.findByRole('article', { name: /홍길동/ })
const posted = () => JSON.parse(fetchMock.mock.calls[1][1].body as string)
/** 목록 응답 — 기본 한 쪽 */
const page = (data: unknown[], over: Record<string, unknown> = {}) =>
  json({ data, page: 1, limit: 50, total: data.length, ...over })
const reviewedAt = '2026-10-30T03:00:00.123+00:00'

describe('관리자 — 작가 신청 심사', () => {
  it('처리할 신청을 보이고, 심사 시작은 본 상태·처리 시각과 함께 바로 보낸다', async () => {
    fetchMock
      .mockResolvedValueOnce(page([application()]))
      .mockResolvedValueOnce(json({ data: { id: 'app-1', status: 'reviewing' } }))
      .mockResolvedValueOnce(page([]))
    render(<AdminArtistApplicationsPage />)

    const article = await card()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/artist-applications?view=open&page=1',
      expect.anything()
    )
    expect(within(article).getByText('초대작가 · 전통부문 · 특별선임')).toBeInTheDocument()
    expect(within(article).getByText('국내외 서예교육 25년')).toBeInTheDocument()

    fireEvent.click(within(article).getByRole('button', { name: '심사 시작' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/artist-applications/app-1')
    expect(posted()).toEqual({ from: 'received', seen: null, to: 'reviewing' })
    expect(await screen.findByRole('status')).toHaveTextContent('홍길동: 심사 중(으)로 바꿨습니다')
  })

  it('승인은 한 번 더 확인하고, 고친 메모를 함께 보낸다', async () => {
    fetchMock
      .mockResolvedValueOnce(page([application({ status: 'reviewing', reviewed_at: reviewedAt })]))
      .mockResolvedValueOnce(json({ data: { id: 'app-1', status: 'approved' } }))
      .mockResolvedValueOnce(page([]))
    render(<AdminArtistApplicationsPage />)

    const article = await card()
    fireEvent.change(within(article).getByLabelText('심사 메모'), {
      target: { value: '이사회 의결 완료' },
    })
    fireEvent.click(within(article).getByRole('button', { name: '승인' }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    fireEvent.click(within(article).getByRole('button', { name: '승인 확인' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    expect(posted()).toEqual({
      from: 'reviewing',
      seen: reviewedAt,
      to: 'approved',
      note: '이사회 의결 완료',
    })
  })

  it('메모만 저장할 수 있다', async () => {
    fetchMock
      .mockResolvedValueOnce(page([application({ status: 'reviewing', reviewed_at: reviewedAt })]))
      .mockResolvedValueOnce(json({ data: { id: 'app-1', status: 'reviewing' } }))
      .mockResolvedValueOnce(page([]))
    render(<AdminArtistApplicationsPage />)

    const article = await card()
    expect(within(article).queryByRole('button', { name: '메모만 저장' })).toBeNull()
    fireEvent.change(within(article).getByLabelText('심사 메모'), {
      target: { value: '서류 보완 요청' },
    })
    fireEvent.click(within(article).getByRole('button', { name: '메모만 저장' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    expect(posted()).toEqual({
      from: 'reviewing',
      seen: reviewedAt,
      to: 'reviewing',
      note: '서류 보완 요청',
    })
    expect(await screen.findByRole('status')).toHaveTextContent('홍길동: 메모를 저장했습니다')
  })

  it('저장 뒤 다시 읽기가 끝날 때까지 메모 입력을 잠근다', async () => {
    let resolveReload: (value: unknown) => void = () => {}
    const saved = application({ status: 'reviewing', reviewed_at: reviewedAt })
    fetchMock
      .mockResolvedValueOnce(page([saved]))
      .mockResolvedValueOnce(json({ data: { id: 'app-1', status: 'reviewing' } }))
      .mockReturnValueOnce(new Promise(resolve => (resolveReload = resolve)))
    render(<AdminArtistApplicationsPage />)

    const memo = within(await card()).getByLabelText('심사 메모')
    fireEvent.change(memo, { target: { value: '서류 보완 요청' } })
    fireEvent.click(screen.getByRole('button', { name: '메모만 저장' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    expect(screen.getByLabelText('심사 메모')).toHaveAttribute('readonly')

    resolveReload(
      page([{ ...saved, review_note: '서류 보완 요청', reviewed_at: '2026-10-30T04:00:00Z' }])
    )
    await waitFor(() => expect(screen.getByLabelText('심사 메모')).not.toHaveAttribute('readonly'))
    expect(screen.getByLabelText('심사 메모')).toHaveValue('서류 보완 요청')
  })

  it('다른 관리자가 먼저 바꿨으면 알리고 목록을 새로 읽는다', async () => {
    fetchMock
      .mockResolvedValueOnce(page([application()]))
      .mockResolvedValueOnce(json({ code: 'APPLICATION_CHANGED' }, 409))
      .mockResolvedValueOnce(page([]))
    render(<AdminArtistApplicationsPage />)
    fireEvent.click(within(await card()).getByRole('button', { name: '심사 시작' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      '다른 관리자가 먼저 이 신청을 바꿨습니다'
    )
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
  })

  it('저장 요청이 끊기면 알리고 목록을 새로 읽는다', async () => {
    fetchMock
      .mockResolvedValueOnce(page([application()]))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(page([]))
    render(<AdminArtistApplicationsPage />)
    fireEvent.click(within(await card()).getByRole('button', { name: '심사 시작' }))
    expect(await screen.findByRole('status')).toHaveTextContent('저장됐는지 확인하지 못했습니다')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    expect(await screen.findByText('해당하는 신청이 없습니다.')).toBeInTheDocument()
  })

  it('끝난 탭으로 옮기면 그 탭을 읽고, 끝난 신청은 다시 심사로 되돌릴 수 있다', async () => {
    fetchMock
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([application({ status: 'rejected' })]))
    render(<AdminArtistApplicationsPage />)
    await screen.findByText('해당하는 신청이 없습니다.')
    fireEvent.click(screen.getByRole('tab', { name: '반려' }))
    const article = await card()
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/admin/artist-applications?view=rejected&page=1',
      expect.anything()
    )
    expect(within(article).getByRole('button', { name: '다시 심사' })).toBeInTheDocument()
  })

  it('탭을 옮긴 뒤 늦게 온 옛 탭 응답은 화면을 덮지 않는다', async () => {
    let resolveOld: (value: unknown) => void = () => {}
    fetchMock
      .mockReturnValueOnce(new Promise(resolve => (resolveOld = resolve)))
      .mockResolvedValueOnce(page([application({ status: 'rejected' })]))
    render(<AdminArtistApplicationsPage />)
    fireEvent.click(screen.getByRole('tab', { name: '반려' }))
    expect(within(await card()).getByRole('button', { name: '다시 심사' })).toBeInTheDocument()

    resolveOld(page([application({ applicant_name: '옛 탭 신청' })]))
    await waitFor(() => expect(screen.queryByText('옛 탭 신청')).toBeNull())
    expect(screen.getByRole('button', { name: '다시 심사' })).toBeInTheDocument()
  })

  it('한 쪽이 넘치면 다음 쪽을 읽는다', async () => {
    fetchMock
      .mockResolvedValueOnce(page([application()], { total: 120 }))
      .mockResolvedValueOnce(page([], { page: 2, total: 120 }))
    render(<AdminArtistApplicationsPage />)
    await card()
    expect(screen.getByText('1 / 3쪽 · 모두 120건')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '이전' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/admin/artist-applications?view=open&page=2',
        expect.anything()
      )
    )
  })

  it('목록을 못 불러오면 다시 시도를 보인다', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 500))
    render(<AdminArtistApplicationsPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('신청 목록을 불러오지 못했습니다.')
  })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ArtistClaimSection } from '../artist-claim-section'

jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}))

const fetchMock = jest.fn()
const originalFetch = global.fetch
const json = (body: unknown, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => body,
})
const candidate = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  name: '시험작가',
  nameZh: '試驗作家',
  artNameKo: null,
  artNameHanja: '素石',
  membershipType: '초대작가',
}

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

const bodyOf = (call: number) => JSON.parse(fetchMock.mock.calls[call][1].body)

it('searches public artists, pre-fills the form from the pick, and requests a link', async () => {
  const onChanged = jest.fn()
  fetchMock
    .mockResolvedValueOnce(json({ data: [] }))
    .mockResolvedValueOnce(json({ artists: [candidate], total: 1 }))
    .mockResolvedValueOnce(json({ data: { id: 'c1' } }, 201))
    .mockResolvedValueOnce(
      json({ data: [{ id: 'c1', claimed_name: '시험작가', status: 'pending' }] })
    )
  render(<ArtistClaimSection defaultName='계정 이름' onChanged={onChanged} />)

  fireEvent.change(await screen.findByLabelText('claimSearchLabel'), {
    target: { value: '시험' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'claimSearch' }))
  expect(fetchMock.mock.calls[1][0]).toBe('/api/artists?q=%EC%8B%9C%ED%97%98&limit=8')

  fireEvent.click(await screen.findByRole('button', { name: 'claimPick' }))
  expect(screen.getByLabelText('claimName')).toHaveValue('시험작가')
  expect(screen.getByLabelText('claimNameHanja')).toHaveValue('試驗作家')
  expect(screen.getByLabelText('claimArtName')).toHaveValue('素石')
  fireEvent.change(screen.getByLabelText('claimNote'), { target: { value: '2019 대상' } })
  fireEvent.click(screen.getByRole('button', { name: 'claimSubmit' }))

  expect(await screen.findByText('claimPending')).toBeInTheDocument()
  expect(fetchMock.mock.calls[2][0]).toBe('/api/profile/artist-claims')
  expect(fetchMock.mock.calls[2][1].method).toBe('POST')
  expect(bodyOf(2)).toEqual({
    artistId: candidate.id,
    claimedName: '시험작가',
    claimedNameHanja: '試驗作家',
    claimedArtName: '素石',
    note: '2019 대상',
  })
  expect(onChanged).toHaveBeenCalled()
})

it('sends an unlisted request with no artist id, using the account name', async () => {
  fetchMock
    .mockResolvedValueOnce(json({ data: [] }))
    .mockResolvedValueOnce(json({ data: { id: 'c2' } }, 201))
    .mockResolvedValueOnce(json({ data: [] }))
  render(<ArtistClaimSection defaultName='계정 이름' />)
  fireEvent.click(await screen.findByRole('button', { name: 'claimUnlisted' }))
  expect(screen.getByLabelText('claimName')).toHaveValue('계정 이름')
  fireEvent.click(screen.getByRole('button', { name: 'claimSubmit' }))
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
  expect(bodyOf(1)).toMatchObject({ artistId: null, claimedName: '계정 이름' })
})

it('explains an already-linked page and keeps the form open', async () => {
  fetchMock
    .mockResolvedValueOnce(json({ data: [] }))
    .mockResolvedValueOnce(json({ code: 'ARTIST_ALREADY_LINKED' }, 409))
  render(<ArtistClaimSection defaultName='이름' />)
  fireEvent.click(await screen.findByRole('button', { name: 'claimUnlisted' }))
  fireEvent.click(screen.getByRole('button', { name: 'claimSubmit' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('claimErrorLinked')
  expect(screen.getByRole('button', { name: 'claimSubmit' })).toBeInTheDocument()
})

it('shows a pending request and withdraws it', async () => {
  fetchMock
    .mockResolvedValueOnce(
      json({ data: [{ id: 'c3', claimed_name: '대기 작가', status: 'pending' }] })
    )
    .mockResolvedValueOnce(json({ data: { id: 'c3' } }))
    .mockResolvedValueOnce(json({ data: [] }))
  render(<ArtistClaimSection defaultName='이름' />)
  expect(await screen.findByText(/대기 작가/)).toBeInTheDocument()
  expect(screen.queryByLabelText('claimSearchLabel')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'claimWithdraw' }))
  await waitFor(() => expect(screen.getByLabelText('claimSearchLabel')).toBeInTheDocument())
  expect(fetchMock.mock.calls[1]).toEqual([
    '/api/profile/artist-claims/c3',
    { method: 'DELETE', credentials: 'include' },
  ])
})

it('shows the office note on the latest rejected request', async () => {
  fetchMock.mockResolvedValueOnce(
    json({
      data: [{ id: 'c4', claimed_name: '작가', status: 'rejected', decision_note: '자료 부족' }],
    })
  )
  render(<ArtistClaimSection defaultName='이름' />)
  expect(await screen.findByText('claimRejected')).toBeInTheDocument()
  expect(screen.getByText(/자료 부족/)).toBeInTheDocument()
})

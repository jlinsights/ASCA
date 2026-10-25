import { render, screen, within } from '@testing-library/react'
import { MyContestEntries } from '../my-contest-entries'

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
const entry = (overrides: Record<string, unknown>) => ({
  id: 'e1',
  contest_year: 2025,
  contest_name: '시험 공모전',
  title: '시험 작품',
  division: '한문',
  script_style: '행서',
  fee_status: 'confirmed',
  result_status: 'pending',
  result_raw: null,
  submitted_at: null,
  synced_at: '2026-10-25T00:00:00.000Z',
  ...overrides,
})

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

it('lists my entries with year, contest, title, division and statuses', async () => {
  fetchMock.mockResolvedValueOnce(
    json({
      data: [
        entry({ id: 'e1', result_status: 'awarded', result_raw: '특선' }),
        entry({
          id: 'e2',
          contest_year: 2024,
          title: null,
          fee_status: 'pending',
          result_status: 'not_selected',
        }),
      ],
    })
  )
  render(<MyContestEntries />)

  const items = await screen.findAllByRole('listitem')
  expect(items).toHaveLength(2)
  const first = within(items[0])
  expect(first.getByText('2025')).toBeInTheDocument()
  expect(first.getByText('시험 공모전')).toBeInTheDocument()
  expect(first.getByText('시험 작품')).toBeInTheDocument()
  expect(first.getByText('한문 · 행서')).toBeInTheDocument()
  expect(first.getByText('entriesFeeConfirmed')).toBeInTheDocument()
  expect(first.getByText('특선')).toBeInTheDocument()

  const second = within(items[1])
  expect(second.getByText('entriesUntitled')).toBeInTheDocument()
  expect(second.getByText('entriesFeePending')).toBeInTheDocument()
  expect(second.getByText('entriesResultNotSelected')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledWith('/api/profile/contest-entries', {
    credentials: 'include',
  })
})

it('hides unknown statuses and shows a withdrawn entry once', async () => {
  fetchMock.mockResolvedValueOnce(
    json({
      data: [
        entry({ id: 'u', fee_status: 'unknown', result_status: 'unknown' }),
        entry({ id: 'w', fee_status: 'withdrawn', result_status: 'withdrawn' }),
      ],
    })
  )
  render(<MyContestEntries />)
  const [unknown, withdrawn] = await screen.findAllByRole('listitem')
  expect(within(unknown).queryByText(/^entriesFee|^entriesResult/)).toBeNull()
  expect(within(withdrawn).getAllByText(/Withdrawn$/)).toHaveLength(1)
})

it('explains how entries under another email get linked when there are none', async () => {
  fetchMock.mockResolvedValueOnce(json({ data: [] }))
  render(<MyContestEntries />)
  expect(await screen.findByText('entriesEmpty')).toBeInTheDocument()
  expect(screen.getByText('entriesEmptyHint')).toBeInTheDocument()
  expect(screen.queryByRole('list')).toBeNull()
})

it('reports a failed load', async () => {
  fetchMock.mockResolvedValueOnce(json({ code: 'ENTRIES_UNAVAILABLE' }, 500))
  render(<MyContestEntries />)
  expect(await screen.findByRole('alert')).toHaveTextContent('entriesError')
})

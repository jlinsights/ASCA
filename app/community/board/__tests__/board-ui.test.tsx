import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { BoardView, COMPOSE_PATH, SIGN_IN_TO_COMPOSE } from '../_components/board-view'
import { ComposeForm } from '../new/compose-form'
import { ThreadDetail } from '../[id]/thread-detail'
import type { ThreadView } from '@/lib/community/threads'

jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'ko' }),
}))

const push = jest.fn()
const refresh = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))

const fetchMock = jest.fn()
const originalFetch = global.fetch
beforeEach(() => {
  fetchMock.mockReset()
  push.mockReset()
  refresh.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

const thread = (overrides: Partial<ThreadView> = {}): ThreadView => ({
  id: 't1',
  author_id: 'a1',
  title: '전시 소식',
  body: '첫 줄\n자세한 안내 https://example.test/show',
  created_at: '2026-10-25T03:00:00.000Z',
  updated_at: '2026-10-25T03:00:00.000Z',
  edited: false,
  author: {
    kind: 'artist',
    name: '시험작가',
    role: '초대작가',
    image: null,
    href: '/artists/test',
  },
  ...overrides,
})
const json = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body })

describe('BoardView', () => {
  it('lists threads with author, title link and count', () => {
    render(
      <BoardView
        threads={[
          thread(),
          thread({
            id: 't2',
            title: '두 번째',
            author: { kind: 'deleted', name: null, role: null, image: null, href: null },
          }),
        ]}
        total={2}
        signedIn
      />
    )
    expect(screen.getByRole('heading', { level: 1, name: 'boardTitle' })).toBeInTheDocument()
    expect(screen.getByText('boardCount')).toBeInTheDocument()
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(2)
    const first = within(cards[0])
    expect(first.getByRole('link', { name: '전시 소식' })).toHaveAttribute(
      'href',
      '/community/board/t1'
    )
    expect(first.getByRole('link', { name: '시험작가' })).toHaveAttribute('href', '/artists/test')
    expect(first.getByText('초대작가')).toBeInTheDocument()
    expect(within(cards[1]).getByText('boardDeletedMember')).toBeInTheDocument()
    for (const link of screen.getAllByRole('link', { name: /boardWrite/ }))
      expect(link).toHaveAttribute('href', COMPOSE_PATH)
  })

  it('sends visitors to sign in before writing and shows the empty state', () => {
    render(<BoardView threads={[]} total={0} signedIn={false} />)
    const links = screen.getAllByRole('link', { name: /boardSignInToWrite/ })
    expect(links.length).toBe(2)
    for (const link of links) expect(link).toHaveAttribute('href', SIGN_IN_TO_COMPOSE)
    expect(screen.getByText('boardEmpty')).toBeInTheDocument()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })
})

describe('ThreadDetail', () => {
  it('renders the body as text with safe outbound links', () => {
    render(
      <ThreadDetail
        thread={thread({ body: '<b>굵게</b> https://example.test/x' })}
        moderation={null}
      />
    )
    expect(screen.getByText('<b>굵게</b>', { exact: false })).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'https://example.test/x' })
    expect(link).toHaveAttribute('rel', 'nofollow ugc noopener noreferrer')
    expect(link).toHaveAttribute('target', '_blank')
    expect(screen.queryByText('boardModeration')).toBeNull()
  })

  it('lets an admin hide a thread with a reason', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { id: 't1', action: 'hide' } }))
    render(<ThreadDetail thread={thread()} moderation={{ hiddenAt: null, hiddenReason: null }} />)
    fireEvent.change(screen.getByLabelText('boardHideReasonLabel'), { target: { value: '광고' } })
    fireEvent.click(screen.getByRole('button', { name: 'boardHide' }))
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/community/threads/t1',
      expect.objectContaining({ body: JSON.stringify({ action: 'hide', reason: '광고' }) })
    )
  })

  it('shows hidden state and restores', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 409))
    render(
      <ThreadDetail
        thread={thread()}
        moderation={{ hiddenAt: '2026-10-25T04:00:00.000Z', hiddenReason: '시험' }}
      />
    )
    expect(screen.getByText('boardHiddenNotice')).toBeInTheDocument()
    expect(screen.getByText('boardHiddenReason: 시험')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'boardRestore' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('boardModerationFailed')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ action: 'restore' })
  })
})

describe('ComposeForm', () => {
  const fill = () => {
    fireEvent.change(screen.getByLabelText(/boardFieldTitle/), { target: { value: '제목' } })
    fireEvent.change(screen.getByLabelText(/boardFieldBody/), { target: { value: '본문' } })
  }

  it('posts and opens the new thread', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { id: 'new1' } }, 201))
    render(<ComposeForm hasDisplayName />)
    expect(screen.getByRole('button', { name: 'boardSubmit' })).toBeDisabled()
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'boardSubmit' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/community/board/new1'))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ title: '제목', body: '본문' })
  })

  it('explains rate limits and other failures', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 429))
    render(<ComposeForm hasDisplayName />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'boardSubmit' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('boardErrorRate')
    expect(push).not.toHaveBeenCalled()
  })

  it('asks for a display name first', () => {
    render(<ComposeForm hasDisplayName={false} />)
    expect(screen.getByText('boardNeedName')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'boardGoProfile' })).toHaveAttribute('href', '/profile')
    expect(screen.queryByRole('textbox')).toBeNull()
  })
})

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { BoardView, COMPOSE_PATH, MINE_PATH, SIGN_IN_TO_COMPOSE } from '../_components/board-view'
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
  mine: false,
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
    expect(screen.queryByRole('navigation', { name: 'boardTabsLabel' })).toBeNull()
  })

  it('offers all / mine tabs to members and marks the current one', () => {
    render(<BoardView threads={[]} total={0} signedIn />)
    const tabs = within(screen.getByRole('navigation', { name: 'boardTabsLabel' }))
    expect(tabs.getByRole('link', { name: 'boardTabAll' })).toHaveAttribute('aria-current', 'page')
    const mine = tabs.getByRole('link', { name: 'boardTabMine' })
    expect(mine).toHaveAttribute('href', MINE_PATH)
    expect(mine).not.toHaveAttribute('aria-current')
  })

  it('shows my threads with my count, empty state and hidden ones unlinked', () => {
    const { rerender } = render(<BoardView threads={[]} total={0} signedIn view='mine' />)
    expect(screen.getByText('boardMyEmpty')).toBeInTheDocument()
    expect(screen.getByText('boardMyCount')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'boardTabMine' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    rerender(
      <BoardView
        threads={[
          { ...thread({ mine: true }), hidden: false },
          { ...thread({ id: 't2', title: '숨겨진 글', mine: true }), hidden: true },
        ]}
        total={2}
        signedIn
        view='mine'
      />
    )
    const [shown, hidden] = screen.getAllByRole('article')
    expect(within(shown!).getByRole('link', { name: '전시 소식' })).toHaveAttribute(
      'href',
      '/community/board/t1'
    )
    expect(within(hidden!).getByText('boardMyHidden')).toBeInTheDocument()
    expect(within(hidden!).getByRole('heading', { name: '숨겨진 글' })).toBeInTheDocument()
    expect(within(hidden!).queryByRole('link', { name: '숨겨진 글' })).toBeNull()
  })
})

const responses = {
  comments: [],
  reactions: { count: 0, liked: false },
  viewer: { signedIn: false, hasDisplayName: false },
}

describe('ThreadDetail', () => {
  it('renders the body as text with safe outbound links', () => {
    render(
      <ThreadDetail
        {...responses}
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
    render(
      <ThreadDetail
        {...responses}
        thread={thread()}
        moderation={{ hiddenAt: null, hiddenReason: null }}
      />
    )
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
        {...responses}
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

describe('ThreadDetail — my own thread', () => {
  it('hides edit and delete on other people’s threads', () => {
    render(<ThreadDetail {...responses} thread={thread()} moderation={null} />)
    expect(screen.queryByRole('link', { name: 'boardEdit' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'boardDelete' })).toBeNull()
  })

  it('links to the edit page and deletes after confirming', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { id: 't1' } }))
    render(<ThreadDetail {...responses} thread={thread({ mine: true })} moderation={null} />)
    expect(screen.getByRole('link', { name: 'boardEdit' })).toHaveAttribute(
      'href',
      '/community/board/t1/edit'
    )
    fireEvent.click(screen.getByRole('button', { name: 'boardDelete' }))
    fireEvent.click(screen.getByRole('button', { name: 'boardDeleteYes' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/community/board'))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/community/threads/t1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('keeps the thread and explains a failed delete', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 500))
    render(<ThreadDetail {...responses} thread={thread({ mine: true })} moderation={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'boardDelete' }))
    fireEvent.click(screen.getByRole('button', { name: 'boardDeleteYes' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('boardDeleteFailed')
    expect(push).not.toHaveBeenCalled()
  })

  it('offers no owner actions on my thread once the office has hidden it', () => {
    render(
      <ThreadDetail
        {...responses}
        thread={thread({ mine: true })}
        moderation={{ hiddenAt: '2026-10-25T04:00:00.000Z', hiddenReason: null }}
      />
    )
    expect(screen.queryByRole('link', { name: 'boardEdit' })).toBeNull()
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

  it('edits my thread in place and returns to it', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { id: 't1' } }))
    render(<ComposeForm hasDisplayName editing={{ id: 't1', title: '옛 제목', body: '옛 본문' }} />)
    expect(screen.getByText('boardEditTitle')).toBeInTheDocument()
    expect(screen.getByLabelText(/boardFieldTitle/)).toHaveValue('옛 제목')
    expect(screen.getByRole('link', { name: 'boardCancel' })).toHaveAttribute(
      'href',
      '/community/board/t1'
    )
    fireEvent.change(screen.getByLabelText(/boardFieldTitle/), { target: { value: '새 제목' } })
    fireEvent.click(screen.getByRole('button', { name: 'boardSave' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/community/board/t1'))
    expect(refresh).toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/community/threads/t1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ title: '새 제목', body: '옛 본문' }),
      })
    )
  })

  it('explains when my thread can no longer be edited', async () => {
    fetchMock.mockResolvedValueOnce(json({ code: 'THREAD_NOT_FOUND' }, 404))
    render(<ComposeForm hasDisplayName editing={{ id: 't1', title: '제목', body: '본문' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'boardSave' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('boardEditGone')
  })

  it('asks for a display name first', () => {
    render(<ComposeForm hasDisplayName={false} />)
    expect(screen.getByText('boardNeedName')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'boardGoProfile' })).toHaveAttribute('href', '/profile')
    expect(screen.queryByRole('textbox')).toBeNull()
  })
})

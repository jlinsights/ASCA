import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { BoardView, COMPOSE_PATH, MINE_PATH, SIGN_IN_TO_COMPOSE } from '../_components/board-view'
import { ComposeForm } from '../new/compose-form'
import { ThreadDetail } from '../[id]/thread-detail'
import type { ThreadView } from '@/lib/community/threads'
import { PhotoUploadError, shrinkPhoto, uploadPhoto } from '@/lib/community/photo-upload'

jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'ko' }),
}))

jest.mock('@/lib/community/photo-upload', () => ({
  ...jest.requireActual('@/lib/community/photo-upload'),
  shrinkPhoto: jest.fn(),
  uploadPhoto: jest.fn(),
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

  it('searches with a plain GET form that keeps the current tab', () => {
    const { rerender } = render(<BoardView threads={[]} total={0} signedIn={false} />)
    const form = screen.getByRole('search')
    expect(form).toHaveAttribute('action', '/community/board')
    expect(form).toHaveAttribute('method', 'get')
    expect(within(form).getByLabelText('boardSearchLabel')).toHaveAttribute('name', 'q')
    expect(form.querySelector('input[name="view"]')).toBeNull()
    rerender(<BoardView threads={[]} total={0} signedIn view='mine' />)
    expect(screen.getByRole('search').querySelector('input[name="view"]')).toHaveValue('mine')
  })

  it('shows the result line, a clear link and a search-specific empty state', () => {
    render(<BoardView threads={[]} total={0} signedIn view='mine' search='가을' />)
    expect(screen.getByLabelText('boardSearchLabel')).toHaveValue('가을')
    expect(screen.getByRole('status')).toHaveTextContent('boardSearchResults')
    expect(screen.getByRole('link', { name: 'boardSearchClear' })).toHaveAttribute(
      'href',
      MINE_PATH
    )
    expect(screen.getByText('boardSearchEmpty')).toBeInTheDocument()
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

  it('shows no pager when everything fits on the first page', () => {
    render(<BoardView threads={[thread()]} total={1} signedIn={false} />)
    expect(screen.queryByRole('navigation', { name: 'boardPagerLabel' })).toBeNull()
  })

  it('links to older threads and back to the newest', () => {
    render(
      <BoardView
        threads={[thread()]}
        total={130}
        signedIn={false}
        olderHref='/community/board?before=b2'
        newestHref='/community/board'
      />
    )
    const pager = screen.getByRole('navigation', { name: 'boardPagerLabel' })
    expect(within(pager).getByRole('link', { name: /boardPageOlder/ })).toHaveAttribute(
      'href',
      '/community/board?before=b2'
    )
    expect(within(pager).getByRole('link', { name: /boardPageOlder/ })).toHaveAttribute(
      'rel',
      'next'
    )
    expect(within(pager).getByRole('link', { name: /boardPageNewest/ })).toHaveAttribute(
      'href',
      '/community/board'
    )
    // 쪽을 넘겨도 "글 n편"은 전체 수
    expect(screen.getByText('boardCount')).toBeInTheDocument()
  })

  it('says there is nothing older when a later page comes back empty', () => {
    render(<BoardView threads={[]} total={3} signedIn={false} newestHref='/community/board' />)
    expect(screen.getByText('boardPageEnd')).toBeInTheDocument()
    expect(screen.queryByText('boardEmpty')).toBeNull()
  })
})

const responses = {
  comments: [],
  reactions: { count: 0, liked: false },
  viewer: { signedIn: false, hasDisplayName: false },
}

describe('ThreadDetail', () => {
  it('shows photos at their stored size through the checked image route', () => {
    render(
      <ThreadDetail
        {...responses}
        thread={thread({
          images: [
            { id: 'i1', width: 1600, height: 1200 },
            { id: 'i2', width: 900, height: 1200 },
          ],
        })}
        moderation={null}
      />
    )
    const gallery = screen.getByRole('list', { name: 'boardPhotos' })
    const images = within(gallery).getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', '/api/community/images/i1')
    expect(images[0]).toHaveAttribute('width', '1600')
    expect(images[0]).toHaveAttribute('height', '1200')
    expect(images[0]).toHaveAttribute('alt', '전시 소식 — boardPhotoN')
    expect(images[1]).toHaveAttribute('loading', 'lazy')
  })

  it('draws no gallery for a thread without photos', () => {
    render(<ThreadDetail {...responses} thread={thread()} moderation={null} />)
    expect(screen.queryByRole('list', { name: 'boardPhotos' })).toBeNull()
  })

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
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      title: '제목',
      body: '본문',
      imageIds: [],
    })
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

describe('ComposeForm — photos', () => {
  const shrink = jest.mocked(shrinkPhoto)
  const upload = jest.mocked(uploadPhoto)
  let counter = 0

  beforeEach(() => {
    counter = 0
    shrink.mockReset().mockImplementation(async file => file)
    upload.mockReset().mockImplementation(async () => {
      counter += 1
      return { id: `img${counter}`, width: 800, height: 600 }
    })
    URL.createObjectURL = jest.fn(() => `blob:preview-${Math.random()}`)
    URL.revokeObjectURL = jest.fn()
  })

  const fill = () => {
    fireEvent.change(screen.getByLabelText(/boardFieldTitle/), { target: { value: '제목' } })
    fireEvent.change(screen.getByLabelText(/boardFieldBody/), { target: { value: '본문' } })
  }
  const photo = (name: string) => new File(['x'], name, { type: 'image/jpeg' })
  const choose = (...files: File[]) =>
    fireEvent.change(screen.getByLabelText('boardPhotoAdd'), { target: { files } })

  it('uploads chosen photos in order and posts their IDs with the thread', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { id: 'new1' } }, 201))
    render(<ComposeForm hasDisplayName />)
    fill()
    choose(photo('a.jpg'), photo('b.jpg'))
    await waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(2))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'boardSubmit' })).not.toBeDisabled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'boardSubmit' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/community/board/new1'))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).imageIds).toEqual(['img1', 'img2'])
  })

  it('keeps the post button off while a photo is still uploading', async () => {
    let finish: (value: { id: string; width: number; height: number }) => void = () => {}
    upload.mockImplementationOnce(() => new Promise(resolve => (finish = resolve)))
    render(<ComposeForm hasDisplayName />)
    fill()
    choose(photo('a.jpg'))
    expect(await screen.findByText('boardPhotoUploading')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'boardSubmit' })).toBeDisabled()
    finish({ id: 'img9', width: 1, height: 1 })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'boardSubmit' })).not.toBeDisabled()
    )
  })

  it('takes four photos at most and says so', async () => {
    render(<ComposeForm hasDisplayName />)
    choose(photo('1'), photo('2'), photo('3'), photo('4'), photo('5'))
    expect(await screen.findByRole('alert')).toHaveTextContent('boardPhotoErrorLimit')
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(4))
    await waitFor(() => expect(screen.queryByLabelText('boardPhotoAdd')).toBeNull())
  })

  it('drops a photo that fails and explains why', async () => {
    shrink.mockRejectedValueOnce(new PhotoUploadError('unreadable'))
    render(<ComposeForm hasDisplayName />)
    choose(photo('heic.heic'))
    expect(await screen.findByRole('alert')).toHaveTextContent('boardPhotoErrorUnreadable')
    expect(screen.queryAllByRole('img')).toHaveLength(0)
    expect(upload).not.toHaveBeenCalled()
  })

  it('removes a photo before posting, so it is not attached', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { id: 'new1' } }, 201))
    render(<ComposeForm hasDisplayName />)
    fill()
    choose(photo('a.jpg'), photo('b.jpg'))
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'boardPhotoRemove' })[0]).not.toBeDisabled()
    )
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'boardSubmit' })).not.toBeDisabled()
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'boardPhotoRemove' })[0]!)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(URL.revokeObjectURL).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'boardSubmit' }))
    await waitFor(() => expect(push).toHaveBeenCalled())
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).imageIds).toEqual(['img2'])
  })

  it('explains photos the server can no longer attach', async () => {
    fetchMock.mockResolvedValueOnce(json({ code: 'IMAGES_UNAVAILABLE' }, 409))
    render(<ComposeForm hasDisplayName />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'boardSubmit' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('boardPhotoErrorStale')
  })

  it('offers no photo picker when editing (photos stay as they are)', () => {
    render(<ComposeForm hasDisplayName editing={{ id: 't1', title: 't', body: 'b' }} />)
    expect(screen.queryByLabelText('boardPhotoAdd')).toBeNull()
  })
})

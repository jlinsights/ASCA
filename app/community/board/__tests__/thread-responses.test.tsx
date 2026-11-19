import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ThreadResponses, type ThreadViewer } from '../[id]/thread-responses'
import type { CommentView } from '@/lib/community/comments'

jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'ko' }),
}))

const refresh = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

const fetchMock = jest.fn()
const originalFetch = global.fetch
beforeEach(() => {
  fetchMock.mockReset()
  refresh.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

const json = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body })
const member: ThreadViewer = { signedIn: true, hasDisplayName: true }
const visitor: ThreadViewer = { signedIn: false, hasDisplayName: false }

const comment = (overrides: Partial<CommentView> = {}): CommentView => ({
  id: 'c1',
  body: '축하합니다 https://example.test/x',
  created_at: '2026-10-25T05:00:00.000Z',
  author: { kind: 'member', name: '이웃 회원', role: null, image: null, href: null },
  mine: false,
  ...overrides,
})

const renderResponses = (props: Partial<React.ComponentProps<typeof ThreadResponses>> = {}) =>
  render(
    <ThreadResponses
      threadId='t1'
      comments={[]}
      reactions={{ count: 2, liked: false }}
      viewer={member}
      open
      {...props}
    />
  )

describe('ThreadResponses — likes', () => {
  it('toggles a like and shows the server count', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { count: 3, liked: true } }))
    renderResponses()
    const button = screen.getByRole('button', { name: /boardLike/ })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(button).toHaveTextContent('2')
    fireEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'))
    expect(button).toHaveTextContent('3')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/community/threads/t1/reaction',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ liked: true }) })
    )
  })

  it('keeps the old state and explains a failure', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 500))
    renderResponses()
    fireEvent.click(screen.getByRole('button', { name: /boardLike/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('boardLikeFailed')
    expect(screen.getByRole('button', { name: /boardLike/ })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('sends visitors to sign in, back to this thread', () => {
    renderResponses({ viewer: visitor })
    expect(screen.getByRole('link', { name: /boardLikeSignIn/ })).toHaveAttribute(
      'href',
      `/sign-in?next=${encodeURIComponent('/community/board/t1')}`
    )
    expect(screen.getByRole('link', { name: 'boardCommentSignIn' })).toBeInTheDocument()
  })
})

describe('ThreadResponses — comments', () => {
  it('lists comments as text with safe links and no delete for others', () => {
    renderResponses({ comments: [comment()] })
    expect(screen.getByText('이웃 회원')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://example.test/x' })).toHaveAttribute(
      'rel',
      'nofollow ugc noopener noreferrer'
    )
    expect(screen.queryByRole('button', { name: 'boardCommentDelete' })).toBeNull()
  })

  it('posts a comment and refreshes', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { id: 'c2' } }, 201))
    renderResponses()
    const box = screen.getByLabelText(/boardCommentLabel/)
    fireEvent.change(box, { target: { value: '좋은 소식' } })
    fireEvent.click(screen.getByRole('button', { name: 'boardCommentSubmit' }))
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/community/threads/t1/comments',
      expect.objectContaining({ body: JSON.stringify({ body: '좋은 소식' }) })
    )
    expect(box).toHaveValue('')
  })

  it('explains the rate limit', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 429))
    renderResponses()
    fireEvent.change(screen.getByLabelText(/boardCommentLabel/), { target: { value: '또' } })
    fireEvent.click(screen.getByRole('button', { name: 'boardCommentSubmit' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('boardCommentErrorRate')
  })

  it('deletes my own comment after confirming', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { id: 'c1' } }))
    renderResponses({ comments: [comment({ mine: true })] })
    fireEvent.click(screen.getByRole('button', { name: 'boardCommentDelete' }))
    expect(screen.getByText('boardCommentDeleteConfirm')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'boardCommentDeleteYes' }))
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/community/comments/c1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('asks for a display name before commenting', () => {
    renderResponses({ viewer: { signedIn: true, hasDisplayName: false } })
    expect(screen.getByText('boardCommentNeedName')).toBeInTheDocument()
    expect(screen.queryByLabelText(/boardCommentLabel/)).toBeNull()
  })

  it('closes a hidden thread to new comments and likes', () => {
    renderResponses({ open: false })
    expect(screen.getByText('boardCommentClosed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /boardLike/ })).toBeDisabled()
    expect(screen.queryByLabelText(/boardCommentLabel/)).toBeNull()
  })
})

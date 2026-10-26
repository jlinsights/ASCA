'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Heart } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { COMMENT_MAX, type CommentView, type ReactionState } from '@/lib/community/comments'
import { AuthorLine, ThreadBody, useThreadDate } from '../_components/thread-parts'

/** 보는 사람 — 로그인 여부와 표시 이름만. 계정 ID 는 화면에 넘기지 않는다 */
export interface ThreadViewer {
  signedIn: boolean
  hasDisplayName: boolean
}

interface ResponsesProps {
  threadId: string
  comments: CommentView[]
  reactions: ReactionState
  viewer: ThreadViewer
  /** 숨김 글이면 false — 관리자만 보며, 댓글·좋아요를 더하지 못한다 */
  open: boolean
}

const signInHref = (threadId: string) =>
  `/sign-in?next=${encodeURIComponent(`/community/board/${threadId}`)}`

/** 글 아래 — 좋아요 한 줄과 댓글 목록·입력 */
export function ThreadResponses({ threadId, comments, reactions, viewer, open }: ResponsesProps) {
  return (
    <>
      <LikeBar threadId={threadId} initial={reactions} viewer={viewer} open={open} />
      <CommentSection threadId={threadId} comments={comments} viewer={viewer} open={open} />
    </>
  )
}

function LikeBar({
  threadId,
  initial,
  viewer,
  open,
}: {
  threadId: string
  initial: ReactionState
  viewer: ThreadViewer
  open: boolean
}) {
  const { t } = useLanguage()
  const [state, setState] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const heart = <Heart aria-hidden='true' className='cb-like__icon' />
  const count = <span className='cb-like__count'>{state.count}</span>

  async function toggle() {
    setBusy(true)
    setFailed(false)
    try {
      const response = await fetch(`/api/community/threads/${threadId}/reaction`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: !state.liked }),
      })
      const payload = (await response.json().catch(() => null)) as {
        data?: ReactionState
      } | null
      if (!response.ok || !payload?.data) throw new Error()
      setState(payload.data)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='cb-like'>
      {!viewer.signedIn && open ? (
        <Link href={signInHref(threadId)} className='cb-like__button'>
          {heart}
          <span>{t('boardLikeSignIn')}</span>
          {count}
        </Link>
      ) : (
        <button
          type='button'
          className='cb-like__button'
          aria-pressed={state.liked}
          disabled={busy || !open}
          onClick={toggle}
        >
          {heart}
          <span>{t('boardLike')}</span>
          {count}
        </button>
      )}
      {failed && (
        <p role='alert' className='m-0 text-destructive'>
          {t('boardLikeFailed')}
        </p>
      )}
    </div>
  )
}

function CommentSection({
  threadId,
  comments,
  viewer,
  open,
}: {
  threadId: string
  comments: CommentView[]
  viewer: ThreadViewer
  open: boolean
}) {
  const { t } = useLanguage()
  return (
    <section className='cb-comments' aria-labelledby='cb-comments-title'>
      <h2 id='cb-comments-title' className='cb-comments__title'>
        {t('boardCommentsCount').replace('{n}', String(comments.length))}
      </h2>
      {comments.length ? (
        <ol className='cb-comments__list'>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </ol>
      ) : (
        <p className='cb-empty'>{t('boardCommentsEmpty')}</p>
      )}
      {!open ? (
        <p className='cb-form__hint'>{t('boardCommentClosed')}</p>
      ) : !viewer.signedIn ? (
        <div>
          <Button asChild variant='outline'>
            <Link href={signInHref(threadId)}>{t('boardCommentSignIn')}</Link>
          </Button>
        </div>
      ) : !viewer.hasDisplayName ? (
        <div className='cb-panel cb-panel--flush'>
          <p className='m-0'>{t('boardCommentNeedName')}</p>
          <div>
            <Button asChild>
              <Link href='/profile'>{t('boardGoProfile')}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <CommentForm threadId={threadId} />
      )}
    </section>
  )
}

function CommentItem({ comment }: { comment: CommentView }) {
  const { t } = useLanguage()
  const router = useRouter()
  const formatDate = useThreadDate()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function remove() {
    setBusy(true)
    setFailed(false)
    try {
      const response = await fetch(`/api/community/comments/${comment.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) throw new Error()
      router.refresh()
    } catch {
      setFailed(true)
      setBusy(false)
    }
  }

  return (
    <li className='cb-comment'>
      <div className='cb-comment__head'>
        <AuthorLine author={comment.author} />
        <time dateTime={comment.created_at} className='cb-comment__date'>
          {formatDate(comment.created_at)}
        </time>
      </div>
      <ThreadBody body={comment.body} className='cb-comment__body' />
      {comment.mine && (
        <div className='cb-comment__actions'>
          {confirming ? (
            <>
              <span>{t('boardCommentDeleteConfirm')}</span>
              <Button size='sm' variant='destructive' disabled={busy} onClick={remove}>
                {t('boardCommentDeleteYes')}
              </Button>
              <Button
                size='sm'
                variant='ghost'
                disabled={busy}
                onClick={() => setConfirming(false)}
              >
                {t('boardCommentDeleteNo')}
              </Button>
            </>
          ) : (
            <Button size='sm' variant='ghost' onClick={() => setConfirming(true)}>
              {t('boardCommentDelete')}
            </Button>
          )}
          {failed && (
            <p role='alert' className='m-0 text-destructive'>
              {t('boardCommentDeleteFailed')}
            </p>
          )}
        </div>
      )}
    </li>
  )
}

const COMMENT_ERRORS: Record<string, string> = {
  DISPLAY_NAME_REQUIRED: 'boardCommentNeedName',
  THREAD_NOT_FOUND: 'boardCommentClosed',
  RATE_LIMITED: 'boardCommentErrorRate',
}

function CommentForm({ threadId }: { threadId: string }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setFailed(null)
    try {
      const response = await fetch(`/api/community/threads/${threadId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      const payload = (await response.json().catch(() => null)) as { code?: string } | null
      if (!response.ok) {
        const code = response.status === 429 ? 'RATE_LIMITED' : payload?.code
        setFailed(COMMENT_ERRORS[code ?? ''] ?? 'boardCommentErrorGeneric')
        return
      }
      setBody('')
      router.refresh()
    } catch {
      setFailed('boardCommentErrorGeneric')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className='cb-form' onSubmit={submit}>
      <div className='cb-form__field'>
        <label htmlFor='cb-comment' className='cb-form__label'>
          <span>{t('boardCommentLabel')}</span>
          <span className='cb-form__count' aria-hidden='true'>
            {body.length}/{COMMENT_MAX}
          </span>
        </label>
        <Textarea
          id='cb-comment'
          value={body}
          maxLength={COMMENT_MAX}
          rows={4}
          required
          aria-describedby='cb-comment-hint'
          onChange={event => setBody(event.target.value)}
        />
        <p id='cb-comment-hint' className='cb-form__hint'>
          {t('boardCommentHint')}
        </p>
      </div>
      {failed && (
        <p role='alert' className='m-0 text-destructive'>
          {t(failed)}
        </p>
      )}
      <div className='cb-form__actions'>
        <Button type='submit' disabled={busy || !body.trim()}>
          {t(busy ? 'boardSubmitting' : 'boardCommentSubmit')}
        </Button>
      </div>
    </form>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  HIDE_REASON_MAX,
  type ThreadModerationState,
  type ThreadView,
} from '@/lib/community/threads'
import type { CommentView, ReactionState } from '@/lib/community/comments'
import { AuthorLine, ThreadBody, useThreadDate } from '../_components/thread-parts'
import { ThreadResponses, type ThreadViewer } from './thread-responses'
import '../_components/board.css'

interface ThreadDetailProps {
  thread: ThreadView
  /** 관리자에게만 넘어온다. null 이면 관리 도구를 그리지 않는다 */
  moderation: ThreadModerationState | null
  comments: CommentView[]
  reactions: ReactionState
  viewer: ThreadViewer
}

export function ThreadDetail({
  thread,
  moderation,
  comments,
  reactions,
  viewer,
}: ThreadDetailProps) {
  const { t } = useLanguage()
  const formatDate = useThreadDate()
  return (
    <div className='cb'>
      <div className='cb__frame'>
        <article className='cb-thread' aria-labelledby='cb-thread-title'>
          <Link href='/community/board' className='cb-back'>
            ← {t('boardBack')}
          </Link>
          {moderation?.hiddenAt && (
            <div className='cb-banner' role='status'>
              <p className='m-0'>{t('boardHiddenNotice')}</p>
              {moderation.hiddenReason && (
                <p className='m-0 mt-1'>
                  {t('boardHiddenReason')}: {moderation.hiddenReason}
                </p>
              )}
            </div>
          )}
          <div className='cb-thread__sheet'>
            <AuthorLine author={thread.author} />
            <div className='cb-notch' aria-hidden='true' />
            <h1 id='cb-thread-title' className='cb-thread__title'>
              {thread.title}
            </h1>
            <p className='cb-thread__meta'>
              <time dateTime={thread.created_at}>{formatDate(thread.created_at)}</time>
              {thread.edited && <> · {t('boardEdited')}</>}
            </p>
            <ThreadBody body={thread.body} className='cb-thread__body' />
          </div>
          <ThreadResponses
            threadId={thread.id}
            comments={comments}
            reactions={reactions}
            viewer={viewer}
            open={!moderation?.hiddenAt}
          />
          {moderation && <ModerationPanel threadId={thread.id} hidden={!!moderation.hiddenAt} />}
        </article>
      </div>
    </div>
  )
}

/** 사무국 숨김·되살림 — 행을 지우지 않는다. 처리 뒤 서버 화면을 다시 그린다 */
function ModerationPanel({ threadId, hidden }: { threadId: string; hidden: boolean }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const reason = String(new FormData(event.currentTarget).get('reason') ?? '').trim()
    setBusy(true)
    setFailed(false)
    try {
      const response = await fetch(`/api/admin/community/threads/${threadId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          hidden ? { action: 'restore' } : { action: 'hide', ...(reason ? { reason } : {}) }
        ),
      })
      if (!response.ok) throw new Error()
      router.refresh()
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className='cb-panel' onSubmit={submit} aria-labelledby='cb-moderation-title'>
      <h2 id='cb-moderation-title' className='cb-panel__title'>
        {t('boardModeration')}
      </h2>
      {!hidden && (
        <div className='cb-form__field'>
          <Label htmlFor='cb-hide-reason'>{t('boardHideReasonLabel')}</Label>
          <Input id='cb-hide-reason' name='reason' maxLength={HIDE_REASON_MAX} />
        </div>
      )}
      <div>
        <Button type='submit' variant={hidden ? 'default' : 'destructive'} disabled={busy}>
          {t(hidden ? 'boardRestore' : 'boardHide')}
        </Button>
      </div>
      {failed && (
        <p role='alert' className='m-0 text-destructive'>
          {t('boardModerationFailed')}
        </p>
      )}
    </form>
  )
}

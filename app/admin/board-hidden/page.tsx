'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { HiddenThreadView } from '@/lib/community/feed'
import { excerpt } from '@/lib/community/threads'

const FAILURES: Record<string, string> = {
  THREAD_STATE_CHANGED: '이미 되살렸거나 작성자가 지운 글입니다. 목록을 새로 불러왔습니다.',
  FORBIDDEN: '관리자 권한을 확인해 주세요.',
  UNAUTHORIZED: '다시 로그인해 주세요.',
}

const kst = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

function authorName(thread: HiddenThreadView) {
  if (thread.author.kind === 'deleted') return '(탈퇴한 회원)'
  return thread.author.name ?? '(이름 없는 회원)'
}

function HiddenThreadCard({
  thread,
  busy,
  onRestore,
}: {
  thread: HiddenThreadView
  busy: boolean
  onRestore: (thread: HiddenThreadView) => void
}) {
  return (
    <article className='space-y-3 rounded-lg border p-4' aria-label={`${thread.title} 숨긴 글`}>
      <header className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 className='text-lg font-semibold'>
          {/* 관리자에게는 숨긴 글 상세가 열린다(되살리기도 그 화면에서 가능) */}
          <Link href={`/community/board/${thread.id}`} className='underline' target='_blank'>
            {thread.title}
          </Link>
        </h2>
        <p className='text-xs text-muted-foreground'>
          {authorName(thread)}
          {' · '}
          <time dateTime={thread.created_at}>{kst(thread.created_at)}</time> 작성
        </p>
      </header>
      <p className='line-clamp-3 whitespace-pre-line text-sm text-muted-foreground'>
        {excerpt(thread.body, 200).text}
      </p>
      <dl className='grid gap-1 rounded bg-muted px-3 py-2 text-sm sm:grid-cols-[6rem_1fr]'>
        <dt className='font-medium'>숨긴 때</dt>
        <dd>
          <time dateTime={thread.hidden_at}>{kst(thread.hidden_at)}</time>
          {' · '}
          {thread.hidden_by_name ?? '(처리자 확인 불가)'}
        </dd>
        <dt className='font-medium'>사유</dt>
        <dd className='whitespace-pre-line'>{thread.hidden_reason || '(사유 없음)'}</dd>
      </dl>
      <Button variant='outline' size='sm' disabled={busy} onClick={() => onRestore(thread)}>
        다시 보이게 하기
      </Button>
    </article>
  )
}

export default function AdminBoardHiddenPage() {
  const [threads, setThreads] = useState<HiddenThreadView[] | null>(null)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const response = await fetch('/api/admin/community/threads', { credentials: 'include' })
      if (!response.ok) throw new Error()
      const { data } = (await response.json()) as {
        data: { threads: HiddenThreadView[]; total: number }
      }
      setThreads(data.threads)
      setTotal(data.total)
    } catch {
      setThreads(null)
      setError('숨긴 글을 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const restore = async (thread: HiddenThreadView) => {
    setBusyId(thread.id)
    setNotice(null)
    try {
      const response = await fetch(`/api/admin/community/threads/${thread.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      })
      if (response.ok) {
        setNotice(`“${thread.title}”을(를) 다시 게시판에 보이게 했습니다.`)
      } else {
        const body = (await response.json().catch(() => null)) as { code?: string } | null
        setNotice(FAILURES[body?.code ?? ''] ?? '되살리지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>게시판 숨긴 글</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          사무국이 숨긴 글은 게시판과 글 주소에서 보이지 않고, 작성자의 내 글 목록에만 숨김 표시와
          함께 남습니다. 숨긴 사유는 작성자에게 보이지 않습니다. 작성자가 지운 글은 여기에 나오지
          않습니다. 글을 숨기려면 게시판의 글 화면에서 숨기세요.
        </p>
      </div>

      {notice && (
        <p role='status' className='rounded-md bg-muted px-3 py-2 text-sm'>
          {notice}
        </p>
      )}

      {error ? (
        <div role='alert' className='rounded-md border border-destructive/40 p-4 text-sm'>
          {error}
          <Button variant='outline' size='sm' className='ml-3' onClick={() => void load()}>
            다시 시도
          </Button>
        </div>
      ) : !threads ? (
        <p className='text-sm text-muted-foreground'>불러오는 중…</p>
      ) : threads.length === 0 ? (
        <p className='text-sm text-muted-foreground'>숨긴 글이 없습니다.</p>
      ) : (
        <div className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            {total > threads.length
              ? `숨긴 글 ${total}편 중 최근 ${threads.length}편`
              : `숨긴 글 ${total}편`}
          </p>
          {threads.map(thread => (
            <HiddenThreadCard
              key={thread.id}
              thread={thread}
              busy={busyId === thread.id}
              onRestore={target => void restore(target)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

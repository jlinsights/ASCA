'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PROFILE_FIELD_LABELS } from '@/lib/admin/profile-revisions'

interface Revision {
  id: string
  artist_id: string
  account_id: string | null
  editor_email: string | null
  changes: Record<string, { before: unknown; after: unknown }>
  revert_of: string | null
  reverted_at: string | null
  created_at: string
  artist: { id: string; name: string; name_zh: string | null; visibility: string } | null
}

const FAILURES: Record<string, string> = {
  CHANGED_SINCE:
    '그 뒤에 같은 칸이 다시 수정되어 되돌리지 않았습니다. 최신 수정부터 되돌려 주세요.',
  NOT_REVERTIBLE: '이미 되돌렸거나 되돌리기 기록이라 다시 되돌릴 수 없습니다.',
  REVIEWER_NOT_ALLOWED: '관리자 권한을 확인해 주세요.',
  REVISION_NOT_FOUND: '수정 기록을 찾을 수 없습니다.',
}

const kst = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

function show(value: unknown) {
  if (value === null || value === undefined || value === '') return '(비어 있음)'
  if (Array.isArray(value)) return value.length ? value.join(', ') : '(비어 있음)'
  return String(value)
}

function RevisionCard({
  revision,
  busy,
  onRevert,
}: {
  revision: Revision
  busy: boolean
  onRevert: (revision: Revision) => void
}) {
  const name = revision.artist?.name ?? '(삭제된 작가)'
  return (
    <article className='space-y-3 rounded-lg border p-4' aria-label={`${name} 프로필 수정`}>
      <header className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 className='text-lg font-semibold'>
          {revision.artist?.visibility === 'public' ? (
            <Link href={`/artists/${revision.artist_id}`} className='underline' target='_blank'>
              {name}
            </Link>
          ) : (
            name
          )}
          {revision.artist?.name_zh && (
            <span className='ml-2 text-sm font-normal text-muted-foreground'>
              {revision.artist.name_zh}
            </span>
          )}
        </h2>
        <p className='text-xs text-muted-foreground'>
          <time dateTime={revision.created_at}>{kst(revision.created_at)}</time>
          {' · '}
          {revision.revert_of ? '사무국 되돌리기' : (revision.editor_email ?? '(계정 확인 불가)')}
        </p>
      </header>
      <dl className='space-y-3 text-sm'>
        {Object.entries(revision.changes).map(([field, change]) => (
          <div key={field}>
            <dt className='font-medium'>{PROFILE_FIELD_LABELS[field] ?? field}</dt>
            <dd className='mt-1 grid gap-2 sm:grid-cols-2'>
              <p className='max-h-40 overflow-auto whitespace-pre-line rounded bg-muted px-2 py-1 text-muted-foreground'>
                <span className='sr-only'>이전: </span>
                {show(change.before)}
              </p>
              <p className='max-h-40 overflow-auto whitespace-pre-line rounded border px-2 py-1'>
                <span className='sr-only'>이후: </span>
                {show(change.after)}
              </p>
            </dd>
          </div>
        ))}
      </dl>
      {revision.reverted_at ? (
        <p className='text-sm text-muted-foreground'>{kst(revision.reverted_at)}에 되돌렸습니다.</p>
      ) : (
        !revision.revert_of && (
          <Button variant='outline' size='sm' disabled={busy} onClick={() => onRevert(revision)}>
            이 수정 되돌리기
          </Button>
        )
      )}
    </article>
  )
}

export default function AdminProfileChangesPage() {
  const [revisions, setRevisions] = useState<Revision[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const response = await fetch('/api/admin/profile-revisions', { credentials: 'include' })
      if (!response.ok) throw new Error()
      setRevisions(((await response.json()) as { data: Revision[] }).data)
    } catch {
      setRevisions(null)
      setError('수정 기록을 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const revert = async (revision: Revision) => {
    setBusyId(revision.id)
    setNotice(null)
    try {
      const response = await fetch(`/api/admin/profile-revisions/${revision.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revert' }),
      })
      if (response.ok) {
        setNotice(`${revision.artist?.name ?? '작가'}: 수정을 되돌렸습니다.`)
      } else {
        const body = (await response.json().catch(() => null)) as { code?: string } | null
        setNotice(FAILURES[body?.code ?? ''] ?? '되돌리지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>작가 프로필 수정 기록</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          연결된 작가가 고친 내용은 바로 공개됩니다. 최근 50건의 수정 전·후를 보고, 잘못된 수정은
          되돌리세요. 그 뒤에 같은 칸이 다시 고쳐졌다면 최신 수정부터 되돌려야 합니다.
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
      ) : !revisions ? (
        <p className='text-sm text-muted-foreground'>불러오는 중…</p>
      ) : revisions.length === 0 ? (
        <p className='text-sm text-muted-foreground'>아직 수정 기록이 없습니다.</p>
      ) : (
        <div className='space-y-4'>
          {revisions.map(revision => (
            <RevisionCard
              key={revision.id}
              revision={revision}
              busy={busyId === revision.id}
              onRevert={target => void revert(target)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  STATUS_LABELS,
  type AdminApplication,
  type ApplicationView,
  type NoteDraft,
  type ReviewedFields,
} from '@/lib/applications/admin-applications'
import { ApplicationCard, type ReviewChange } from './_components/application-card'

const VIEWS: readonly { value: ApplicationView; label: string }[] = [
  { value: 'open', label: '처리할 신청' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '반려' },
  { value: 'withdrawn', label: '철회' },
]

// 서버가 돌려주는 코드 → 관리자에게 보일 말
const FAILURES: Record<string, string> = {
  APPLICATION_CHANGED:
    '다른 관리자가 먼저 이 신청을 바꿨습니다. 목록을 새로 불러왔으니 카드에서 확인해 주세요.',
  APPLICATION_NOT_FOUND: '신청을 찾을 수 없습니다.',
}

interface ListBody {
  data: AdminApplication[]
  page: number
  limit: number
  total: number
}

export default function AdminArtistApplicationsPage() {
  const [view, setView] = useState<ApplicationView>('open')
  const [page, setPage] = useState(1)
  const [list, setList] = useState<ListBody | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  // 저장 중인 카드들 — 여러 카드를 잇달아 저장해도 각자 끝날 때까지 잠겨 있다
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(() => new Set())
  // 저장하지 않은 메모 — 카드가 아니라 여기 신청 ID 로 둔다. 다시 읽기·카드 재생성·목록 오류에도 남는다.
  // 고치기 시작할 때 본 상태·처리 시각을 함께 두어, 그 사이 남이 바꾼 것을 덮지 않는다
  const [drafts, setDrafts] = useState<Readonly<Record<string, NoteDraft>>>({})
  // 지금 보고 있는 탭·쪽과 마지막 요청 번호 — 늦게 온 옛 응답이 화면을 덮지 않게 한다
  const query = useRef({ view, page })
  const latest = useRef(0)

  const load = useCallback(async () => {
    const request = ++latest.current
    const { view: wanted, page: wantedPage } = query.current
    setError(null)
    try {
      const params = new URLSearchParams({ view: wanted, page: String(wantedPage) })
      const response = await fetch(`/api/admin/artist-applications?${params}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error()
      const body = (await response.json()) as ListBody
      if (request === latest.current) setList(body)
    } catch {
      if (request !== latest.current) return
      // 이미 보이던 목록은 그대로 둔다 — 지우면 그 위에서 쓰던 메모 카드까지 사라진다
      setError('신청 목록을 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => {
    query.current = { view, page }
    setList(null)
    void load()
  }, [view, page, load])

  const switchView = (next: ApplicationView) => {
    setView(next)
    setPage(1)
  }

  const writeDraft = (application: AdminApplication, note: string) =>
    setDrafts(current => {
      const base = current[application.id]
      return {
        ...current,
        [application.id]: {
          note,
          // 기준 버전은 처음 쓸 때 한 번만 정한다. seen 은 null(처리된 적 없음)도 유효한 기준이라 ?? 를 쓰지 않는다
          from: base ? base.from : application.status,
          seen: base ? base.seen : application.reviewed_at,
        },
      }
    })

  /** 충돌 뒤 '최신 기준으로' — 지금 보이는 상태·처리 시각을 새 기준으로 삼는다(남의 변경을 본 뒤에만 누른다) */
  const rebaseDraft = (application: AdminApplication) =>
    setDrafts(current => {
      const base = current[application.id]
      if (!base) return current
      return {
        ...current,
        [application.id]: { ...base, from: application.status, seen: application.reviewed_at },
      }
    })

  const discardDraft = (id: string) => setDrafts(({ [id]: _dropped, ...rest }) => rest)

  const review = async (application: AdminApplication, change: ReviewChange) => {
    const draft = drafts[application.id]
    setBusyIds(current => new Set(current).add(application.id))
    setNotice(null)
    try {
      const response = await fetch(`/api/admin/artist-applications/${application.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        // 초안이 있으면 그 기준 버전으로 보낸다 — 그 사이 바뀌었으면 서버가 409 로 막는다
        body: JSON.stringify({
          from: draft ? draft.from : application.status,
          seen: draft ? draft.seen : application.reviewed_at,
          ...change,
        }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { code?: string } | null
        setNotice(FAILURES[body?.code ?? ''] ?? '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      } else {
        const saved = ((await response.json()) as { data: ReviewedFields }).data
        // 다시 읽기를 기다리지 않고 이 행을 바로 고친다 — 다시 읽기가 실패해도 저장된 값이 보인다
        setList(
          current =>
            current && {
              ...current,
              data: current.data.map(row => (row.id === saved.id ? { ...row, ...saved } : row)),
            }
        )
        // 보낸 메모가 저장됐으면 초안을 지우고, 그 뒤 고친 글이면 새 버전을 기준으로 남긴다
        const sent = change.note
        setDrafts(({ [application.id]: current, ...rest }) =>
          !current || current.note === sent || current.note.trim() === (saved.review_note ?? '')
            ? rest
            : {
                ...rest,
                [application.id]: { ...current, from: saved.status, seen: saved.reviewed_at },
              }
        )
        const name = application.applicant_name ?? '신청'
        setNotice(
          change.to === application.status
            ? `${name}: 메모를 저장했습니다`
            : `${name}: ${STATUS_LABELS[change.to]}(으)로 바꿨습니다`
        )
      }
    } catch {
      // 요청이 서버에 닿았는지 모른다 — 목록을 새로 읽어 실제 상태를 보인다
      setNotice('연결이 끊겨 저장됐는지 확인하지 못했습니다. 목록을 새로 불러왔으니 확인해 주세요.')
    }
    try {
      // 그 사이 탭을 옮겼다면 지금 탭을 읽는다(query 는 언제나 최신 탭).
      // 다시 읽기가 끝날 때까지 카드를 잠가 둔다 — 그 사이 쓴 메모가 새 카드에 덮이지 않게
      await load()
    } finally {
      setBusyIds(current => {
        const next = new Set(current)
        next.delete(application.id)
        return next
      })
    }
  }

  const pages = list ? Math.max(1, Math.ceil(list.total / list.limit)) : 1

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>작가 신청 심사</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Tally 추천·초대작가 신청서로 들어온 신청입니다. 전화·주소·납부정보·첨부파일은 여기 옮기지
          않으니 Tally 원본에서 확인하세요. 상태를 &lsquo;승인&rsquo;으로 바꿔도 작가로 선임되지는
          않습니다 — 이사회 의결·납부를 확인한 뒤 작가 행을 따로 만드세요.
        </p>
      </div>

      <div role='tablist' aria-label='신청 상태' className='flex flex-wrap gap-2'>
        {VIEWS.map(item => (
          <Button
            key={item.value}
            role='tab'
            aria-selected={view === item.value}
            variant={view === item.value ? 'default' : 'outline'}
            size='sm'
            onClick={() => switchView(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {notice && (
        <p role='status' className='rounded-md bg-muted px-3 py-2 text-sm'>
          {notice}
        </p>
      )}

      {error && (
        <div role='alert' className='rounded-md border border-destructive/40 p-4 text-sm'>
          {error}
          <Button variant='outline' size='sm' className='ml-3' onClick={() => void load()}>
            다시 시도
          </Button>
        </div>
      )}

      {!list ? (
        !error && <p className='text-sm text-muted-foreground'>불러오는 중…</p>
      ) : (
        <div className='space-y-4'>
          {list.data.length === 0 ? (
            <p className='text-sm text-muted-foreground'>해당하는 신청이 없습니다.</p>
          ) : (
            list.data.map(application => (
              <ApplicationCard
                // 상태가 바뀌면 카드를 새로 그려 확인 단계를 닫는다. 메모 초안은 drafts 에 있어 남는다
                key={`${application.id}:${application.status}`}
                application={application}
                draft={drafts[application.id]}
                busy={busyIds.has(application.id)}
                onDraft={writeDraft}
                onRebase={rebaseDraft}
                onDiscard={discardDraft}
                onReview={(target, change) => void review(target, change)}
              />
            ))
          )}
          {(pages > 1 || page > 1) && (
            <nav aria-label='쪽 이동' className='flex items-center gap-3 text-sm'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1}
                onClick={() => setPage(current => Math.max(1, current - 1))}
              >
                이전
              </Button>
              <span>
                {page} / {pages}쪽 · 모두 {list.total}건
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={page >= pages}
                onClick={() => setPage(current => current + 1)}
              >
                다음
              </Button>
            </nav>
          )}
        </div>
      )}
    </div>
  )
}

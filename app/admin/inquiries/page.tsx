'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { AdminInquiry, InquiryStatus } from '@/lib/inquiries/schema'
import { InquiryCard, type InquiryAction } from './_components/inquiry-card'

const STATUSES = [
  { value: 'new', label: '새 문의' },
  { value: 'answered', label: '답함' },
  { value: 'closed', label: '종결' },
  { value: 'all', label: '전체' },
] as const
type Filter = (typeof STATUSES)[number]['value']

interface Paging {
  pageSize: number
  total: number
}

const DONE: Record<InquiryStatus, string> = {
  new: '새 문의로 되돌렸습니다',
  answered: '답함으로 옮겼습니다',
  closed: '종결했습니다',
}

export default function AdminInquiriesPage() {
  const [filter, setFilter] = useState<Filter>('new')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminInquiry[] | null>(null)
  const [paging, setPaging] = useState<Paging>({ pageSize: 50, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  // 처리 중인 문의는 행마다 잠근다 — 다른 문의를 처리해도 앞선 문의의 잠금이 풀리지 않는다 (Codex #216)
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(() => new Set())
  const busyRef = useRef<ReadonlySet<string>>(busyIds)
  const markBusy = (id: string, on: boolean) => {
    const next = new Set(busyRef.current)
    if (on) next.add(id)
    else next.delete(id)
    busyRef.current = next
    setBusyIds(next)
  }

  // 처리 뒤 다시 불러올 때도 '지금' 보고 있는 탭·쪽을 쓴다 — 처리를 시작한 때의 탭이 아니다 (Codex #216)
  const view = useRef({ filter, page })
  view.current = { filter, page }
  // 탭·쪽을 빨리 바꾸면 이전 요청의 늦은 응답이 현재 목록을 덮는다 — 가장 최근 요청만 반영한다
  const latest = useRef(0)
  const load = useCallback(async () => {
    const ticket = ++latest.current
    const { filter: status, page: current } = view.current
    setError(null)
    try {
      const response = await fetch(`/api/admin/inquiries?status=${status}&page=${current}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error()
      const body = (await response.json()) as { data: AdminInquiry[] } & Paging
      if (ticket !== latest.current) return
      const lastPage = Math.max(1, Math.ceil(body.total / body.pageSize))
      // 마지막 쪽의 문의를 모두 처리하면 그 쪽이 비므로 마지막 쪽으로 물러난다
      if (current > lastPage) return setPage(lastPage)
      setItems(body.data)
      setPaging({ pageSize: body.pageSize, total: body.total })
    } catch {
      if (ticket !== latest.current) return
      setItems(null)
      setError('문의 목록을 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => {
    setItems(null)
    void load()
  }, [filter, page, load])

  const lastPage = Math.max(1, Math.ceil(paging.total / paging.pageSize))
  const first = (page - 1) * paging.pageSize + 1

  const act = async (inquiry: AdminInquiry, action: InquiryAction) => {
    if (busyRef.current.has(inquiry.id)) return
    markBusy(inquiry.id, true)
    setNotice(null)
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: action.kind === 'delete' ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...(action.kind === 'status'
          ? { body: JSON.stringify({ status: action.status, note: action.note }) }
          : {}),
      })
      if (!response.ok) {
        setNotice('처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      } else {
        setNotice(
          `${inquiry.name}: ${action.kind === 'delete' ? '삭제했습니다' : DONE[action.status]}`
        )
      }
      await load()
    } finally {
      markBusy(inquiry.id, false)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>문의 접수함</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          문의서(/contact)로 들어온 문의입니다. 알림 메일은 가지 않으니 이 화면을 자주 확인해
          주세요. 답장은 &lsquo;메일로 답하기&rsquo;로 쓰고, 답한 뒤 &lsquo;답함&rsquo;으로
          옮기세요. 처리 후 보유 기간이 지났거나 본인이 삭제를 요청하면 삭제합니다.
        </p>
      </div>

      <div role='tablist' aria-label='처리 상태' className='flex flex-wrap gap-2'>
        {STATUSES.map(item => (
          <Button
            key={item.value}
            role='tab'
            aria-selected={filter === item.value}
            variant={filter === item.value ? 'default' : 'outline'}
            size='sm'
            onClick={() => {
              setFilter(item.value)
              setPage(1)
            }}
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

      {error ? (
        <div role='alert' className='rounded-md border border-destructive/40 p-4 text-sm'>
          {error}
          <Button variant='outline' size='sm' className='ml-3' onClick={() => void load()}>
            다시 시도
          </Button>
        </div>
      ) : !items ? (
        <p className='text-sm text-muted-foreground'>불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className='text-sm text-muted-foreground'>해당하는 문의가 없습니다.</p>
      ) : (
        <div className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            전체 {paging.total}건 중 {first}–{first + items.length - 1}번째 (최신 순)
          </p>
          {items.map(item => (
            <InquiryCard
              key={item.id}
              inquiry={item}
              busy={busyIds.has(item.id)}
              onAction={action => void act(item, action)}
            />
          ))}
          {lastPage > 1 && (
            <nav aria-label='문의 목록 쪽' className='flex items-center gap-3'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1}
                onClick={() => setPage(current => current - 1)}
              >
                이전 쪽
              </Button>
              <span className='text-sm text-muted-foreground' aria-current='page'>
                {page} / {lastPage}쪽
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={page >= lastPage}
                onClick={() => setPage(current => current + 1)}
              >
                다음 쪽
              </Button>
            </nav>
          )}
        </div>
      )}
    </div>
  )
}

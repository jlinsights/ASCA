'use client'

import { useCallback, useEffect, useState } from 'react'
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

const DONE: Record<InquiryStatus, string> = {
  new: '새 문의로 되돌렸습니다',
  answered: '답함으로 옮겼습니다',
  closed: '종결했습니다',
}

export default function AdminInquiriesPage() {
  const [filter, setFilter] = useState<Filter>('new')
  const [items, setItems] = useState<AdminInquiry[] | null>(null)
  const [limit, setLimit] = useState(200)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const response = await fetch(`/api/admin/inquiries?status=${filter}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error()
      const body = (await response.json()) as { data: AdminInquiry[]; limit: number }
      setItems(body.data)
      setLimit(body.limit)
    } catch {
      setItems(null)
      setError('문의 목록을 불러오지 못했습니다.')
    }
  }, [filter])

  useEffect(() => {
    setItems(null)
    void load()
  }, [load])

  const act = async (inquiry: AdminInquiry, action: InquiryAction) => {
    setBusyId(inquiry.id)
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
      setBusyId(null)
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
            onClick={() => setFilter(item.value)}
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
          {items.length >= limit && (
            <p className='text-sm text-muted-foreground'>
              최근 {limit}건만 보입니다. 처리한 문의를 정리하면 나머지가 보입니다.
            </p>
          )}
          {items.map(item => (
            <InquiryCard
              key={item.id}
              inquiry={item}
              busy={busyId === item.id}
              onAction={action => void act(item, action)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

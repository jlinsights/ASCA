'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { AdminEntry } from '@/lib/contests/admin-entries'
import { EntryCard, type EntryDecision } from './_components/entry-card'

const STATUSES = [
  { value: 'unmatched', label: '연결 대기' },
  { value: 'matched', label: '연결됨' },
] as const
type Status = (typeof STATUSES)[number]['value']

// 서버가 돌려주는 코드 → 관리자에게 보일 말
const FAILURES: Record<string, string> = {
  ENTRY_ALREADY_LINKED: '다른 관리자가 먼저 연결했습니다. 목록을 새로 불러왔습니다.',
  ENTRY_NOT_LINKED: '이미 연결이 풀린 출품입니다. 목록을 새로 불러왔습니다.',
  ENTRY_NOT_FOUND: '출품을 찾을 수 없습니다.',
  ARTIST_NOT_FOUND: '작가를 찾을 수 없습니다.',
}

export default function AdminContestEntriesPage() {
  const [status, setStatus] = useState<Status>('unmatched')
  const [year, setYear] = useState('')
  const [entries, setEntries] = useState<AdminEntry[] | null>(null)
  const [limit, setLimit] = useState(100)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const params = new URLSearchParams({ status })
    if (/^\d{4}$/.test(year)) params.set('year', year)
    try {
      const response = await fetch(`/api/admin/contest-entries?${params}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error()
      const body = (await response.json()) as { data: AdminEntry[]; limit: number }
      setEntries(body.data)
      setLimit(body.limit)
    } catch {
      setEntries(null)
      setError('출품 목록을 불러오지 못했습니다.')
    }
  }, [status, year])

  useEffect(() => {
    setEntries(null)
    void load()
  }, [load])

  const decide = async (entry: AdminEntry, decision: EntryDecision) => {
    setBusyId(entry.id)
    setNotice(null)
    try {
      const response = await fetch(`/api/admin/contest-entries/${entry.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { code?: string } | null
        setNotice(FAILURES[body?.code ?? ''] ?? '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      } else {
        const name = entry.entrant_name ?? '출품'
        setNotice(
          decision.action === 'link' ? `${name}: 연결했습니다` : `${name}: 연결을 풀었습니다`
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
        <h1 className='text-2xl font-bold'>출품 작가 연결</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          공모전 출품을 작가 페이지에 잇습니다. 출품 이메일이 회원 로그인 이메일과 같으면 연결하지
          않아도 그 회원의 &lsquo;내 출품&rsquo;에 이미 보이므로, 여기 연결 대기에 있더라도 급하지
          않습니다. 이름·한자가 같은 작가를 후보로 보여 주지만 동명이인일 수 있으니 출품
          이메일·부문으로 확인한 뒤 연결하세요. 연결하면 그 작가 페이지에 이어진 회원 계정이 이
          출품을 보게 됩니다.
        </p>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <div role='tablist' aria-label='연결 상태' className='flex gap-2'>
          {STATUSES.map(item => (
            <Button
              key={item.value}
              role='tab'
              aria-selected={status === item.value}
              variant={status === item.value ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatus(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <label className='ml-auto flex items-center gap-2 text-sm'>
          대회 연도
          <input
            inputMode='numeric'
            maxLength={4}
            placeholder='전체'
            value={year}
            onChange={event => setYear(event.target.value.replace(/\D/g, ''))}
            className='w-20 rounded-md border bg-background px-2 py-1'
          />
        </label>
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
      ) : !entries ? (
        <p className='text-sm text-muted-foreground'>불러오는 중…</p>
      ) : entries.length === 0 ? (
        <p className='text-sm text-muted-foreground'>해당하는 출품이 없습니다.</p>
      ) : (
        <div className='space-y-4'>
          {entries.length >= limit && (
            <p className='text-sm text-muted-foreground'>
              최근 {limit}건만 보입니다. 대회 연도로 좁혀 보세요.
            </p>
          )}
          {entries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              busy={busyId === entry.id}
              onDecide={(target, decision) => void decide(target, decision)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

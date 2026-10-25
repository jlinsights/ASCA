'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ClaimCard, type AdminClaim, type Decision } from './_components/claim-card'

const STATUSES = [
  { value: 'pending', label: '검토 대기' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '반려' },
  { value: 'withdrawn', label: '철회' },
  { value: 'revoked', label: '해제' },
] as const
type Status = (typeof STATUSES)[number]['value']

// 서버가 돌려주는 코드 → 관리자에게 보일 말
const FAILURES: Record<string, string> = {
  ARTIST_ALREADY_LINKED: '이 작가 페이지는 이미 다른 계정과 연결되어 있습니다.',
  CLAIM_NOT_PENDING: '이미 처리된 요청입니다. 목록을 새로 불러왔습니다.',
  ARTIST_REQUIRED: '연결할 작가를 먼저 지정해 주세요.',
  CLAIM_NOT_ALLOWED: '처리할 수 없습니다. 관리자 권한이나 요청 계정 상태를 확인해 주세요.',
  CLAIM_NOT_FOUND: '요청을 찾을 수 없습니다.',
}
const ACTION_DONE: Record<Decision['action'], string> = {
  approve: '승인했습니다',
  reject: '반려했습니다',
  revoke: '연결을 해제했습니다',
}

export default function AdminArtistClaimsPage() {
  const [status, setStatus] = useState<Status>('pending')
  const [claims, setClaims] = useState<AdminClaim[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const response = await fetch(`/api/admin/artist-claims?status=${status}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error()
      const body = (await response.json()) as { data: AdminClaim[] }
      setClaims(body.data)
    } catch {
      setClaims(null)
      setError('요청 목록을 불러오지 못했습니다.')
    }
  }, [status])

  useEffect(() => {
    setClaims(null)
    void load()
  }, [load])

  const decide = async (claim: AdminClaim, decision: Decision) => {
    setBusyId(claim.id)
    setNotice(null)
    try {
      const response = await fetch(`/api/admin/artist-claims/${claim.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { code?: string } | null
        setNotice(FAILURES[body?.code ?? ''] ?? '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      } else {
        setNotice(`${claim.claimed_name}: ${ACTION_DONE[decision.action]}`)
      }
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>작가 페이지 연결</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          회원 계정을 작가 페이지에 잇는 요청입니다. 계정 이메일과 남긴 말로 본인인지 확인한 뒤
          승인하세요. 승인하면 그 계정이 작가 정보와 작품 기록을 고칠 수 있습니다.
        </p>
      </div>

      <div role='tablist' aria-label='요청 상태' className='flex flex-wrap gap-2'>
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
      ) : !claims ? (
        <p className='text-sm text-muted-foreground'>불러오는 중…</p>
      ) : claims.length === 0 ? (
        <p className='text-sm text-muted-foreground'>해당하는 요청이 없습니다.</p>
      ) : (
        <div className='space-y-4'>
          {claims.map(claim => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              busy={busyId === claim.id}
              onDecide={(target, decision) => void decide(target, decision)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

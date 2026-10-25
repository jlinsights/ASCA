'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export interface AdminClaim {
  id: string
  account_id: string
  claimant_email: string | null
  artist_id: string | null
  claimed_name: string
  claimed_name_hanja: string | null
  claimed_art_name: string | null
  note: string
  status: string
  decision_note: string | null
  created_at: string
  reviewed_at: string | null
  artist: {
    id: string
    name: string
    name_zh: string | null
    visibility: string
    membership_type: string | null
  } | null
}

export type ClaimAction = 'approve' | 'reject' | 'revoke'
export interface Decision {
  action: ClaimAction
  artistId?: string
  note?: string
}

interface ArtistOption {
  id: string
  name: string
  name_zh: string | null
  membership_type: string | null
  visibility: string
}

const kst = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

function ArtistLine({ artist }: { artist: AdminClaim['artist'] | ArtistOption }) {
  if (!artist)
    return <span className='text-muted-foreground'>목록에 없음 — 작가 행을 찾아 지정</span>
  return (
    <span>
      {artist.visibility === 'public' ? (
        <Link href={`/artists/${artist.id}`} className='underline' target='_blank'>
          {artist.name}
        </Link>
      ) : (
        artist.name
      )}
      {artist.name_zh && <span className='ml-1 text-muted-foreground'>{artist.name_zh}</span>}
      <span className='ml-2 text-xs text-muted-foreground'>
        {[artist.membership_type, artist.visibility === 'public' ? '공개' : '비공개']
          .filter(Boolean)
          .join(' · ')}
      </span>
    </span>
  )
}

/** "목록에 없음" 요청에 붙일 작가 행 찾기 — 관리자 목록 API 라 비공개 작가도 나온다 */
function ArtistPicker({ onPick }: { onPick: (artist: ArtistOption) => void }) {
  const [term, setTerm] = useState('')
  const [options, setOptions] = useState<ArtistOption[] | null>(null)
  async function search() {
    if (!term.trim()) return
    const response = await fetch(`/api/admin/artists?${new URLSearchParams({ q: term.trim() })}`, {
      credentials: 'include',
    }).catch(() => null)
    const body = response?.ok
      ? ((await response.json().catch(() => null)) as { artists?: ArtistOption[] } | null)
      : null
    setOptions(body?.artists ?? [])
  }
  return (
    <div className='space-y-2'>
      <div className='flex gap-2'>
        <Input
          aria-label='연결할 작가 검색'
          placeholder='이름(한글·한자·영문)'
          value={term}
          onChange={event => setTerm(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void search()
            }
          }}
          className='w-56'
        />
        <Button type='button' variant='outline' size='sm' onClick={() => void search()}>
          검색
        </Button>
      </div>
      {options?.length === 0 && <p className='text-sm text-muted-foreground'>결과가 없습니다.</p>}
      {!!options?.length && (
        <ul className='divide-y rounded-md border text-sm'>
          {options.slice(0, 10).map(option => (
            <li key={option.id} className='flex items-center justify-between gap-2 px-3 py-2'>
              <ArtistLine artist={option} />
              <Button type='button' size='sm' variant='outline' onClick={() => onPick(option)}>
                지정
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ClaimCard({
  claim,
  busy,
  onDecide,
}: {
  claim: AdminClaim
  busy: boolean
  onDecide: (claim: AdminClaim, decision: Decision) => void
}) {
  const [note, setNote] = useState('')
  const [target, setTarget] = useState<ArtistOption | null>(null)
  const names = [claim.claimed_name_hanja, claim.claimed_art_name].filter(Boolean).join(' · ')
  const decide = (action: ClaimAction) =>
    onDecide(claim, { action, artistId: target?.id, note: note.trim() || undefined })

  return (
    <article
      className='space-y-3 rounded-lg border p-4'
      aria-label={`${claim.claimed_name} 연결 요청`}
    >
      <header className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 className='text-lg font-semibold'>
          {claim.claimed_name}
          {names && <span className='ml-2 text-sm font-normal text-muted-foreground'>{names}</span>}
        </h2>
        <time className='text-xs text-muted-foreground' dateTime={claim.created_at}>
          {kst(claim.created_at)}
        </time>
      </header>
      <dl className='grid gap-1 text-sm sm:grid-cols-[7rem_1fr]'>
        <dt className='text-muted-foreground'>계정</dt>
        <dd>{claim.claimant_email ?? '(이메일 확인 불가)'}</dd>
        <dt className='text-muted-foreground'>요청한 페이지</dt>
        <dd>
          <ArtistLine artist={claim.artist} />
        </dd>
        {claim.note && (
          <>
            <dt className='text-muted-foreground'>남긴 말</dt>
            <dd className='whitespace-pre-line'>{claim.note}</dd>
          </>
        )}
        {claim.decision_note && (
          <>
            <dt className='text-muted-foreground'>검토 메모</dt>
            <dd className='whitespace-pre-line'>{claim.decision_note}</dd>
          </>
        )}
      </dl>

      {claim.status === 'pending' && (
        <div className='space-y-3 border-t pt-3'>
          {!claim.artist_id &&
            (target ? (
              <p className='text-sm'>
                연결할 작가: <ArtistLine artist={target} />{' '}
                <Button variant='link' size='sm' onClick={() => setTarget(null)}>
                  다시 고르기
                </Button>
              </p>
            ) : (
              <ArtistPicker onPick={setTarget} />
            ))}
          <Textarea
            aria-label={`${claim.claimed_name} 검토 메모`}
            placeholder='검토 메모 (반려 사유는 요청자에게 보입니다)'
            maxLength={1000}
            rows={2}
            value={note}
            onChange={event => setNote(event.target.value)}
          />
          <div className='flex gap-2'>
            <Button
              disabled={busy || (!claim.artist_id && !target)}
              onClick={() => decide('approve')}
            >
              승인
            </Button>
            <Button variant='outline' disabled={busy} onClick={() => decide('reject')}>
              반려
            </Button>
          </div>
        </div>
      )}
      {claim.status === 'approved' && (
        <div className='flex flex-wrap items-center gap-2 border-t pt-3'>
          <Input
            aria-label={`${claim.claimed_name} 해제 사유`}
            placeholder='해제 사유'
            value={note}
            maxLength={1000}
            onChange={event => setNote(event.target.value)}
            className='w-64'
          />
          <Button variant='destructive' disabled={busy} onClick={() => decide('revoke')}>
            연결 해제
          </Button>
        </div>
      )}
    </article>
  )
}

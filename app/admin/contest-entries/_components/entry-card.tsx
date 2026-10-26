'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AdminEntry, EntryArtist, MatchReason } from '@/lib/contests/admin-entries'

export type EntryDecision = { action: 'link'; artistId: string } | { action: 'unlink' }

const REASONS: Record<MatchReason, string> = {
  both: '이름·한자 일치',
  hanja: '한자 일치',
  name: '이름 일치',
}
const FEE: Record<string, string> = {
  confirmed: '출품비 확인',
  pending: '출품비 확인 중',
  withdrawn: '취소',
}
const RESULT: Record<string, string> = {
  pending: '심사 중',
  not_selected: '미선정',
  withdrawn: '취소',
}

const kst = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

function ArtistLine({ artist }: { artist: EntryArtist }) {
  const isPublic = artist.visibility === 'public'
  return (
    <span>
      {isPublic ? (
        <Link href={`/artists/${artist.id}`} className='underline' target='_blank'>
          {artist.name}
        </Link>
      ) : (
        artist.name
      )}
      {artist.name_zh && <span className='ml-1 text-muted-foreground'>{artist.name_zh}</span>}
      <span className='ml-2 text-xs text-muted-foreground'>
        {[artist.membership_type, isPublic ? '공개' : '비공개'].filter(Boolean).join(' · ')}
      </span>
    </span>
  )
}

/** 후보에 없는 작가 찾기 — 관리자 작가 목록 API 라 비공개 작가도 나온다 */
function ArtistPicker({ onPick, busy }: { onPick: (artist: EntryArtist) => void; busy: boolean }) {
  const [term, setTerm] = useState('')
  const [options, setOptions] = useState<EntryArtist[] | null>(null)
  async function search() {
    if (!term.trim()) return
    const response = await fetch(`/api/admin/artists?${new URLSearchParams({ q: term.trim() })}`, {
      credentials: 'include',
    }).catch(() => null)
    const body = response?.ok
      ? ((await response.json().catch(() => null)) as { artists?: EntryArtist[] } | null)
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
              <Button
                type='button'
                size='sm'
                variant='outline'
                disabled={busy}
                onClick={() => onPick(option)}
              >
                이 작가로 연결
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function EntryCard({
  entry,
  busy,
  onDecide,
}: {
  entry: AdminEntry
  busy: boolean
  onDecide: (entry: AdminEntry, decision: EntryDecision) => void
}) {
  const [confirmUnlink, setConfirmUnlink] = useState(false)
  const status = [
    FEE[entry.fee_status],
    entry.result_status === 'awarded' ? (entry.result_raw ?? '수상') : RESULT[entry.result_status],
  ].filter(Boolean)
  const link = (artist: EntryArtist) => onDecide(entry, { action: 'link', artistId: artist.id })

  return (
    <article className='space-y-4 rounded-lg border p-4' aria-labelledby={`entry-${entry.id}`}>
      <header className='space-y-1'>
        <p className='text-xs text-muted-foreground'>
          {entry.contest_year} · {entry.contest_name}
          {status.length > 0 && ` · ${status.join(' · ')}`}
        </p>
        <h2 id={`entry-${entry.id}`} className='text-lg font-semibold'>
          {entry.entrant_name ?? '이름 없음'}
          {entry.entrant_name_hanja && (
            <span className='ml-2 font-normal text-muted-foreground'>
              {entry.entrant_name_hanja}
            </span>
          )}
        </h2>
        <p className='text-sm text-muted-foreground'>
          {[entry.title && `「${entry.title}」`, entry.division, entry.script_style]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {entry.entrant_email && <p className='text-sm'>출품 이메일: {entry.entrant_email}</p>}
      </header>

      {entry.artist_id ? (
        <div className='space-y-2 text-sm'>
          <p>
            연결된 작가:{' '}
            {entry.artist ? (
              <ArtistLine artist={entry.artist} />
            ) : (
              <span className='text-muted-foreground'>작가 행을 찾을 수 없음</span>
            )}
          </p>
          {entry.matched_at && (
            <p className='text-xs text-muted-foreground'>연결 {kst(entry.matched_at)}</p>
          )}
          {confirmUnlink ? (
            <div className='flex flex-wrap items-center gap-2'>
              <span>회원의 &lsquo;내 출품&rsquo;에서 이 출품이 빠집니다.</span>
              <Button
                type='button'
                size='sm'
                variant='destructive'
                disabled={busy}
                onClick={() => onDecide(entry, { action: 'unlink' })}
              >
                해제 확인
              </Button>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => setConfirmUnlink(false)}
              >
                취소
              </Button>
            </div>
          ) : (
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => setConfirmUnlink(true)}
            >
              연결 해제
            </Button>
          )}
        </div>
      ) : (
        <div className='space-y-3 text-sm'>
          {entry.candidates.length > 0 ? (
            <ul className='divide-y rounded-md border' aria-label='후보 작가'>
              {entry.candidates.map(candidate => (
                <li
                  key={candidate.id}
                  className='flex items-center justify-between gap-2 px-3 py-2'
                >
                  <span>
                    <ArtistLine artist={candidate} />
                    <span className='ml-2 rounded bg-muted px-1.5 py-0.5 text-xs'>
                      {REASONS[candidate.reason]}
                    </span>
                  </span>
                  <Button type='button' size='sm' disabled={busy} onClick={() => link(candidate)}>
                    이 작가로 연결
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-muted-foreground'>
              이름·한자가 같은 작가가 없습니다. 직접 찾아 주세요.
            </p>
          )}
          <ArtistPicker onPick={link} busy={busy} />
        </div>
      )}
    </article>
  )
}

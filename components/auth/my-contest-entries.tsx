'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import type { MemberEntry } from '@/lib/contests/member-entries'

const ENTRIES_URL = '/api/profile/contest-entries'

const FEE_LABELS: Partial<Record<MemberEntry['fee_status'], string>> = {
  confirmed: 'entriesFeeConfirmed',
  pending: 'entriesFeePending',
  withdrawn: 'entriesFeeWithdrawn',
}
const RESULT_LABELS: Partial<Record<MemberEntry['result_status'], string>> = {
  awarded: 'entriesResultAwarded',
  pending: 'entriesResultPending',
  not_selected: 'entriesResultNotSelected',
  withdrawn: 'entriesResultWithdrawn',
}

/** 수상이면 사무국이 적은 상 이름(특선·입선 등)을 그대로, 아니면 정해진 말로. 모르는 값은 숨긴다 */
function resultLabel(entry: MemberEntry, t: (key: string) => string): string | null {
  if (entry.result_status === 'awarded' && entry.result_raw) return entry.result_raw
  const key = RESULT_LABELS[entry.result_status]
  return key ? t(key) : null
}

/** 출품비 상태 — 출품 자체가 취소되었으면 결과 쪽 "취소" 하나만 보인다 */
function feeLabel(entry: MemberEntry, t: (key: string) => string): string | null {
  if (entry.result_status === 'withdrawn') return null
  const key = FEE_LABELS[entry.fee_status]
  return key ? t(key) : null
}

/** 내 작가 공간의 "내 출품" — 확인된 이메일 또는 사무국이 이어 준 출품을 보여 준다 */
export function MyContestEntries() {
  const { t } = useLanguage()
  const [entries, setEntries] = useState<MemberEntry[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    fetch(ENTRIES_URL, { credentials: 'include' })
      .then(async response => {
        if (!response.ok) throw new Error()
        const body = (await response.json()) as { data?: MemberEntry[] }
        if (active) setEntries(body.data ?? [])
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section aria-labelledby='my-entries-title' className='space-y-4 border-t pt-6'>
      <h2 id='my-entries-title' className='font-serif text-xl'>
        {t('entriesTitle')}
      </h2>
      {failed ? (
        <p role='alert' className='text-destructive'>
          {t('entriesError')}
        </p>
      ) : !entries ? (
        <p className='text-sm text-muted-foreground'>{t('entriesLoading')}</p>
      ) : entries.length === 0 ? (
        <div className='space-y-1'>
          <p>{t('entriesEmpty')}</p>
          <p className='text-sm text-muted-foreground'>{t('entriesEmptyHint')}</p>
        </div>
      ) : (
        <ul className='divide-y rounded-md border'>
          {entries.map(entry => (
            <EntryRow key={entry.id} entry={entry} t={t} />
          ))}
        </ul>
      )}
    </section>
  )
}

function EntryRow({ entry, t }: { entry: MemberEntry; t: (key: string) => string }) {
  const detail = [entry.division, entry.script_style].filter(Boolean).join(' · ')
  const fee = feeLabel(entry, t)
  const result = resultLabel(entry, t)
  return (
    <li className='space-y-1 px-4 py-3'>
      <p className='text-sm text-muted-foreground'>
        <span className='tabular-nums'>{entry.contest_year}</span> <span>{entry.contest_name}</span>
      </p>
      <p className='font-serif text-lg'>{entry.title || t('entriesUntitled')}</p>
      {detail && <p className='text-sm'>{detail}</p>}
      {(fee || result) && (
        <p className='flex flex-wrap gap-2 text-sm'>
          {fee && <span className='rounded bg-muted px-2 py-0.5'>{fee}</span>}
          {result && (
            <span
              className={
                entry.result_status === 'awarded'
                  ? 'rounded bg-primary px-2 py-0.5 text-primary-foreground'
                  : 'rounded border px-2 py-0.5'
              }
            >
              {result}
            </span>
          )}
        </p>
      )}
    </li>
  )
}

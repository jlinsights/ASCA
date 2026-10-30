'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  GRADE_LABELS,
  REVIEW_NOTE_MAX,
  ROUTE_LABELS,
  STATUS_LABELS,
  TRACK_LABELS,
  labelOf,
  type AdminApplication,
  type ApplicationStatus,
} from '@/lib/applications/admin-applications'

export interface ReviewChange {
  to: ApplicationStatus
  note?: string
}

/** 지금 상태에서 누를 수 있는 다음 상태 — 끝난 신청도 되돌릴 수 있게 '다시 심사' 를 둔다 */
const NEXT: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  received: ['reviewing', 'rejected', 'withdrawn'],
  reviewing: ['approved', 'rejected', 'withdrawn'],
  approved: ['reviewing'],
  rejected: ['reviewing'],
  withdrawn: ['reviewing'],
}
const ACTION_LABELS: Record<ApplicationStatus, string> = {
  received: '접수로',
  reviewing: '심사 시작',
  approved: '승인',
  rejected: '반려',
  withdrawn: '철회 처리',
}
/** 되돌리기 어려운 결정은 한 번 더 확인한다 */
const CONFIRM: readonly ApplicationStatus[] = ['approved', 'rejected', 'withdrawn']

const kst = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className='whitespace-pre-wrap text-sm'>{value}</dd>
    </div>
  )
}

interface ApplicationCardProps {
  application: AdminApplication
  busy: boolean
  onReview: (application: AdminApplication, change: ReviewChange) => void
}

export function ApplicationCard({ application, busy, onReview }: ApplicationCardProps) {
  const [note, setNote] = useState(application.review_note ?? '')
  const [pending, setPending] = useState<ApplicationStatus | null>(null)
  const noteChanged = note.trim() !== (application.review_note ?? '').trim()
  // 메모를 고쳤으면 상태 변경과 함께 보낸다
  const change = (to: ApplicationStatus): ReviewChange => (noteChanged ? { to, note } : { to })

  const press = (to: ApplicationStatus) => {
    if (CONFIRM.includes(to)) setPending(to)
    else onReview(application, change(to))
  }

  const grade = labelOf(application.requested_grade, application.requested_grade_raw, GRADE_LABELS)
  const track = labelOf(application.track, application.track_raw, TRACK_LABELS)
  const route = labelOf(application.route, application.route_raw, ROUTE_LABELS)
  const names = [application.applicant_name_hanja, application.applicant_name_en]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className='space-y-4 rounded-lg border p-4' aria-labelledby={`app-${application.id}`}>
      <header className='space-y-1'>
        <p className='text-xs text-muted-foreground'>
          {STATUS_LABELS[application.status]} · 신청 {kst(application.submitted_at)}
          {application.reviewed_at && ` · 처리 ${kst(application.reviewed_at)}`}
        </p>
        <h2 id={`app-${application.id}`} className='text-lg font-semibold'>
          {application.applicant_name ?? '이름 없음'}
          {names && <span className='ml-2 font-normal text-muted-foreground'>{names}</span>}
          {application.pen_name && (
            <span className='ml-2 text-sm font-normal text-muted-foreground'>
              (아호 {application.pen_name})
            </span>
          )}
        </h2>
        <p className='text-sm'>
          {[grade ?? '자격 미확인', track, route].filter(Boolean).join(' · ')}
        </p>
        {application.applicant_email && (
          <p className='text-sm'>이메일: {application.applicant_email}</p>
        )}
      </header>

      <dl className='grid gap-3 sm:grid-cols-2'>
        <Field label='세부 분야' value={application.genres.join(', ') || null} />
        <Field label='회원 현황' value={application.membership_raw} />
        <Field label='특별선임 사유' value={application.special_basis_raw} />
        <Field label='수상·출품 실적' value={application.awards_text} />
      </dl>

      <div className='space-y-2'>
        <label className='block text-sm font-medium' htmlFor={`note-${application.id}`}>
          심사 메모
        </label>
        <Textarea
          id={`note-${application.id}`}
          value={note}
          maxLength={REVIEW_NOTE_MAX}
          rows={3}
          onChange={event => setNote(event.target.value)}
          placeholder='점수 확인·서류 보완 요청·이사회 의결 일자 등'
        />
      </div>

      {pending ? (
        <div className='flex flex-wrap items-center gap-2 text-sm'>
          <span>
            &lsquo;{STATUS_LABELS[pending]}&rsquo;(으)로 바꿉니다. 작가 행은 따로 만들어야 합니다.
          </span>
          <Button
            type='button'
            size='sm'
            variant={pending === 'approved' ? 'default' : 'destructive'}
            disabled={busy}
            onClick={() => onReview(application, change(pending))}
          >
            {ACTION_LABELS[pending]} 확인
          </Button>
          <Button type='button' size='sm' variant='outline' onClick={() => setPending(null)}>
            취소
          </Button>
        </div>
      ) : (
        <div className='flex flex-wrap gap-2'>
          {NEXT[application.status].map(to => (
            <Button
              key={to}
              type='button'
              size='sm'
              variant={to === 'approved' || to === 'reviewing' ? 'default' : 'outline'}
              disabled={busy}
              onClick={() => press(to)}
            >
              {application.status !== 'received' && to === 'reviewing'
                ? '다시 심사'
                : ACTION_LABELS[to]}
            </Button>
          ))}
          {noteChanged && (
            <Button
              type='button'
              size='sm'
              variant='outline'
              disabled={busy}
              onClick={() => onReview(application, { to: application.status, note })}
            >
              메모만 저장
            </Button>
          )}
        </div>
      )}
    </article>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { AdminInquiry, InquiryStatus } from '@/lib/inquiries/schema'
import { findInquiryTopic } from '@/app/contact/_components/inquiry-data'

export type InquiryAction =
  | { kind: 'status'; status: InquiryStatus; note?: string }
  | { kind: 'delete' }

const LANGUAGE_LABEL: Record<AdminInquiry['language'], string> = {
  ko: '한국어',
  en: '영어',
  ja: '일본어',
  zh: '중국어',
}

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: '새 문의',
  answered: '답함',
  closed: '종결',
}

const when = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(new Date(iso))

interface InquiryCardProps {
  inquiry: AdminInquiry
  busy: boolean
  onAction: (action: InquiryAction) => void
}

/** 문의 한 건 — 연락처로 바로 답하고, 상태를 옮기고, 필요하면 지운다 */
export function InquiryCard({ inquiry, busy, onAction }: InquiryCardProps) {
  const [note, setNote] = useState(inquiry.staff_note ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const topic = findInquiryTopic(inquiry.topic)?.label ?? inquiry.topic
  // 답장은 문의한 사람에게 — 협회 대표 메일로 가는 mailto() 도우미를 쓰지 않는다
  const subject = `Re: [문의] ${topic}${inquiry.subject ? ` — ${inquiry.subject}` : ''}`
  const replyHref = inquiry.email
    ? `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}`
    : null
  const move = (status: InquiryStatus) =>
    onAction({
      kind: 'status',
      status,
      note: note.trim() === (inquiry.staff_note ?? '') ? undefined : note,
    })

  return (
    <article
      aria-labelledby={`inquiry-${inquiry.id}`}
      className='space-y-4 rounded-lg border bg-card p-5'
    >
      <header className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 id={`inquiry-${inquiry.id}`} className='text-lg font-semibold'>
          {topic} · {inquiry.name}
        </h2>
        <p className='text-sm text-muted-foreground'>
          {when(inquiry.created_at)} · {LANGUAGE_LABEL[inquiry.language]} ·{' '}
          {STATUS_LABEL[inquiry.status]}
        </p>
      </header>

      <dl className='grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[8rem_1fr]'>
        {inquiry.email && (
          <>
            <dt className='text-muted-foreground'>이메일</dt>
            <dd>
              <a className='underline underline-offset-4' href={replyHref ?? undefined}>
                {inquiry.email}
              </a>
            </dd>
          </>
        )}
        {inquiry.phone && (
          <>
            <dt className='text-muted-foreground'>전화</dt>
            <dd>
              <a className='underline underline-offset-4' href={`tel:${inquiry.phone}`}>
                {inquiry.phone}
              </a>
            </dd>
          </>
        )}
        {inquiry.subject && (
          <>
            <dt className='text-muted-foreground'>관련 작품·작가</dt>
            <dd>{inquiry.subject}</dd>
          </>
        )}
        {inquiry.plan && (
          <>
            <dt className='text-muted-foreground'>예산·일정</dt>
            <dd>{inquiry.plan}</dd>
          </>
        )}
      </dl>

      <p className='whitespace-pre-line rounded-md bg-muted/50 p-4 text-sm leading-relaxed'>
        {inquiry.message}
      </p>

      <label className='grid gap-1 text-sm'>
        <span className='text-muted-foreground'>사무국 메모 (방문자에게 보이지 않음)</span>
        <textarea
          value={note}
          maxLength={2000}
          rows={2}
          onChange={event => setNote(event.target.value)}
          className='rounded-md border bg-background px-3 py-2'
        />
      </label>

      <div className='flex flex-wrap gap-2'>
        {replyHref && (
          <Button asChild size='sm'>
            <a href={replyHref}>메일로 답하기</a>
          </Button>
        )}
        {(['new', 'answered', 'closed'] as const)
          .filter(status => status !== inquiry.status)
          .map(status => (
            <Button
              key={status}
              size='sm'
              variant='outline'
              disabled={busy}
              onClick={() => move(status)}
            >
              {STATUS_LABEL[status]}으로
            </Button>
          ))}
        {confirmDelete ? (
          <>
            <Button
              size='sm'
              variant='destructive'
              disabled={busy}
              onClick={() => onAction({ kind: 'delete' })}
            >
              정말 삭제
            </Button>
            <Button size='sm' variant='ghost' onClick={() => setConfirmDelete(false)}>
              취소
            </Button>
          </>
        ) : (
          <Button size='sm' variant='ghost' disabled={busy} onClick={() => setConfirmDelete(true)}>
            삭제
          </Button>
        )}
      </div>
    </article>
  )
}

'use client'
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import type { Work } from '@/lib/archive/queries'
import type { ReviewOperation } from '@/lib/archive/review'

type History = Pick<ReviewOperation, 'id' | 'action' | 'state' | 'reason'>
export function ReviewDetail({
  work,
  previews,
  history,
  open,
}: {
  work: Work & {
    status: string | null
    updated_at: string | null
    artists: { name: string; visibility: string }
  }
  previews: { id: string; url: string }[]
  history: History[]
  open?: History
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const [reason, setReason] = useState(open?.reason || '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [request, setRequest] = useState<{ id: string; action: ReviewOperation['action'] } | null>(
    open ? { id: open.id, action: open.action } : null
  )
  const [confirmed, setConfirmed] = useState(false)
  const [done, setDone] = useState(false)
  async function act(action: ReviewOperation['action']) {
    if (busy || done || !confirmed) return
    if (action !== 'publish' && !reason.trim()) {
      setMessage('arReviewReasonRequired')
      return
    }
    const operation = request || { id: crypto.randomUUID(), action }
    setRequest(operation)
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`/api/admin/archive/reviews/${work.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operationId: operation.id,
          action: operation.action,
          reason,
          expectedUpdatedAt: work.updated_at,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setMessage(
          data.code === 'BUSY'
            ? 'arReviewBusy'
            : response.status === 409
              ? 'arReviewConflict'
              : 'arReviewFailed'
        )
        return
      }
      setDone(true)
      setMessage('arReviewDone')
      router.push('/admin/archive/reviews')
      router.refresh()
    } catch {
      setMessage('arReviewFailed')
    } finally {
      setBusy(false)
    }
  }
  const fields = [
    ['arTitleHanja', work.title_hanja],
    ['arTitleEn', work.title_en],
    ['arStyle', work.style],
    ['arYear', work.year_created],
    ['arWidth', work.width_cm],
    ['arHeight', work.height_cm],
    ['arMaterials', work.materials?.join(', ')],
    ['arTranscription', work.transcription],
    ['arInterpretation', work.interpretation],
    ['arInterpretationEn', work.interpretation_en],
    ['arSource', work.source_text],
    ['arSeal', work.seal_description],
  ] as const
  const actions: ReviewOperation['action'][] = request
    ? [request.action]
    : work.status === 'published'
      ? ['unpublish']
      : ['publish', 'return']
  return (
    <article>
      <Link href='/admin/archive/reviews' className='underline'>
        {t('arReviewBack')}
      </Link>
      <header className='my-8'>
        <p className='text-muted-foreground mb-4'>{work.artists.name}</p>
        <h1 className='font-serif text-4xl break-words'>{work.title}</h1>
      </header>
      <p className='text-sm text-muted-foreground mb-6'>{t('arReviewPreviewHint')}</p>
      <div className='grid md:grid-cols-2 gap-6 mb-8'>
        {previews.map((image, index) => (
          <img
            key={image.id}
            src={image.url}
            alt={`${work.title} ${index + 1}`}
            referrerPolicy='no-referrer'
            className='w-full h-96 object-contain bg-muted p-4'
          />
        ))}
      </div>
      <dl className='grid md:grid-cols-2 gap-6 mb-12'>
        {fields
          .filter(([, value]) => value !== null && value !== '')
          .map(([key, value]) => (
            <div key={key}>
              <dt className='text-sm text-muted-foreground mb-2'>{t(key)}</dt>
              <dd className='whitespace-pre-wrap break-words'>{value}</dd>
            </div>
          ))}
      </dl>
      <section className='border border-border rounded-lg p-6 bg-card'>
        <h2 className='font-serif text-2xl mb-4'>{t('arReviewTitle')}</h2>
        <p className='text-sm text-muted-foreground mb-6'>{t('arReviewSeparate')}</p>
        {work.artists.visibility !== 'public' && (
          <p className='mb-6'>{t('arReviewArtistPrivate')}</p>
        )}
        {open && (
          <p role='status' className='mb-6'>
            {t('arReviewRetryHint')}
          </p>
        )}
        <label className='block text-sm'>
          {t('arReviewReason')}
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            maxLength={2000}
            rows={4}
            disabled={busy || done || !!request}
            className='block w-full mt-2 rounded-md border border-input bg-background p-3'
          />
        </label>
        <label className='flex gap-3 items-start my-6 text-sm'>
          <input
            type='checkbox'
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            disabled={busy || done}
          />
          <span>{t('arReviewConfirm')}</span>
        </label>
        <div className='flex flex-wrap gap-4'>
          {actions.map(action => (
            <button
              key={action}
              type='button'
              disabled={
                busy ||
                done ||
                !confirmed ||
                (action === 'publish' && work.artists.visibility !== 'public')
              }
              onClick={() => void act(action)}
              className='bg-primary text-primary-foreground rounded-md px-6 py-3 text-sm disabled:opacity-50'
            >
              {busy
                ? t('arSaving')
                : t(
                    action === 'publish'
                      ? 'arReviewPublish'
                      : action === 'return'
                        ? 'arReviewReturn'
                        : 'arReviewUnpublish'
                  )}
            </button>
          ))}
        </div>
        {message && (
          <p role={done ? 'status' : 'alert'} className='mt-6'>
            {t(message)}
          </p>
        )}
      </section>
      <section className='mt-12'>
        <h2 className='font-serif text-2xl mb-6'>{t('arReviewHistory')}</h2>
        <ul className='space-y-4'>
          {history.map(item => (
            <li key={item.id} className='border-b border-border pb-4'>
              <p>
                {t(
                  item.action === 'publish'
                    ? 'arReviewPublish'
                    : item.action === 'return'
                      ? 'arReviewReturn'
                      : 'arReviewUnpublish'
                )}
                {' · '}
                {t(item.state === 'completed' ? 'arReviewDone' : 'arReviewRetryHint')}
              </p>
              {item.reason && <p className='mt-2 whitespace-pre-wrap break-words'>{item.reason}</p>}
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BODY_MAX, TITLE_MAX } from '@/lib/community/threads'
import '../_components/board.css'

const ERROR_KEYS: Record<string, string> = {
  INVALID_THREAD_FIELDS: 'boardErrorFields',
  THREAD_NOT_FOUND: 'boardEditGone',
  DISPLAY_NAME_REQUIRED: 'boardNeedName',
  RATE_LIMITED: 'boardErrorRate',
}

interface ComposeFormProps {
  hasDisplayName: boolean
  /** 내 글 고치기 — 있으면 그 글을 PATCH 하고, 없으면 새 글을 올린다 */
  editing?: { id: string; title: string; body: string }
}

/** 새 글·내 글 고치기 — 평문 제목·본문만. 저장하면 그 글로 간다 */
export function ComposeForm({ hasDisplayName, editing }: ComposeFormProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [title, setTitle] = useState(editing?.title ?? '')
  const [body, setBody] = useState(editing?.body ?? '')
  const backHref = editing ? `/community/board/${editing.id}` : '/community/board'
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setFailed(null)
    try {
      const response = await fetch(
        editing ? `/api/community/threads/${editing.id}` : '/api/community/threads',
        {
          method: editing ? 'PATCH' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body }),
        }
      )
      const payload = (await response.json().catch(() => null)) as {
        code?: string
        data?: { id: string }
      } | null
      if (!response.ok || !payload?.data) {
        const code = response.status === 429 ? 'RATE_LIMITED' : payload?.code
        setFailed(ERROR_KEYS[code ?? ''] ?? 'boardErrorGeneric')
        return
      }
      router.push(`/community/board/${payload.data.id}`)
      if (editing) router.refresh()
    } catch {
      setFailed('boardErrorGeneric')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='cb'>
      <div className='cb__frame'>
        <section className='cb-thread' aria-labelledby='cb-compose-title'>
          <Link href={backHref} className='cb-back'>
            ← {t(editing ? 'boardBackToThread' : 'boardBack')}
          </Link>
          <h1 id='cb-compose-title' className='cb-thread__title mb-8'>
            {t(editing ? 'boardEditTitle' : 'boardComposeTitle')}
          </h1>
          {!hasDisplayName ? (
            <div className='cb-panel cb-panel--flush'>
              <p className='m-0'>{t('boardNeedName')}</p>
              <div>
                <Button asChild>
                  <Link href='/profile'>{t('boardGoProfile')}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form className='cb-form' onSubmit={submit}>
              <p className='cb-form__hint'>{t('boardPublicNote')}</p>
              <div className='cb-form__field'>
                <label htmlFor='cb-title' className='cb-form__label'>
                  <span>{t('boardFieldTitle')}</span>
                  <span className='cb-form__count' aria-hidden='true'>
                    {title.length}/{TITLE_MAX}
                  </span>
                </label>
                <Input
                  id='cb-title'
                  value={title}
                  maxLength={TITLE_MAX}
                  required
                  onChange={event => setTitle(event.target.value)}
                />
              </div>
              <div className='cb-form__field'>
                <label htmlFor='cb-body' className='cb-form__label'>
                  <span>{t('boardFieldBody')}</span>
                  <span className='cb-form__count' aria-hidden='true'>
                    {body.length}/{BODY_MAX}
                  </span>
                </label>
                <Textarea
                  id='cb-body'
                  value={body}
                  maxLength={BODY_MAX}
                  rows={12}
                  required
                  aria-describedby='cb-body-hint'
                  onChange={event => setBody(event.target.value)}
                />
                <p id='cb-body-hint' className='cb-form__hint'>
                  {t('boardFieldBodyHint')}
                </p>
              </div>
              {failed && (
                <p role='alert' className='m-0 text-destructive'>
                  {t(failed)}
                </p>
              )}
              <div className='cb-form__actions'>
                <Button type='submit' disabled={busy || !title.trim() || !body.trim()}>
                  {t(busy ? 'boardSubmitting' : editing ? 'boardSave' : 'boardSubmit')}
                </Button>
                <Button asChild variant='outline'>
                  <Link href={backHref}>{t('boardCancel')}</Link>
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

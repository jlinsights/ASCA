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
  DISPLAY_NAME_REQUIRED: 'boardNeedName',
  RATE_LIMITED: 'boardErrorRate',
}

/** 새 글 — 평문 제목·본문만. 올리면 그 글로 간다 */
export function ComposeForm({ hasDisplayName }: { hasDisplayName: boolean }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setFailed(null)
    try {
      const response = await fetch('/api/community/threads', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      })
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
          <Link href='/community/board' className='cb-back'>
            ← {t('boardBack')}
          </Link>
          <h1 id='cb-compose-title' className='cb-thread__title mb-8'>
            {t('boardComposeTitle')}
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
                  {t(busy ? 'boardSubmitting' : 'boardSubmit')}
                </Button>
                <Button asChild variant='outline'>
                  <Link href='/community/board'>{t('boardCancel')}</Link>
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { submissionSchema, MAX_IMAGE_BYTES, MAX_IMAGES } from '@/lib/archive/submission'
import type { Submission } from '@/lib/archive/submission'
const fieldClass = 'mt-2 w-full rounded-md border border-input bg-background p-3'
export function SubmissionForm({
  artists,
  access,
  draft,
}: {
  artists: { id: string; name: string }[]
  access: 'login' | 'unclaimed' | 'ready'
  draft?: { id: string; updatedAt: string | null; values: Submission }
}) {
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState<'draft' | 'pending_review' | null>(null)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [files])
  if (access !== 'ready')
    return (
      <div className='max-w-xl py-12'>
        <h1 className='font-serif text-4xl mb-6'>{t('arSubmit')}</h1>
        <p className='text-muted-foreground leading-loose mb-8'>
          {t(access === 'login' ? 'arLoginHint' : 'arClaimHint')}
        </p>
        <Link
          href={access === 'login' ? '/sign-in?redirect_url=%2Farchive%2Fsubmit' : '/contact'}
          className='bg-primary text-primary-foreground px-6 py-3 rounded-md'
        >
          {t(access === 'login' ? 'signIn' : 'arContact')}
        </Link>
      </div>
    )
  const input = (name: string, label: string, type = 'text', required = false) => (
    <label className='text-sm block'>
      {t(label)}
      {required ? ' *' : ''}
      <input
        name={name}
        type={type}
        required={required}
        maxLength={type === 'text' ? 300 : undefined}
        min={type === 'number' ? 1 : undefined}
        step={name === 'year' ? 1 : type === 'number' ? 'any' : undefined}
        className={fieldClass}
        defaultValue={draft?.values[name as keyof Submission]}
      />
    </label>
  )
  const area = (name: string, label: string) => (
    <label className='text-sm block'>
      {t(label)}
      <textarea
        name={name}
        maxLength={10000}
        rows={4}
        className={fieldClass}
        defaultValue={draft?.values[name as keyof Submission]}
      />
    </label>
  )
  async function save(status: 'draft' | 'pending_review') {
    if (!ref.current || busy || saved) return
    setMessage('')
    const raw = Object.fromEntries(new FormData(ref.current))
    const parsed = submissionSchema.safeParse({ ...raw, status })
    if (!parsed.success) {
      setMessage('arRequired')
      setStep(1)
      return
    }
    if (!draft && !files.length) {
      setMessage('arImageRequired')
      setStep(0)
      return
    }
    if (
      files.length > MAX_IMAGES ||
      files.reduce((sum, file) => sum + file.size, 0) > MAX_IMAGE_BYTES
    ) {
      setMessage('arImageLimit')
      setStep(0)
      return
    }
    const body = new FormData()
    body.set('data', JSON.stringify(parsed.data))
    files.forEach(file => body.append('images', file))
    setBusy(true)
    try {
      const { artistId, recordTitle, organizer, contestRef, ...values } = parsed.data
      const response = await fetch(
        draft ? `/api/archive/drafts/${draft.id}` : '/api/archive/submissions',
        draft
          ? {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...values, expectedUpdatedAt: draft.updatedAt }),
            }
          : { method: 'POST', body }
      )
      const data = await response.json()
      if (!response.ok) {
        setMessage(
          data.code === 'CONFLICT'
            ? 'arDraftConflict'
            : data.code === 'OWNER_REQUIRED'
              ? 'arClaimHint'
              : data.code === 'AUTH_REQUIRED'
                ? 'arLoginHint'
                : 'arSaveFailed'
        )
        return
      }
      setSaved(status)
      setFiles([])
    } catch {
      setMessage('arSaveFailed')
    } finally {
      setBusy(false)
    }
  }
  const steps = ['arPhotoStep', 'arInfoStep', 'arReadingStep', 'arRecordStep']
  return (
    <div>
      <header className='max-w-3xl mb-8'>
        <h1 className='font-serif text-4xl md:text-5xl mb-6'>
          {t(draft ? 'arEditDraft' : 'arSubmit')}
        </h1>
        <p className='text-muted-foreground leading-relaxed'>{t('arSubmitIntro')}</p>
      </header>
      <ol className='flex flex-wrap gap-4 md:gap-8 border-y border-border py-4 mb-8 text-sm'>
        {steps.map((key, index) => (
          <li key={key}>
            <button
              type='button'
              disabled={busy || !!saved}
              aria-current={step === index ? 'step' : undefined}
              onClick={() => setStep(index)}
              className={
                step === index
                  ? 'font-semibold underline underline-offset-8'
                  : 'text-muted-foreground'
              }
            >
              {index + 1}. {t(key)}
            </button>
          </li>
        ))}
      </ol>
      {saved ? (
        <section role='status' className='border border-border bg-card p-8 rounded-lg'>
          <h2 className='font-serif text-2xl mb-4'>
            {t(saved === 'draft' ? 'arSavedDraft' : 'arSavedReview')}
          </h2>
          <p className='text-muted-foreground mb-6'>{t('arSavedHint')}</p>
          <Link href='/archive/my' className='underline'>
            {t('arMyWorks')}
          </Link>
        </section>
      ) : (
        <form
          ref={ref}
          noValidate
          onSubmit={event => {
            event.preventDefault()
            if (step < 3) setStep(step + 1)
            else void save('pending_review')
          }}
        >
          <fieldset disabled={busy}>
            <legend className='sr-only'>{t(steps[step]!)}</legend>
            <div hidden={step !== 0}>
              {draft ? (
                <p className='text-muted-foreground leading-relaxed'>{t('arKeepImages')}</p>
              ) : (
                <>
                  <label className='block text-sm'>
                    {t('arPhotos')} *
                    <input
                      type='file'
                      multiple
                      accept='image/jpeg,image/png,image/webp'
                      className={fieldClass}
                      onChange={event => {
                        const selected = Array.from(event.target.files || [])
                        if (
                          selected.length > MAX_IMAGES ||
                          selected.reduce((n, f) => n + f.size, 0) > MAX_IMAGE_BYTES
                        ) {
                          setMessage('arImageLimit')
                          event.target.value = ''
                          setFiles([])
                        } else {
                          setFiles(selected)
                          setMessage('')
                        }
                      }}
                    />
                  </label>
                  <p className='text-sm text-muted-foreground mt-4'>{t('arImageHint')}</p>
                  <div className='grid sm:grid-cols-3 gap-6 mt-8'>
                    {previews.map((url, index) => (
                      <figure key={url} className='border border-border p-4 bg-muted'>
                        <img
                          src={url}
                          alt={`${t('arPhotoStep')} ${index + 1}`}
                          className='h-64 w-full object-contain'
                        />
                        <figcaption className='text-sm mt-4'>
                          {index === 0 ? t('arPrimary') : t('arDetailPhoto')}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div hidden={step !== 1} className='space-y-6'>
              <label className='text-sm block'>
                {t('arArtist')} *
                <select
                  name='artistId'
                  className={fieldClass}
                  defaultValue={draft?.values.artistId}
                >
                  {artists.map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className='grid md:grid-cols-2 gap-6'>
                {input('title', 'arTitleKo', 'text', true)}
                {input('titleHanja', 'arTitleHanja')}
                {input('style', 'arStyle', 'text', true)}
                {input('year', 'arYear', 'number', true)}
                {input('width', 'arWidth', 'number', true)}
                {input('height', 'arHeight', 'number', true)}
                {input('materials', 'arMaterials', 'text', true)}
                {input('seal', 'arSeal')}
              </div>
            </div>
            <div hidden={step !== 2} className='space-y-6'>
              {input('titleEn', 'arTitleEn')}
              {area('transcription', 'arTranscription')}
              {area('interpretation', 'arInterpretation')}
              {area('interpretationEn', 'arInterpretationEn')}
              {area('source', 'arSource')}
            </div>
            <div hidden={step !== 3} className='space-y-6'>
              <div className='bg-muted border border-border rounded-lg p-6'>
                <h2 className='font-serif text-2xl mb-4'>{t('arRecordStep')}</h2>
                <p className='text-sm leading-loose text-muted-foreground'>{t('arRecordHint')}</p>
              </div>
              {draft ? (
                <>
                  <p className='text-muted-foreground'>{t('arKeepRecords')}</p>
                  <input type='hidden' name='recordTitle' value='' />
                  <input type='hidden' name='organizer' value='' />
                  <input type='hidden' name='contestRef' value='' />
                </>
              ) : (
                <>
                  {input('recordTitle', 'arRecordTitle')}
                  {input('organizer', 'arOrganizer')}
                  {input('contestRef', 'arContestRef')}
                </>
              )}
              <p className='text-sm text-muted-foreground'>{t('arPrivacyHint')}</p>
            </div>
          </fieldset>
          {message && (
            <p role='alert' className='mt-8 text-destructive'>
              {t(message)}
            </p>
          )}
          <div className='flex flex-wrap justify-between gap-4 mt-12 border-t border-border pt-6'>
            <button
              type='button'
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0 || busy}
              className='rounded-md border border-border px-6 py-3 text-sm disabled:opacity-50'
            >
              {t('arPrev')}
            </button>
            <div className='flex flex-wrap gap-4'>
              <button
                type='button'
                disabled={busy}
                onClick={() => void save('draft')}
                className='rounded-md border border-border px-6 py-3 text-sm disabled:opacity-50'
              >
                {t('arSaveDraft')}
              </button>
              <button
                type='submit'
                disabled={busy}
                className='rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm disabled:opacity-50'
              >
                {busy ? t('arSaving') : step === 3 ? t('arRequestReview') : t('arNext')}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { Pagination } from './common'

export function ExhibitionPicker({
  exhibition,
  works,
  page,
  total,
  q,
  linked,
}: {
  exhibition: { id: string; title: string; is_published: boolean | null }
  works: {
    id: string
    title: string
    artist: string
    status: string | null
    linked: boolean
    isPublic: boolean
  }[]
  page: number
  total: number
  q: string
  linked: boolean
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const base = `/admin/archive/exhibitions/${exhibition.id}`
  const href = (p: number, mode = linked) =>
    `${base}?mode=${mode ? 'linked' : 'available'}&q=${encodeURIComponent(q)}&page=${p}`
  async function toggle(id: string, link: boolean) {
    if (busy) return
    setBusy(id)
    setError(false)
    try {
      const response = await fetch(`/api/admin/archive/exhibitions/${exhibition.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId: id, link }),
      })
      if (!response.ok) {
        setError(true)
        return
      }
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setBusy(null)
    }
  }
  return (
    <section>
      <Link href='/admin/archive/exhibitions' className='text-sm underline'>
        {t('axManageExhibitions')}
      </Link>
      <h1 className='font-serif text-4xl my-8'>{exhibition.title}</h1>
      <p className='text-muted-foreground leading-relaxed mb-6'>{t('axReuseIntro')}</p>
      {!exhibition.is_published && <p className='mb-6'>{t('axExhibitionPrivate')}</p>}
      <nav
        className='flex flex-wrap gap-6 border-b border-border pb-6 mb-6'
        aria-label={t('axWorkSelection')}
      >
        <Link href={href(1, true)} aria-current={linked ? 'page' : undefined} className='underline'>
          {t('axLinkedWorks')}
        </Link>
        <Link
          href={href(1, false)}
          aria-current={!linked ? 'page' : undefined}
          className='underline'
        >
          {t('axChoosePublished')}
        </Link>
        {exhibition.is_published && (
          <Link href={`/archive/exhibitions/${exhibition.id}`} className='underline'>
            {t('axViewExhibition')}
          </Link>
        )}
      </nav>
      <form action={base} className='flex flex-wrap gap-4 mb-8'>
        <input type='hidden' name='mode' value={linked ? 'linked' : 'available'} />
        <label className='text-sm'>
          {t('axSearchWorks')}
          <input
            name='q'
            defaultValue={q}
            maxLength={50}
            className='ml-3 border border-input rounded-md bg-background p-3'
          />
        </label>
        <button type='submit' className='border border-border rounded-md px-6 py-3 text-sm'>
          {t('arSearch')}
        </button>
      </form>
      {error && (
        <p role='alert' className='mb-6 text-destructive'>
          {t('arSaveFailed')}
        </p>
      )}
      {!works.length ? (
        <p role='status'>{t('axNoSelectableWorks')}</p>
      ) : (
        <ul className='space-y-4'>
          {works.map(work => (
            <li
              key={work.id}
              className='border border-border rounded-lg bg-card p-6 flex flex-wrap items-center justify-between gap-6'
            >
              <div>
                <h2 className='font-serif text-xl'>{work.title}</h2>
                <p className='text-sm text-muted-foreground mt-2'>{work.artist}</p>
                {!work.isPublic && <p className='text-sm mt-2'>{t('axWorkHidden')}</p>}
              </div>
              <button
                type='button'
                disabled={busy !== null}
                onClick={() => void toggle(work.id, !work.linked)}
                className='rounded-md border border-border px-6 py-3 text-sm disabled:opacity-50'
              >
                {busy === work.id ? t('arSaving') : t(work.linked ? 'axUnlinkWork' : 'axLinkWork')}
              </button>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} total={total} href={p => href(p)} />
    </section>
  )
}

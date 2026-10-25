'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Claim {
  id: string
  artist_id: string | null
  claimed_name: string
  status: string
  decision_note: string | null
}

interface Candidate {
  id: string
  name: string
  nameZh: string | null
  artNameKo: string | null
  artNameHanja: string | null
  membershipType: string | null
}

const CLAIMS_URL = '/api/profile/artist-claims'
const SEARCH_LIMIT = 8

async function readJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null
}

/** 아직 작가 페이지와 연결되지 않은 계정에만 보인다 — 연결 요청·대기·반려 상태를 다룬다. */
export function ArtistClaimSection({
  defaultName,
  onChanged,
}: {
  defaultName: string
  onChanged?: () => void
}) {
  const { t } = useLanguage()
  const [claims, setClaims] = useState<Claim[] | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Candidate[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [unlisted, setUnlisted] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch(CLAIMS_URL, { credentials: 'include' })
      if (!response.ok) throw new Error()
      setClaims((await readJson<{ data: Claim[] }>(response))?.data ?? [])
    } catch {
      setClaims([])
      setFailed('claimError')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = query.trim()
    if (!term) return
    setSearching(true)
    try {
      const params = new URLSearchParams({ q: term, limit: String(SEARCH_LIMIT) })
      const response = await fetch(`/api/artists?${params}`)
      setResults(
        response.ok ? ((await readJson<{ artists: Candidate[] }>(response))?.artists ?? []) : []
      )
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name) ?? '').trim()
    setBusy(true)
    setFailed(null)
    try {
      const response = await fetch(CLAIMS_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: selected?.id ?? null,
          claimedName: field('claimedName'),
          claimedNameHanja: field('claimedNameHanja'),
          claimedArtName: field('claimedArtName'),
          note: field('note'),
        }),
      })
      if (!response.ok) {
        const body = await readJson<{ code?: string }>(response)
        setFailed(body?.code === 'ARTIST_ALREADY_LINKED' ? 'claimErrorLinked' : 'claimError')
        return
      }
      setSelected(null)
      setUnlisted(false)
      await load()
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  async function withdraw(claim: Claim) {
    setBusy(true)
    setFailed(null)
    try {
      const response = await fetch(`${CLAIMS_URL}/${claim.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) setFailed('claimError')
      await load()
    } finally {
      setBusy(false)
    }
  }

  if (!claims) return <p role='status'>{t('authNativeBusy')}</p>
  const pending = claims.find(claim => claim.status === 'pending')
  const rejected = claims[0]?.status === 'rejected' ? claims[0] : null
  const choosing = Boolean(selected) || unlisted

  return (
    <section aria-labelledby='artist-claim-title' className='space-y-4 border-t pt-6'>
      <h2 id='artist-claim-title' className='font-serif text-xl'>
        {t('claimTitle')}
      </h2>
      {failed && (
        <p role='alert' className='text-destructive'>
          {t(failed)}
        </p>
      )}
      {pending ? (
        <div className='space-y-3'>
          <p role='status'>{t('claimPending')}</p>
          <p className='text-sm text-muted-foreground'>
            {t('claimRequested')}: {pending.claimed_name}
          </p>
          <Button variant='outline' disabled={busy} onClick={() => void withdraw(pending)}>
            {t('claimWithdraw')}
          </Button>
        </div>
      ) : (
        <>
          <p className='text-muted-foreground'>{t('claimIntro')}</p>
          {rejected && (
            <div className='rounded-md bg-muted px-3 py-2 text-sm'>
              <p>{t('claimRejected')}</p>
              {rejected.decision_note && (
                <p className='mt-1'>
                  {t('claimDecisionNote')}: {rejected.decision_note}
                </p>
              )}
            </div>
          )}
          {!choosing && (
            <>
              <form className='flex gap-2' onSubmit={search} role='search'>
                <Label htmlFor='claim-search' className='sr-only'>
                  {t('claimSearchLabel')}
                </Label>
                <Input
                  id='claim-search'
                  type='search'
                  value={query}
                  maxLength={50}
                  placeholder={t('claimSearchPlaceholder')}
                  onChange={event => setQuery(event.target.value)}
                />
                <Button type='submit' variant='outline' disabled={searching}>
                  {t(searching ? 'claimSearching' : 'claimSearch')}
                </Button>
              </form>
              {results && results.length === 0 && (
                <p className='text-sm text-muted-foreground'>{t('claimNoResults')}</p>
              )}
              {results && results.length > 0 && (
                <ul className='divide-y rounded-md border'>
                  {results.map(candidate => (
                    <li key={candidate.id} className='flex items-center justify-between gap-3 p-3'>
                      <CandidateLabel candidate={candidate} />
                      <Button size='sm' onClick={() => setSelected(candidate)}>
                        {t('claimPick')}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant='link' className='px-0' onClick={() => setUnlisted(true)}>
                {t('claimUnlisted')}
              </Button>
            </>
          )}
          {choosing && (
            <form className='space-y-4' onSubmit={submit}>
              {selected ? (
                <div className='flex items-center justify-between gap-3 rounded-md border p-3'>
                  <div>
                    <p className='text-xs text-muted-foreground'>{t('claimSelected')}</p>
                    <CandidateLabel candidate={selected} />
                  </div>
                  <Button variant='ghost' size='sm' onClick={() => setSelected(null)}>
                    {t('claimChange')}
                  </Button>
                </div>
              ) : (
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-sm text-muted-foreground'>{t('claimUnlistedHint')}</p>
                  <Button variant='ghost' size='sm' onClick={() => setUnlisted(false)}>
                    {t('claimChange')}
                  </Button>
                </div>
              )}
              <ClaimField
                id='claimedName'
                label={t('claimName')}
                required
                defaultValue={selected?.name ?? defaultName}
              />
              <ClaimField
                id='claimedNameHanja'
                label={t('claimNameHanja')}
                defaultValue={selected?.nameZh ?? ''}
              />
              <ClaimField
                id='claimedArtName'
                label={t('claimArtName')}
                defaultValue={selected?.artNameHanja ?? selected?.artNameKo ?? ''}
              />
              <div className='space-y-2'>
                <Label htmlFor='claim-note'>{t('claimNote')}</Label>
                <Textarea
                  id='claim-note'
                  name='note'
                  maxLength={1000}
                  rows={3}
                  aria-describedby='claim-note-hint'
                />
                <p id='claim-note-hint' className='text-xs text-muted-foreground'>
                  {t('claimNoteHint')}
                </p>
              </div>
              <Button type='submit' disabled={busy}>
                {t(busy ? 'authNativeBusy' : 'claimSubmit')}
              </Button>
            </form>
          )}
        </>
      )}
    </section>
  )
}

function CandidateLabel({ candidate }: { candidate: Candidate }) {
  const artName = candidate.artNameHanja ?? candidate.artNameKo
  return (
    <div>
      <p className='font-medium'>
        {candidate.name}
        {candidate.nameZh && <span className='ml-2 text-muted-foreground'>{candidate.nameZh}</span>}
      </p>
      {(artName || candidate.membershipType) && (
        <p className='text-xs text-muted-foreground'>
          {[artName, candidate.membershipType].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  )
}

function ClaimField({
  id,
  label,
  defaultValue,
  required,
}: {
  id: string
  label: string
  defaultValue: string
  required?: boolean
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={`claim-${id}`}>{label}</Label>
      <Input
        id={`claim-${id}`}
        name={id}
        defaultValue={defaultValue}
        maxLength={100}
        required={required}
      />
    </div>
  )
}

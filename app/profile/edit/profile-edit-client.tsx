'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAccount } from '@/components/auth/session-provider'
import { useLanguage } from '@/contexts/language-context'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchArtistProfile, updateArtistProfile } from '@/lib/api/profiles'
import type { ArtistProfileEditorData, ArtistProfileUpdates } from '@/lib/types/profile-editor'

type Form = Required<ArtistProfileUpdates>
const empty: Form = {
  nameEn: '',
  bio: '',
  bioEn: '',
  birthYear: null,
  specialization: [],
}
const toForm = (profile: ArtistProfileEditorData): Form => ({
  nameEn: profile.nameEn ?? '',
  bio: profile.bio ?? '',
  bioEn: profile.bioEn ?? '',
  birthYear: profile.birthYear,
  specialization: profile.specialization,
})

export function ProfileEditClient() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user: account } = useAccount()
  const { t } = useLanguage()
  const artistId = account?.artistIds[0]
  const identity = `${account?.id ?? ''}:${artistId ?? ''}`
  const currentIdentity = useRef(identity)
  currentIdentity.current = identity
  const generation = useRef(0)
  const [profile, setProfile] = useState<ArtistProfileEditorData | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [specialtiesText, setSpecialtiesText] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const requests = generation
    const version = ++requests.current
    setSaving(false)
    setMessage('')
    setFailed(false)
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in?next=/profile/edit')
      return
    }
    if (!artistId) {
      setProfile(null)
      setLoading(false)
      return
    }
    let active = true
    setProfile(null)
    setLoading(true)
    setLoadError(false)
    void fetchArtistProfile(artistId).then(({ data, error }) => {
      if (!active || version !== generation.current || currentIdentity.current !== identity) return
      if (error || !data) {
        setProfile(null)
        setLoadError(true)
      } else {
        setProfile(data)
        setForm(toForm(data))
        setSpecialtiesText(data.specialization.join(', '))
      }
      setLoading(false)
    })
    return () => {
      active = false
      requests.current++
    }
  }, [isLoaded, isSignedIn, artistId, identity, attempt, router])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!artistId || !profile || profile.id !== artistId || saving) return
    const version = generation.current
    const isCurrent = () => version === generation.current && currentIdentity.current === identity
    setSaving(true)
    setMessage('')
    setFailed(false)
    try {
      const { data, error } = await updateArtistProfile(artistId, {
        ...form,
        specialization: specialtiesText
          .split(',')
          .map(value => value.trim())
          .filter(Boolean),
      })
      if (!isCurrent()) return
      if (error || !data) throw new Error('PROFILE_UNAVAILABLE')
      setProfile(data)
      setForm(toForm(data))
      setSpecialtiesText(data.specialization.join(', '))
      setMessage('profileEditorSaved')
    } catch {
      if (!isCurrent()) return
      setFailed(true)
      setMessage('authNativeUnavailable')
    } finally {
      if (isCurrent()) setSaving(false)
    }
  }

  if (!isLoaded || loading || (artistId && profile && profile.id !== artistId))
    return (
      <p role='status' className='p-8'>
        {t('authNativeBusy')}
      </p>
    )
  if (!artistId)
    return (
      <div className='mx-auto max-w-xl space-y-4 px-6 py-12'>
        <p>{t('authNativeUnlinked')}</p>
        <Link className='underline' href='/profile'>
          {t('authNativeAccount')}
        </Link>
      </div>
    )
  if (loadError || !profile)
    return (
      <div className='mx-auto max-w-xl space-y-4 px-6 py-12'>
        <p role='alert'>{t('profileEditorLoadError')}</p>
        <Button onClick={() => setAttempt(value => value + 1)}>{t('authNativeRetry')}</Button>
      </div>
    )

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='container flex-1 py-12'>
        <div className='mx-auto w-full max-w-3xl space-y-8'>
          <header className='space-y-3'>
            <Link href='/profile' className='underline'>
              {t('authNativeAccount')}
            </Link>
            <h1 className='font-serif text-3xl text-foreground'>{t('profileEditorTitle')}</h1>
            <p className='text-muted-foreground'>{t('profileEditorIntro')}</p>
          </header>
          {profile.profileImage && (
            <Image
              src={profile.profileImage}
              alt={profile.name}
              width={128}
              height={128}
              className='rounded-full object-cover'
            />
          )}
          <form onSubmit={save} className='space-y-6' aria-busy={saving}>
            <fieldset disabled={saving} className='space-y-6'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='artist-name'>{t('profileEditorName')}</Label>
                  <Input
                    id='artist-name'
                    value={profile.name}
                    readOnly
                    aria-describedby='artist-name-policy'
                  />
                  <p id='artist-name-policy' className='text-sm text-muted-foreground'>
                    {t('profileEditorNamePolicy')}
                  </p>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='artist-name-en'>{t('profileEditorNameEn')}</Label>
                  <Input
                    id='artist-name-en'
                    value={form.nameEn ?? ''}
                    onChange={e => setForm({ ...form, nameEn: e.target.value })}
                    maxLength={200}
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='artist-bio'>{t('profileEditorBio')}</Label>
                <Textarea
                  id='artist-bio'
                  value={form.bio ?? ''}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  maxLength={10000}
                  rows={6}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='artist-bio-en'>{t('profileEditorBioEn')}</Label>
                <Textarea
                  id='artist-bio-en'
                  value={form.bioEn ?? ''}
                  onChange={e => setForm({ ...form, bioEn: e.target.value })}
                  maxLength={10000}
                  rows={6}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='artist-birth-year'>{t('profileEditorBirth')}</Label>
                <Input
                  id='artist-birth-year'
                  type='number'
                  min={1000}
                  max={new Date().getUTCFullYear()}
                  value={form.birthYear ?? ''}
                  onChange={e =>
                    setForm({ ...form, birthYear: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='artist-specialties'>{t('profileEditorSpecialties')}</Label>
                <Input
                  id='artist-specialties'
                  value={specialtiesText}
                  aria-describedby='artist-specialties-help'
                  onChange={e => setSpecialtiesText(e.target.value)}
                />
                <p id='artist-specialties-help' className='text-sm text-muted-foreground'>
                  {t('profileEditorSpecialtiesHelp')}
                </p>
              </div>
            </fieldset>
            <Card>
              <CardHeader>
                <CardTitle>{t('profileEditorVisibility')}</CardTitle>
                <CardDescription>{t('profileEditorVisibilityHelp')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  {t(
                    profile.visibility === 'public'
                      ? 'profileEditorPublic'
                      : profile.visibility === 'members'
                        ? 'profileEditorMembers'
                        : 'profileEditorHidden'
                  )}
                </p>
              </CardContent>
            </Card>
            {message && <p role={failed ? 'alert' : 'status'}>{t(message)}</p>}
            <Button type='submit' disabled={saving}>
              {t(saving ? 'authNativeBusy' : 'authNativeSave')}
            </Button>
          </form>
        </div>
      </div>
      <LayoutFooter />
    </div>
  )
}

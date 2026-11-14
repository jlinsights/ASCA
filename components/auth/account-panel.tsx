'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { MemberHelp } from './member-help'
import { ArtistClaimSection } from './artist-claim-section'
import { MyContestEntries } from './my-contest-entries'
import { useAccount } from './session-provider'
import { useLanguage } from '@/contexts/language-context'
import { createAuthBrowserClient } from '@/lib/auth/supabase/browser'
import type { SupabaseAccount } from '@/lib/auth/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import './auth.css'

/** 세션을 읽고 저장·로그아웃을 맡는다. 화면은 AccountView 가 그린다 */
export function AccountPanel() {
  const { user, isLoaded, error, refresh, signOut } = useAccount()
  const { t } = useLanguage()
  const search = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function save(displayName: string) {
    if (!user) return
    setBusy(true)
    setFailed(false)
    try {
      const { data, error: saveError } = await createAuthBrowserClient()
        .from('account_profiles')
        .update({ display_name: displayName })
        .eq('id', user.id)
        .select('id')
        .single()
      if (saveError || !data) throw saveError
      await refresh()
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  if (!isLoaded) return <p role='status'>{t('authNativeBusy')}</p>
  if (error)
    return (
      <div role='alert'>
        {t('authNativeSessionError')}
        <Button onClick={() => void refresh()}>{t('authNativeRetry')}</Button>
      </div>
    )
  if (!user) return <Link href='/sign-in'>{t('authNativeSignIn')}</Link>
  return (
    <AccountView
      user={user}
      passwordUpdated={search.get('password') === 'updated'}
      busy={busy}
      failed={failed}
      onSave={save}
      onSignOut={() => void signOut().catch(() => {})}
      onClaimChanged={() => void refresh()}
    />
  )
}

interface AccountViewProps {
  user: SupabaseAccount
  passwordUpdated: boolean
  busy: boolean
  failed: boolean
  onSave: (displayName: string) => void
  onSignOut: () => void
  onClaimChanged: () => void
}

/** 이름 첫 글자 — 사진 대신 둥근 낙관 자리에 쓴다 */
export function accountInitial(user: Pick<SupabaseAccount, 'displayName' | 'email'>): string {
  const source = user.displayName.trim() || user.email
  return ([...source][0] ?? '').toUpperCase()
}

/** 내 작가 공간 — 머리(이름·메일) 아래에 내 정보·작가·응모·계정 카드를 건다 */
export function AccountView({
  user,
  passwordUpdated,
  busy,
  failed,
  onSave,
  onSignOut,
  onClaimChanged,
}: AccountViewProps) {
  const { t } = useLanguage()
  // 작가 공개 페이지로 바로 잇지 않는다 — 비공개(준회원·공모작가·자격 정지) 작가는 404 가 난다
  const linkedArtist = user.artistIds.length > 0

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave(String(new FormData(event.currentTarget).get('name') || '').trim())
  }

  return (
    <div className='asca-account'>
      <header className='asca-account__head'>
        <span className='asca-account__avatar' aria-hidden='true'>
          {accountInitial(user)}
        </span>
        <div className='asca-account__who'>
          <p className='asca-account__eyebrow'>{t('authNativeAccount')}</p>
          <h1 className='asca-account__name'>{user.displayName || user.email}</h1>
          <p className='asca-account__email'>{user.email}</p>
        </div>
      </header>

      {passwordUpdated && (
        <p role='status' className='asca-account__notice'>
          {t('authNativePasswordUpdated')}
        </p>
      )}

      <div className='asca-account__grid'>
        <section className='asca-account__card' aria-labelledby='account-profile-title'>
          <h2 id='account-profile-title' className='asca-account__card-title'>
            {t('authAcProfileTitle')}
          </h2>
          <form className='asca-account__form' onSubmit={submit}>
            <Label htmlFor='account-name'>{t('authNativeName')}</Label>
            <div className='asca-account__row'>
              <Input
                id='account-name'
                name='name'
                defaultValue={user.displayName}
                maxLength={100}
                required
              />
              <Button type='submit' disabled={busy}>
                {t(busy ? 'authNativeBusy' : 'authNativeSave')}
              </Button>
            </div>
            {failed && (
              <p role='alert' className='text-destructive'>
                {t('authNativeUnavailable')}
              </p>
            )}
          </form>
        </section>

        {linkedArtist ? (
          <section className='asca-account__card' aria-labelledby='account-artist-title'>
            <h2 id='account-artist-title' className='asca-account__card-title'>
              {t('authAcArtistTitle')}
            </h2>
            <div className='asca-account__actions'>
              <Button asChild>
                <Link href='/archive/submit'>{t('authNativeArchive')}</Link>
              </Button>
            </div>
          </section>
        ) : (
          <div className='asca-account__card'>
            <ArtistClaimSection defaultName={user.displayName} onChanged={onClaimChanged} />
          </div>
        )}

        <div className='asca-account__card asca-account__card--wide'>
          <MyContestEntries />
        </div>

        <section
          className='asca-account__card asca-account__card--wide'
          aria-labelledby='account-security-title'
        >
          <h2 id='account-security-title' className='asca-account__card-title'>
            {t('authAcSecurityTitle')}
          </h2>
          <div className='asca-account__actions'>
            <Button asChild variant='outline'>
              <Link href='/forgot-password'>{t('authAcChangePassword')}</Link>
            </Button>
            {user.role === 'admin' && (
              <Button asChild variant='outline'>
                <Link href={user.assuranceLevel === 'aal2' ? '/admin' : '/auth/mfa?next=/admin'}>
                  {t('authNativeMfaTitle')}
                </Link>
              </Button>
            )}
            <Button variant='ghost' className='asca-account__signout' onClick={onSignOut}>
              {t('siteSignOut')}
            </Button>
          </div>
        </section>
      </div>

      <MemberHelp />
    </div>
  )
}

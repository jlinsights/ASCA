'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useAccount } from './session-provider'
import { useLanguage } from '@/contexts/language-context'
import { createAuthBrowserClient } from '@/lib/auth/supabase/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AccountPanel() {
  const { user, isLoaded, error, refresh, signOut } = useAccount()
  const { t } = useLanguage()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    setBusy(true)
    setFailed(false)
    try {
      const displayName = String(new FormData(event.currentTarget).get('name') || '').trim()
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
    <section className='mx-auto max-w-xl space-y-6 px-6 py-12'>
      <h1 className='font-serif text-3xl'>{t('authNativeAccount')}</h1>
      <p>{user.email}</p>
      <form className='space-y-4' onSubmit={save}>
        <Label htmlFor='account-name'>{t('authNativeName')}</Label>
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
        {failed && (
          <p role='alert' className='text-destructive'>
            {t('authNativeUnavailable')}
          </p>
        )}
      </form>
      {!user.artistIds.length && <p className='text-muted-foreground'>{t('authNativeUnlinked')}</p>}
      {!!user.artistIds.length && (
        <Button asChild>
          <Link href='/archive/submit'>{t('authNativeArchive')}</Link>
        </Button>
      )}
      {user.role === 'admin' && (
        <Button asChild variant='outline'>
          <Link href={user.assuranceLevel === 'aal2' ? '/admin' : '/auth/mfa?next=/admin'}>
            {t('authNativeMfaTitle')}
          </Link>
        </Button>
      )}
      <Link href='/forgot-password' className='block underline'>
        {t('authNativeForgot')}
      </Link>
      <Button variant='outline' onClick={() => void signOut().catch(() => {})}>
        {t('siteSignOut')}
      </Button>
    </section>
  )
}

'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { TERMS_VERSION } from '@/app/terms-of-service/_data/terms-articles'
import { createAuthBrowserClient } from '@/lib/auth/supabase/browser'
import { safeAuthRedirect } from '@/lib/auth/supabase/redirect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type AuthFormMode = 'sign-in' | 'sign-up' | 'forgot' | 'reset'

export function AuthForm({ mode }: { mode: AuthFormMode }) {
  const { t, language } = useLanguage()
  const search = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(search.get('error') ? 'authNativeCallback' : '')
  const [failed, setFailed] = useState(!!search.get('error'))
  const [mfaRequired, setMfaRequired] = useState(false)
  const next = safeAuthRedirect(search.get('next'))
  const signup = mode === 'sign-up'
  const passwordNeeded = mode !== 'forgot'
  const newPassword = signup || mode === 'reset'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')
    setMessage('')
    setFailed(false)
    if (newPassword && password !== form.get('confirm')) {
      setMessage('authNativeMismatch')
      setFailed(true)
      return
    }
    if (signup && form.get('terms') !== 'on') return
    setBusy(true)
    try {
      const client = createAuthBrowserClient()
      const callback = new URL('/auth/callback', window.location.origin)
      callback.searchParams.set('next', mode === 'forgot' ? '/reset-password' : next)
      if (mode === 'forgot') {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: callback.toString(),
        })
        if (error) throw error
        setMessage('authNativeEmailSent')
      } else if (signup) {
        const { error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: callback.toString(),
            data: {
              full_name: String(form.get('name') || '').trim(),
              locale: language,
              terms_version: TERMS_VERSION,
            },
          },
        })
        if (error) throw error
        setMessage('authNativeEmailSent')
      } else if (mode === 'reset') {
        const { data, error: sessionError } = await client.auth.getUser()
        if (sessionError || !data.user) {
          setMessage('authNativeCallback')
          setFailed(true)
          return
        }
        const { data: level, error: levelError } =
          await client.auth.mfa.getAuthenticatorAssuranceLevel()
        if (levelError) throw levelError
        if (level.nextLevel === 'aal2' && level.currentLevel !== 'aal2') {
          setMfaRequired(true)
          return
        }
        const { error } = await client.auth.updateUser({ password })
        if (error) throw error
        window.location.assign('/profile')
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password })
        if (error) throw error
        const response = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'same-origin',
        })
        if (!response.ok || !(await response.json()).account) throw new Error('AUTH_UNAVAILABLE')
        window.location.assign(next)
      }
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? error.code : ''
      setMessage(
        code === 'email_not_confirmed'
          ? 'authNativeUnconfirmed'
          : mode === 'sign-in' && code === 'invalid_credentials'
            ? 'authNativeInvalid'
            : 'authNativeUnavailable'
      )
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  async function resend(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form
    if (!form?.reportValidity()) return
    setBusy(true)
    try {
      const email = String(new FormData(form).get('email') || '').trim()
      const callback = new URL('/auth/callback', window.location.origin)
      callback.searchParams.set('next', next)
      const { error } = await createAuthBrowserClient().auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: callback.toString() },
      })
      if (error) throw error
      setMessage('authNativeEmailSent')
      setFailed(false)
    } catch {
      setMessage('authNativeUnavailable')
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  const buttonKey = signup
    ? 'authNativeSignUp'
    : mode === 'forgot'
      ? 'authNativeRecover'
      : mode === 'reset'
        ? 'authNativeReset'
        : 'authNativeSignIn'

  return (
    <form onSubmit={submit} className='space-y-5' aria-busy={busy}>
      {mfaRequired && (
        <p role='status'>
          <Link className='asca-auth__link' href='/auth/mfa?next=/reset-password'>
            {t('authNativeMfaRecovery')}
          </Link>
        </p>
      )}
      {signup && (
        <div className='space-y-2'>
          <Label htmlFor='auth-name'>{t('authNativeName')}</Label>
          <Input id='auth-name' name='name' autoComplete='name' maxLength={100} required />
        </div>
      )}
      {mode !== 'reset' && (
        <div className='space-y-2'>
          <Label htmlFor='auth-email'>{t('authNativeEmail')}</Label>
          <Input id='auth-email' name='email' type='email' autoComplete='email' required />
        </div>
      )}
      {passwordNeeded && (
        <div className='space-y-2'>
          <Label htmlFor='auth-password'>{t('authNativePassword')}</Label>
          <Input
            id='auth-password'
            name='password'
            type='password'
            autoComplete={newPassword ? 'new-password' : 'current-password'}
            minLength={newPassword ? 12 : undefined}
            required
            aria-describedby={newPassword ? 'auth-password-hint' : undefined}
          />
          {newPassword && (
            <p id='auth-password-hint' className='text-sm text-muted-foreground'>
              {t('authNativePasswordHint')}
            </p>
          )}
        </div>
      )}
      {newPassword && (
        <div className='space-y-2'>
          <Label htmlFor='auth-confirm'>{t('authNativeConfirm')}</Label>
          <Input
            id='auth-confirm'
            name='confirm'
            type='password'
            autoComplete='new-password'
            minLength={12}
            required
          />
        </div>
      )}
      {signup && (
        <div className='space-y-3 text-sm'>
          <label className='flex items-start gap-3'>
            <input type='checkbox' name='terms' required className='mt-1 accent-primary' />
            <span>{t('authNativeAgree')}</span>
          </label>
          <p className='text-muted-foreground'>{t('authNativeMembership')}</p>
        </div>
      )}
      {message && (
        <p
          role={failed ? 'alert' : 'status'}
          className={failed ? 'text-sm text-destructive' : 'text-sm text-foreground'}
        >
          {t(message)}
        </p>
      )}
      <Button type='submit' disabled={busy} className='w-full'>
        {t(busy ? 'authNativeBusy' : buttonKey)}
      </Button>
      {mode === 'sign-in' && (
        <>
          <Link className='asca-auth__link block text-sm' href='/forgot-password'>
            {t('authNativeForgot')}
          </Link>
          {message === 'authNativeUnconfirmed' && (
            <Button type='button' variant='outline' disabled={busy} onClick={resend}>
              {t('authNativeResend')}
            </Button>
          )}
        </>
      )}
      {(mode === 'forgot' || mode === 'reset') && (
        <Link className='asca-auth__link block text-sm' href='/sign-in'>
          {t('authNativeBack')}
        </Link>
      )}
    </form>
  )
}

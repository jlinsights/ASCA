'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { TERMS_VERSION } from '@/app/terms-of-service/_data/terms-articles'
import { createAuthBrowserClient } from '@/lib/auth/supabase/browser'
import { safeAuthRedirect } from '@/lib/auth/supabase/redirect'
import { RECOVERY_EMAIL_SUBJECT } from '@/lib/auth/recovery-email'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type AuthFormMode = 'sign-in' | 'sign-up' | 'forgot' | 'reset'

function PasswordField({
  id,
  label,
  value,
  onChange,
  newPassword,
  invalid,
  onBlur,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  newPassword: boolean
  invalid?: boolean
  onBlur?: () => void
}) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)
  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>{label}</Label>
      <div className='asca-auth__password'>
        <Input
          id={id}
          name={id === 'auth-confirm' ? 'confirm' : 'password'}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          onBlur={onBlur}
          autoComplete={newPassword ? 'new-password' : 'current-password'}
          required
          aria-invalid={invalid || undefined}
          aria-describedby={
            invalid
              ? `${id}-error`
              : newPassword && id !== 'auth-confirm'
                ? 'auth-password-hint'
                : undefined
          }
        />
        <Button
          type='button'
          variant='outline'
          onClick={() => setVisible(!visible)}
          aria-label={`${t(visible ? 'authNativeHide' : 'authNativeShow')} — ${label}`}
          aria-pressed={visible}
          aria-controls={id}
        >
          {t(visible ? 'authNativeHide' : 'authNativeShow')}
        </Button>
      </div>
    </div>
  )
}

export function AuthForm({ mode }: { mode: AuthFormMode }) {
  const { t, language } = useLanguage()
  const search = useSearchParams()
  const [email, setEmail] = useState((search.get('email') || '').slice(0, 254))
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [nameInvalid, setNameInvalid] = useState(false)
  const [consentInvalid, setConsentInvalid] = useState(false)
  const [passwordInvalid, setPasswordInvalid] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(search.get('error') ? 'authNativeCallback' : '')
  const [failed, setFailed] = useState(!!search.get('error'))
  const [mfaRequired, setMfaRequired] = useState(false)
  const [sent, setSent] = useState<'recovery' | 'signup' | null>(null)
  const [retryAt, setRetryAt] = useState(0)
  const [waitSeconds, setWaitSeconds] = useState(0)
  const [failures, setFailures] = useState(0)
  const confirmationTitle = useRef<HTMLHeadingElement>(null)
  const next = safeAuthRedirect(search.get('next'))
  const signup = mode === 'sign-up'
  const newPassword = signup || mode === 'reset'
  const resetHref = `/forgot-password?email=${encodeURIComponent(email.trim())}`
  const mismatch = newPassword && confirmTouched && password !== confirm

  useEffect(() => {
    if (search.get('email') || mode !== 'forgot') return
    try {
      const saved = JSON.parse(sessionStorage.getItem('asca-recovery-email') || 'null')
      if (saved && Date.now() - saved.at < 3_600_000 && typeof saved.email === 'string')
        setEmail(saved.email.slice(0, 254))
    } catch {
      /* A blocked browser store does not prevent recovery. */
    }
  }, [mode, search])

  useEffect(() => {
    if (sent) confirmationTitle.current?.focus()
  }, [sent])
  useEffect(() => {
    if (!retryAt) return
    const tick = () => setWaitSeconds(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [retryAt])

  function showSent(kind: 'recovery' | 'signup') {
    setWaitSeconds(60)
    setSent(kind)
    setRetryAt(Date.now() + 60_000)
    setMessage('')
    setFailed(false)
  }
  function callbackUrl(recovery: boolean) {
    const callback = new URL('/auth/callback', window.location.origin)
    callback.searchParams.set('next', recovery ? '/reset-password' : next)
    return callback.toString()
  }
  function reportError(error: unknown) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : ''
    setMessage(
      code === 'email_not_confirmed'
        ? 'authNativeUnconfirmed'
        : code === 'user_already_exists' || code === 'email_exists'
          ? 'authNativeExisting'
          : code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit'
            ? 'authNativeTooSoon'
            : mode === 'sign-in' && code === 'invalid_credentials'
              ? 'authNativeInvalid'
              : 'authNativeUnavailable'
    )
    setFailed(code !== 'user_already_exists' && code !== 'email_exists')
    if (mode === 'sign-in') setFailures(value => value + 1)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    setMessage('')
    setFailed(false)
    setEmailInvalid(false)
    setPasswordInvalid(false)
    setNameInvalid(false)
    setConsentInvalid(false)
    if (signup && !String(form.get('name') || '').trim()) {
      setNameInvalid(true)
      document.getElementById('auth-name')?.focus()
      return
    }
    if (mode !== 'reset' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailInvalid(true)
      document.getElementById('auth-email')?.focus()
      return
    }
    if (mode !== 'forgot' && (!password || (newPassword && password.length < 12))) {
      setPasswordInvalid(true)
      document.getElementById('auth-password')?.focus()
      return
    }
    if (newPassword && password !== confirm) {
      setConfirmTouched(true)
      document.getElementById('auth-confirm')?.focus()
      return
    }
    if (signup && form.get('terms') !== 'on') {
      setConsentInvalid(true)
      document.getElementById('auth-terms')?.focus()
      return
    }
    setBusy(true)
    try {
      const client = createAuthBrowserClient()
      if (mode === 'forgot') {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: callbackUrl(true),
        })
        if (error) throw error
        try {
          sessionStorage.setItem(
            'asca-recovery-email',
            JSON.stringify({ email: email.trim(), at: Date.now() })
          )
        } catch {
          /* Optional address convenience only; passwords are never persisted. */
        }
        showSent('recovery')
      } else if (signup) {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: callbackUrl(false),
            data: {
              full_name: String(form.get('name') || '').trim(),
              locale: language,
              terms_version: TERMS_VERSION,
            },
          },
        })
        if (error) throw error
        // Supabase may obfuscate an already-confirmed account instead of returning an error.
        if (data?.user?.identities?.length === 0) {
          setMessage('authNativeExisting')
          return
        }
        showSent('signup')
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
        try {
          sessionStorage.removeItem('asca-recovery-email')
        } catch {
          /* Storage may be unavailable. */
        }
        // Recovery already established a signed-in session. Preserve it and go directly to the member space.
        window.location.assign('/profile?password=updated')
      } else {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        const response = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'same-origin',
        })
        if (!response.ok || !(await response.json()).account) throw new Error('AUTH_UNAVAILABLE')
        window.location.assign(next)
      }
    } catch (error) {
      reportError(error)
    } finally {
      setBusy(false)
    }
  }

  async function resend(kind: 'recovery' | 'signup') {
    if (busy || Date.now() < retryAt) return
    setBusy(true)
    setMessage('')
    setFailed(false)
    try {
      const auth = createAuthBrowserClient().auth
      const { error } =
        kind === 'recovery'
          ? await auth.resetPasswordForEmail(email.trim(), { redirectTo: callbackUrl(true) })
          : await auth.resend({
              type: 'signup',
              email: email.trim(),
              options: { emailRedirectTo: callbackUrl(false) },
            })
      if (error) throw error
      showSent(kind)
    } catch (error) {
      reportError(error)
    } finally {
      setBusy(false)
    }
  }

  if (sent)
    return (
      <section className='space-y-5' aria-labelledby='auth-mail-title'>
        <h2
          id='auth-mail-title'
          ref={confirmationTitle}
          tabIndex={-1}
          className='font-serif text-2xl'
        >
          {t('authNativeMailTitle')}
        </h2>
        <p className='break-words'>
          <strong>{email.trim()}</strong>
          <br />
          {t('authNativeMailAddress')}
        </p>
        <p role='status'>{t('authNativeEmailSent')}</p>
        {sent === 'recovery' ? (
          <ol className='list-decimal space-y-3 pl-6'>
            <li>
              {t('authNativeMailSubject')} <strong>{RECOVERY_EMAIL_SUBJECT}</strong>
            </li>
            <li>{t('authNativeMailOpen')}</li>
            <li>{t('authNativeMailExpiry')}</li>
          </ol>
        ) : (
          <p>{t('authNativeSignupMail')}</p>
        )}
        {sent === 'signup' && <p>{t('authNativeArtistLink')}</p>}
        <details className='asca-auth__mail-help'>
          <summary>{t('authNativeMailMissing')}</summary>
          <p>{t('authNativeSpam')}</p>
          <p>{t('authNativeNaverSpam')}</p>
          <p>{t('authNativeDaumSpam')}</p>
          <p>{t('authNativeMailWait')}</p>
          <Button
            type='button'
            variant='outline'
            disabled={busy || waitSeconds > 0}
            onClick={() => void resend(sent)}
          >
            {t('authNativeSendAgain')}
            {waitSeconds > 0 && ` (${waitSeconds})`}
          </Button>
          <p>{t('authNativeMailOffice')}</p>
        </details>
        {message && <p role={failed ? 'alert' : 'status'}>{t(message)}</p>}
        <Button
          type='button'
          variant='outline'
          disabled={busy}
          onClick={() => {
            setSent(null)
            setMessage('')
          }}
        >
          {t('authNativeChangeEmail')}
        </Button>
        <Link className='asca-auth__link block' href='/sign-in'>
          {t('authNativeBack')}
        </Link>
      </section>
    )

  return (
    <form onSubmit={submit} noValidate className='space-y-5' aria-busy={busy}>
      {(mode === 'sign-in' || signup) && (
        <div
          className={`asca-auth__returning ${failures >= 5 ? 'asca-auth__returning--emphasis' : ''}`}
        >
          <p>
            <strong>{t(signup ? 'authNativeReturningSignup' : 'authNativeReturningTitle')}</strong>
          </p>
          <p>{t('authNativeReturningBody')}</p>
          <Link href={resetHref} className='asca-auth__link'>
            {t('authNativeNewPassword')} →
          </Link>
        </div>
      )}
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
          <Input
            id='auth-name'
            name='name'
            autoComplete='name'
            maxLength={100}
            required
            aria-invalid={nameInvalid || undefined}
            aria-describedby={nameInvalid ? 'auth-name-error' : undefined}
          />
          {nameInvalid && (
            <p id='auth-name-error' role='alert' className='text-destructive'>
              {t('authNativeNameRequired')}
            </p>
          )}
        </div>
      )}
      {mode !== 'reset' && (
        <div className='space-y-2'>
          <Label htmlFor='auth-email'>{t('authNativeEmail')}</Label>
          <Input
            id='auth-email'
            name='email'
            type='email'
            inputMode='email'
            autoComplete='email'
            maxLength={254}
            required
            value={email}
            readOnly={busy}
            onChange={event => {
              setEmail(event.target.value)
              setEmailInvalid(false)
            }}
            aria-invalid={emailInvalid || undefined}
            aria-describedby={emailInvalid ? 'auth-email-error' : undefined}
          />
          {emailInvalid && (
            <p id='auth-email-error' role='alert' className='text-destructive'>
              {t('authNativeEmailError')}
            </p>
          )}
        </div>
      )}
      {mode !== 'forgot' && (
        <>
          <PasswordField
            id='auth-password'
            label={t('authNativePassword')}
            value={password}
            onChange={value => {
              setPassword(value)
              setPasswordInvalid(false)
            }}
            newPassword={newPassword}
            invalid={passwordInvalid}
          />
          {passwordInvalid && (
            <p id='auth-password-error' role='alert' className='text-destructive'>
              {t(newPassword ? 'authNativePasswordHint' : 'authNativePasswordRequired')}
            </p>
          )}
          {newPassword && (
            <p id='auth-password-hint'>
              {password.length >= 12 ? '✓ ' : ''}
              {t('authNativePasswordHint')}
            </p>
          )}
        </>
      )}
      {mode === 'sign-in' && (
        <Link className='asca-auth__link block' href={resetHref}>
          {t('authNativeForgot')}
        </Link>
      )}
      {newPassword && (
        <>
          <PasswordField
            id='auth-confirm'
            label={t('authNativeConfirm')}
            value={confirm}
            onChange={setConfirm}
            onBlur={() => setConfirmTouched(true)}
            newPassword
            invalid={mismatch}
          />
          {mismatch && (
            <p id='auth-confirm-error' role='alert' className='text-destructive'>
              {t('authNativeMismatch')}
            </p>
          )}
        </>
      )}
      {signup && (
        <div className='space-y-3'>
          <p>{t('authNativeArtistLink')}</p>
          <label className='flex min-h-12 items-start gap-3'>
            <input
              id='auth-terms'
              type='checkbox'
              name='terms'
              required
              aria-invalid={consentInvalid || undefined}
              aria-describedby={consentInvalid ? 'auth-terms-error' : undefined}
              className='mt-2 h-6 w-6 shrink-0 accent-primary'
            />
            <span>{t('authNativeAgree')}</span>
          </label>
          {consentInvalid && (
            <p id='auth-terms-error' role='alert' className='text-destructive'>
              {t('authNativeConsentRequired')}
            </p>
          )}
          <p>{t('authNativeMembership')}</p>
        </div>
      )}
      {message && (
        <div className='space-y-2'>
          <p role={failed ? 'alert' : 'status'} className={failed ? 'text-destructive' : ''}>
            {t(message)}
          </p>
          {['authNativeInvalid', 'authNativeExisting', 'authNativeCallback'].includes(message) && (
            <Link className='asca-auth__link block' href={resetHref}>
              {t('authNativeNewPassword')} →
            </Link>
          )}
          {message === 'authNativeUnconfirmed' && (
            <Button
              type='button'
              variant='outline'
              disabled={busy}
              onClick={() => void resend('signup')}
            >
              {t('authNativeResend')}
            </Button>
          )}
        </div>
      )}
      <Button type='submit' disabled={busy} className='w-full'>
        {t(
          busy
            ? 'authNativeBusy'
            : signup
              ? 'authNativeSignUp'
              : mode === 'forgot'
                ? 'authNativeRecover'
                : mode === 'reset'
                  ? 'authNativeReset'
                  : 'authNativeSignIn'
        )}
      </Button>
      {(mode === 'forgot' || mode === 'reset') && (
        <Link className='asca-auth__link block' href='/sign-in'>
          {t('authNativeBack')}
        </Link>
      )}
    </form>
  )
}

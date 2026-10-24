'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { createAuthBrowserClient } from '@/lib/auth/supabase/browser'
import { safeAuthRedirect } from '@/lib/auth/supabase/redirect'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function MfaForm() {
  const { t } = useLanguage()
  const search = useSearchParams()
  const [factorId, setFactorId] = useState('')
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null)
  const [pendingFactors, setPendingFactors] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    void createAuthBrowserClient()
      .auth.mfa.listFactors()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setFailed(true)
          return
        }
        setFactorId(data.totp.find(factor => factor.status === 'verified')?.id || '')
        setPendingFactors(
          data.all.filter(factor => factor.status === 'unverified').map(factor => factor.id)
        )
        setReady(true)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])

  async function enroll() {
    setBusy(true)
    setFailed(false)
    try {
      const client = createAuthBrowserClient()
      for (const id of pendingFactors) {
        const { error } = await client.auth.mfa.unenroll({ factorId: id })
        if (error) throw error
      }
      const { data, error } = await client.auth.mfa.enroll({ factorType: 'totp', issuer: 'ASCA' })
      if (error) throw error
      setFactorId(data.id)
      if (!data.totp.qr_code.startsWith('data:image/svg+xml;')) throw new Error('INVALID_QR')
      setSetup({ qr: data.totp.qr_code, secret: data.totp.secret })
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setFailed(false)
    try {
      const code = String(new FormData(event.currentTarget).get('code') || '')
      if (!/^[0-9]{6}$/.test(code)) throw new Error('INVALID_CODE')
      const { error } = await createAuthBrowserClient().auth.mfa.challengeAndVerify({
        factorId,
        code,
      })
      if (error) throw error
      setSetup(null)
      window.location.assign(safeAuthRedirect(search.get('next')))
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className='space-y-5'>
      {setup && (
        <div className='space-y-3'>
          <p>{t('authNativeMfaScan')}</p>
          {/* Enrollment SVG is isolated as an image, never injected as executable markup. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} alt={t('authNativeMfaScan')} width={240} height={240} />
          <code className='block break-all select-all'>{setup.secret}</code>
        </div>
      )}
      {factorId ? (
        <form onSubmit={verify} className='space-y-4'>
          <Label htmlFor='mfa-code'>{t('authNativeMfaCode')}</Label>
          <Input
            id='mfa-code'
            name='code'
            inputMode='numeric'
            autoComplete='one-time-code'
            pattern='[0-9]{6}'
            minLength={6}
            maxLength={6}
            required
          />
          <Button type='submit' disabled={busy}>
            {t(busy ? 'authNativeBusy' : 'authNativeMfaVerify')}
          </Button>
        </form>
      ) : (
        <Button type='button' onClick={() => void enroll()} disabled={!ready || busy}>
          {t('authNativeMfaEnroll')}
        </Button>
      )}
      {failed && (
        <p role='alert' className='text-destructive'>
          {t('authNativeMfaError')}
        </p>
      )}
    </div>
  )
}

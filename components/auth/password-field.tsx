'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface PasswordFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  newPassword: boolean
  invalid?: boolean
  onBlur?: () => void
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  newPassword,
  invalid,
  onBlur,
}: PasswordFieldProps) {
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

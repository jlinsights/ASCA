'use client'

import { Suspense } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthForm } from '@/components/auth/auth-form'
import '@/components/auth/auth.css'

export default function SignInPage() {
  return (
    <AuthShell variant='sign-in'>
      <Suspense>
        <AuthForm mode='sign-in' />
      </Suspense>
    </AuthShell>
  )
}

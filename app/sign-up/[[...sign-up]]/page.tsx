'use client'

import { Suspense } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthForm } from '@/components/auth/auth-form'
import '@/components/auth/auth.css'

export default function SignUpPage() {
  return (
    <AuthShell variant='sign-up'>
      <Suspense>
        <AuthForm mode='sign-up' />
      </Suspense>
    </AuthShell>
  )
}

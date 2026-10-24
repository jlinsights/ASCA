import { Suspense } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthForm } from '@/components/auth/auth-form'
import '@/components/auth/auth.css'

export default function Page() {
  return (
    <AuthShell variant='sign-in' titleKey='authNativeForgotTitle' ledeKey='authNativeForgotLede'>
      <Suspense>
        <AuthForm mode='forgot' />
      </Suspense>
    </AuthShell>
  )
}

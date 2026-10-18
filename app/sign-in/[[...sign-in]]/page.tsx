'use client'

import { SignIn } from '@clerk/nextjs'
import { AuthShell } from '@/components/auth/auth-shell'
import { useClerkAuthAppearance } from '@/components/auth/clerk-appearance'
import '@/components/auth/auth.css'

export default function SignInPage() {
  const appearance = useClerkAuthAppearance()
  return (
    <AuthShell variant='sign-in'>
      <SignIn appearance={appearance} />
    </AuthShell>
  )
}

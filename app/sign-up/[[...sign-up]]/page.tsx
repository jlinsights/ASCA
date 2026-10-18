'use client'

import { SignUp } from '@clerk/nextjs'
import { AuthShell } from '@/components/auth/auth-shell'
import { useClerkAuthAppearance } from '@/components/auth/clerk-appearance'
import '@/components/auth/auth.css'

export default function SignUpPage() {
  const appearance = useClerkAuthAppearance()
  return (
    <AuthShell variant='sign-up'>
      <SignUp appearance={appearance} />
    </AuthShell>
  )
}

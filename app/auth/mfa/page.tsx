import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getAccount } from '@/lib/auth/server'
import { AuthShell } from '@/components/auth/auth-shell'
import { MfaForm } from '@/components/auth/mfa-form'
import '@/components/auth/auth.css'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const account = await getAccount()
  if (!account) redirect('/sign-in?next=/auth/mfa')
  return (
    <AuthShell variant='sign-in' titleKey='authNativeMfaTitle' ledeKey='authNativeMfaLede'>
      <Suspense>
        <MfaForm />
      </Suspense>
    </AuthShell>
  )
}

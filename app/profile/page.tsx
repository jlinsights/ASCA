import { redirect } from 'next/navigation'
import { getAccount } from '@/lib/auth/server'
import { AccountPanel } from '@/components/auth/account-panel'

export const dynamic = 'force-dynamic'
export default async function Page() {
  if (!(await getAccount())) redirect('/sign-in')
  return <AccountPanel />
}

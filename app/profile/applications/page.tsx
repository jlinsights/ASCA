import { redirect } from 'next/navigation'
import { getAccount } from '@/lib/auth/server'
import { MyApplicationsClient } from './applications-client'

export const dynamic = 'force-dynamic'
export default async function MyApplicationsPage() {
  if (!(await getAccount())) redirect('/sign-in?next=/profile/applications')
  return <MyApplicationsClient />
}

import 'server-only'
import { currentUser } from '@clerk/nextjs/server'
import { AdminRole, hasMinimumRole } from '@/lib/auth/admin-roles'
export { archiveWriter } from './service-client'
export async function archiveIdentity() {
  const user = await currentUser()
  if (!user) return null
  const primary = user.emailAddresses.find(
    email => email.id === user.primaryEmailAddressId && email.verification?.status === 'verified'
  )
  return {
    userId: user.id,
    admin: !!primary && hasMinimumRole(primary.emailAddress, AdminRole.ADMIN),
  }
}

import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { currentUser } from '@clerk/nextjs/server'
import { AdminRole, hasMinimumRole } from '@/lib/auth/admin-roles'
import type { Database } from '@/lib/types/database.generated'
export function archiveWriter() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Archive service unavailable')
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
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

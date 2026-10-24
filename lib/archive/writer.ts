import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { getAccount } from '@/lib/auth/server'
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
  const user = await getAccount()
  if (!user) return null
  if (user.role === 'admin' && user.assuranceLevel !== 'aal2') return null
  return {
    userId: user.id,
    admin: user.role === 'admin' && user.assuranceLevel === 'aal2',
  }
}

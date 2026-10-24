import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { loadSupabaseAccount } from './supabase/account'

export const getAccount = cache(async () => loadSupabaseAccount(await createClient()))

export async function auth() {
  const account = await getAccount()
  return { userId: account?.id ?? null, account }
}

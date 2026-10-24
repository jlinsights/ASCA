import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AccountAuthError, loadSupabaseAccount } from '@/lib/auth/supabase/account'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }

export async function GET() {
  try {
    const account = await loadSupabaseAccount(await createClient({ writable: true }))
    return NextResponse.json({ account }, { headers })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof AccountAuthError ? error.code : 'AUTH_UNAVAILABLE' },
      { status: error instanceof AccountAuthError ? error.status : 503, headers }
    )
  }
}

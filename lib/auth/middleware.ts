import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface AuthUser {
  id: string
  clerkId: string
  email?: string
  firstName?: string
  lastName?: string
  role?: string
  permissions?: string[]
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const user = await currentUser()
    if (!user) return null

    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('clerk_user_id', userId)
      .single()

    return {
      id: userId,
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      role: profile?.role || 'member',
      permissions: profile?.role === 'admin' ? ['admin'] : [],
    }
  } catch {
    return null
  }
}

export async function withAuth(
  _request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return handler(_request)
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  const user = await getAuthUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  return handler(request)
}

export async function requireAdminAuth(_request: NextRequest): Promise<AuthUser | null> {
  const user = await getAuthUser()

  if (!user || user.role !== 'admin') {
    return null
  }

  return user
}

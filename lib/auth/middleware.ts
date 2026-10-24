import { NextRequest, NextResponse } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/account'
import { RolePermissions, Permission } from '@/lib/auth/permissions'

export interface AuthUser {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  role?: string
  assuranceLevel?: 'aal1' | 'aal2'
  artistIds?: string[]
  permissions?: string[]
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const account = await getAccount()
  if (!account) return null
  const admin = account.role === 'admin' && account.assuranceLevel === 'aal2'
  return {
    id: account.id,
    email: account.email,
    firstName: account.displayName,
    role: admin ? 'admin' : 'member',
    assuranceLevel: account.assuranceLevel,
    artistIds: account.artistIds,
    permissions: admin ? RolePermissions.admin : [Permission.READ],
  }
}

export function authErrorResponse(error: unknown) {
  return NextResponse.json(
    { error: error instanceof AccountAuthError ? error.code : 'AUTH_UNAVAILABLE' },
    { status: error instanceof AccountAuthError ? error.status : 503 }
  )
}

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  try {
    if (!(await getAuthUser())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return handler(request)
  } catch (error) {
    return authErrorResponse(error)
  }
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (user.assuranceLevel !== 'aal2')
      return NextResponse.json({ error: 'MFA_REQUIRED' }, { status: 403 })
    return handler(request)
  } catch (error) {
    return authErrorResponse(error)
  }
}

export async function requireAdminAuth(_request: NextRequest): Promise<AuthUser | null> {
  const user = await getAuthUser()
  return user?.role === 'admin' && user.assuranceLevel === 'aal2' ? user : null
}

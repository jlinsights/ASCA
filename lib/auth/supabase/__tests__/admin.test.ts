/** @jest-environment node */
import { NextRequest, NextResponse } from 'next/server'
import { getAccount, auth } from '@/lib/auth/server'
import { withAdminAuth } from '@/lib/auth/middleware'
import { archiveIdentity } from '@/lib/archive/writer'
import { adminMiddleware } from '@/lib/middleware/admin-middleware'
import { Role } from '@/lib/admin/permissions'
import { createGraphQLContext } from '@/lib/graphql/context'

jest.mock('server-only', () => ({}))
jest.mock('@/lib/db', () => ({ db: { query: {} } }))
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }))

const request = new NextRequest('https://asca.example/api/admin/stats')
const account = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'admin@example.test',
  displayName: 'Admin',
  locale: 'ko' as const,
  role: 'admin' as const,
  assuranceLevel: 'aal1' as const,
  artistIds: [],
}

it.each([
  [null, 401],
  [{ ...account, role: 'member' }, 403],
  [account, 403],
  [{ ...account, assuranceLevel: 'aal2' }, 200],
])('requires a fresh admin role and MFA at the API boundary', async (user, expected) => {
  jest.mocked(getAccount).mockResolvedValue(user as any)
  const handler = jest.fn(async () => NextResponse.json({ success: true }))
  const response = await withAdminAuth(request, handler)
  expect(response.status).toBe(expected)
  expect(handler).toHaveBeenCalledTimes(expected === 200 ? 1 : 0)
})

it('does not promote an email allowlist or an MFA-incomplete admin in archive writes', async () => {
  jest.mocked(getAccount).mockResolvedValue(account)
  expect(await archiveIdentity()).toBeNull()
  jest.mocked(getAccount).mockResolvedValue({ ...account, role: 'member', assuranceLevel: 'aal2' })
  expect(await archiveIdentity()).toMatchObject({ admin: false })
})

it('does not honor the legacy skipAuth option or memory-only super-admin assignments', async () => {
  jest.mocked(getAccount).mockResolvedValue(null)
  expect((await adminMiddleware(request, { requireAdmin: true, skipAuth: true }))?.status).toBe(401)
  jest.mocked(getAccount).mockResolvedValue({ ...account, assuranceLevel: 'aal2' })
  expect((await adminMiddleware(request, { requiredRole: Role.SUPER_ADMIN }))?.status).toBe(403)
})

it('does not grant a GraphQL admin role until MFA is verified', async () => {
  jest.mocked(auth).mockResolvedValue({ userId: account.id, account: account as any })
  const unverified = await createGraphQLContext(request)
  expect(unverified.user?.role).toBe('member')
  jest.mocked(auth).mockResolvedValue({
    userId: account.id,
    account: { ...account, assuranceLevel: 'aal2' } as any,
  })
  const verified = await createGraphQLContext(request)
  expect(verified.user?.role).toBe('admin')
})

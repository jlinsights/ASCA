/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from '@/app/api/members/[id]/route'
import { auth, getAccount } from '@/lib/auth/server'
import { createClient } from '@/lib/supabase/server'
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }))

it.each([GET, PUT, DELETE])(
  'denies the MFA-incomplete admin exception for another member',
  async handler => {
    const account = {
      id: 'admin-id',
      role: 'admin',
      assuranceLevel: 'aal1',
      artistIds: [],
      email: 'admin@example.test',
      displayName: 'Admin',
    }
    jest.mocked(auth).mockResolvedValue({ userId: account.id, account: account as any })
    jest.mocked(getAccount).mockResolvedValue(account as any)
    const update = jest.fn()
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: { id: 'other-member', user_id: 'other-account' }, error: null }),
      update,
    }
    jest.mocked(createClient).mockResolvedValue({ from: () => chain } as any)
    const request = new NextRequest('https://asca.example/api/members/other-member', {
      method: handler === GET ? 'GET' : handler === PUT ? 'PUT' : 'DELETE',
      ...(handler === PUT ? { body: JSON.stringify({ first_name_ko: 'blocked' }) } : {}),
    })
    const result = await handler(request, { params: Promise.resolve({ id: 'other-member' }) })
    expect(result.status).toBe(403)
    expect(update).not.toHaveBeenCalled()
  }
)

it('does not allow a member to set their own paid tier or approval status', async () => {
  const account = { id: 'member-account', role: 'member', assuranceLevel: 'aal1', artistIds: [] }
  jest.mocked(auth).mockResolvedValue({ userId: account.id, account: account as any })
  jest.mocked(getAccount).mockResolvedValue(account as any)
  jest.mocked(createClient).mockClear()
  const response = await PUT(
    new NextRequest('https://asca.example/api/members/self', {
      method: 'PUT',
      body: JSON.stringify({ membership_status: 'active', membership_level_id: 'premium' }),
    }),
    { params: Promise.resolve({ id: 'self' }) }
  )
  expect(response.status).toBe(403)
})

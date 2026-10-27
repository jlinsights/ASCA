/** @jest-environment node */
import MyApplicationsPage from '../page'
import { MyApplicationsClient } from '../applications-client'
import { getAccount } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
jest.mock('@/lib/auth/server', () => ({ getAccount: jest.fn() }))
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
  useRouter: jest.fn(),
}))
beforeEach(() => jest.clearAllMocks())
it('redirects a signed-out visitor before the application UI is rendered', async () => {
  jest.mocked(getAccount).mockResolvedValue(null)
  await expect(MyApplicationsPage()).rejects.toThrow('NEXT_REDIRECT')
  expect(redirect).toHaveBeenCalledWith('/sign-in?next=/profile/applications')
})
it.each(['member', 'admin'])('admits an authenticated unlinked %s account', async role => {
  jest.mocked(getAccount).mockResolvedValue({ id: 'fixture-account', role, artistIds: [] } as any)
  expect((await MyApplicationsPage()).type).toBe(MyApplicationsClient)
  expect(redirect).not.toHaveBeenCalled()
})
it('propagates service failure instead of claiming the visitor is signed out', async () => {
  jest.mocked(getAccount).mockRejectedValue(new Error('AUTH_UNAVAILABLE'))
  await expect(MyApplicationsPage()).rejects.toThrow('AUTH_UNAVAILABLE')
  expect(redirect).not.toHaveBeenCalled()
})

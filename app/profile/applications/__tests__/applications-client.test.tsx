import { act, render, screen, waitFor } from '@testing-library/react'
import { MyApplicationsClient } from '../applications-client'
import { useAccount } from '@/components/auth/session-provider'
import { fetchMyApplications } from '@/lib/api/contests'
const mockRouter = { replace: jest.fn() }
jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }))
jest.mock('@/components/auth/session-provider', () => ({ useAccount: jest.fn() }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/lib/api/contests', () => ({
  fetchMyApplications: jest.fn(),
  withdrawApplication: jest.fn(),
}))
const account = (artistIds: string[], overrides = {}) => ({
  isLoaded: true,
  isSignedIn: true,
  error: false,
  refresh: jest.fn(),
  user: { id: 'account-a', artistIds },
  ...overrides,
})
beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useAccount).mockReturnValue(account([]) as any)
  jest.mocked(fetchMyApplications).mockResolvedValue({ data: [], error: null })
})
it('keeps a signed-in, unlinked member on the page and offers linking help', async () => {
  render(<MyApplicationsClient />)
  expect(await screen.findByText('authNativeUnlinked')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'claimTitle' })).toHaveAttribute('href', '/profile')
  expect(screen.getByRole('link', { name: /0502/ })).toHaveAttribute('href', 'tel:+8250255508700')
  expect(mockRouter.replace).not.toHaveBeenCalled()
  expect(fetchMyApplications).not.toHaveBeenCalled()
})
it('waits for authentication and never flashes empty application statistics', () => {
  jest
    .mocked(useAccount)
    .mockReturnValue(account([], { isLoaded: false, isSignedIn: false, user: null }) as any)
  render(<MyApplicationsClient />)
  expect(mockRouter.replace).not.toHaveBeenCalled()
  expect(screen.queryByText('총 신청')).not.toBeInTheDocument()
})
it('redirects only an actually signed-out account without rendering the application screen', async () => {
  jest.mocked(useAccount).mockReturnValue(account([], { isSignedIn: false, user: null }) as any)
  render(<MyApplicationsClient />)
  await waitFor(() =>
    expect(mockRouter.replace).toHaveBeenCalledWith('/sign-in?next=/profile/applications')
  )
  expect(screen.queryByText('총 신청')).not.toBeInTheDocument()
})
it('shows an authentication service error without treating it as logout', () => {
  jest
    .mocked(useAccount)
    .mockReturnValue(account([], { error: true, isSignedIn: false, user: null }) as any)
  render(<MyApplicationsClient />)
  expect(screen.getByRole('alert')).toHaveTextContent('authNativeSessionError')
  expect(mockRouter.replace).not.toHaveBeenCalled()
})
it('loads every linked artist and does not redirect on a data service failure', async () => {
  jest.mocked(useAccount).mockReturnValue(account(['artist-a', 'artist-b']) as any)
  jest.mocked(fetchMyApplications).mockResolvedValue({ data: null, error: 'unavailable' })
  render(<MyApplicationsClient />)
  expect(await screen.findByText(/신청 내역을 불러오는데 실패/)).toBeInTheDocument()
  expect(fetchMyApplications).toHaveBeenCalledWith('artist-a')
  expect(fetchMyApplications).toHaveBeenCalledWith('artist-b')
  expect(mockRouter.replace).not.toHaveBeenCalled()
})
it('ignores a late personal-data response after the account changes', async () => {
  let finish!: (value: { data: never[]; error: null }) => void
  jest.mocked(useAccount).mockReturnValue(account(['artist-a']) as any)
  jest.mocked(fetchMyApplications).mockReturnValue(
    new Promise(resolve => {
      finish = resolve
    })
  )
  const { rerender } = render(<MyApplicationsClient />)
  jest
    .mocked(useAccount)
    .mockReturnValue(account([], { user: { id: 'account-b', artistIds: [] } }) as any)
  rerender(<MyApplicationsClient />)
  await act(async () => {
    finish({ data: [], error: null })
  })
  expect(await screen.findByText('authNativeUnlinked')).toBeInTheDocument()
  expect(screen.queryByText('총 신청')).not.toBeInTheDocument()
})

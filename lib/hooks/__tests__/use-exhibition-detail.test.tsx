import { renderHook, waitFor } from '@testing-library/react'
import { useExhibitionDetail } from '../use-exhibition-detail'

jest.mock('@/lib/supabase', () => ({ supabase: {}, createClient: () => ({}) }))
jest.mock('@/lib/api/exhibitions', () => ({
  fetchExhibitionFullById: jest.fn(),
  deleteExhibition: jest.fn(),
}))
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({ isLoaded: true, isSignedIn: false, user: null })),
}))

const { fetchExhibitionFullById } = jest.requireMock('@/lib/api/exhibitions')

describe('useExhibitionDetail', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns static exhibition for ID "3" without fetching', async () => {
    const { result } = renderHook(() => useExhibitionDetail('3'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exhibition?.id).toBe('3')
    expect(fetchExhibitionFullById).not.toHaveBeenCalled()
  })

  it('fetches dynamic exhibition by ID', async () => {
    fetchExhibitionFullById.mockResolvedValue({
      data: { id: 'dyn', title: 'Dynamic', artworks: [], artists: [] },
      error: null,
    })
    const { result } = renderHook(() => useExhibitionDetail('dyn'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exhibition?.id).toBe('dyn')
    expect(fetchExhibitionFullById).toHaveBeenCalledWith('dyn')
  })

  it('sets error on fetch failure', async () => {
    fetchExhibitionFullById.mockResolvedValue({ data: null, error: 'Not found' })
    const { result } = renderHook(() => useExhibitionDetail('nope'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Not found')
    expect(result.current.exhibition).toBeNull()
  })

  it('isOwner false when user is not signed in', async () => {
    const { result } = renderHook(() => useExhibitionDetail('3'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isOwner).toBe(false)
  })
})

import { fetchArtistProfile, updateArtistProfile } from '../profiles'
import { getSupabaseClient } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({ getSupabaseClient: jest.fn() }))
const fetchMock = jest.fn()
const originalFetch = global.fetch
beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

it('uses the same-origin authenticated server route instead of a browser DB write', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ data: { id: 'artist-id', nameEn: 'New' } }),
  })
  expect(await updateArtistProfile('artist-id', { nameEn: 'New' })).toEqual({
    data: { id: 'artist-id', nameEn: 'New' },
    error: null,
  })
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/profile/artists/artist-id',
    expect.objectContaining({
      method: 'PATCH',
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify({ nameEn: 'New' }),
    })
  )
  expect(getSupabaseClient).not.toHaveBeenCalled()
})

it('uses the private editor route for hidden owned profiles', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ data: { id: 'artist-id', visibility: 'hidden' } }),
  })
  expect((await fetchArtistProfile('artist-id')).data?.visibility).toBe('hidden')
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/profile/artists/artist-id',
    expect.objectContaining({ method: 'GET', credentials: 'same-origin' })
  )
  expect(getSupabaseClient).not.toHaveBeenCalled()
})

it('propagates rejected ownership and cannot report a successful save', async () => {
  fetchMock.mockResolvedValue({
    ok: false,
    status: 403,
    json: async () => ({ error: 'Not linked', code: 'FORBIDDEN' }),
  })
  expect(await updateArtistProfile('other-artist', { bio: 'new' })).toEqual({
    data: null,
    error: { message: 'Not linked', code: 'FORBIDDEN', status: 403 },
  })
})

it('returns a failure for an unavailable API rather than throwing into the form', async () => {
  fetchMock.mockRejectedValue(new Error('Network failed'))
  expect(await updateArtistProfile('artist', { bio: 'new' })).toMatchObject({
    data: null,
    error: { code: 'PROFILE_UNAVAILABLE' },
  })
})

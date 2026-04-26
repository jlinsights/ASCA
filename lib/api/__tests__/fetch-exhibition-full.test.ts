// supabase 모듈은 ESM source라 jest transform에서 막힘 — mock으로 우회
jest.mock('@/lib/supabase', () => ({
  supabase: {},
  createClient: () => ({}),
}))

import { fetchExhibitionFullById } from '../exhibitions'

// fetch mock
const originalFetch = global.fetch
afterEach(() => {
  global.fetch = originalFetch
})

describe('fetchExhibitionFullById', () => {
  it('returns data on 200 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { id: 'x', title: 'Test', artworks: [], artists: [] },
      }),
    }) as any
    const { data, error } = await fetchExhibitionFullById('x')
    expect(error).toBeNull()
    expect(data?.id).toBe('x')
  })

  it('returns null + error message on 404', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    }) as any
    const { data, error } = await fetchExhibitionFullById('nope')
    expect(data).toBeNull()
    expect(error).toMatch(/not found/i)
  })

  it('handles network errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network down'))
    const { data, error } = await fetchExhibitionFullById('x')
    expect(data).toBeNull()
    expect(error).toMatch(/network/i)
  })
})

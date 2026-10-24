/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET } from '@/app/auth/callback/route'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }))
const exchange = jest.fn()
beforeEach(() => {
  jest.mocked(createClient).mockResolvedValue({ auth: { exchangeCodeForSession: exchange } } as any)
  exchange.mockReset().mockResolvedValue({ error: null })
})

it('exchanges a PKCE code using writable cookies and keeps the recovery destination', async () => {
  const result = await GET(
    new NextRequest('https://asca.example/auth/callback?code=valid&next=/reset-password')
  )
  expect(createClient).toHaveBeenCalledWith({ writable: true })
  expect(exchange).toHaveBeenCalledWith('valid')
  expect(result.headers.get('location')).toBe('https://asca.example/reset-password')
  expect(result.headers.get('cache-control')).toContain('no-store')
})

it.each(['https://attacker.example', '//attacker.example', '/%252fattacker.example'])(
  'rejects an external return URL: %s',
  async next => {
    const result = await GET(
      new NextRequest(
        'https://asca.example/auth/callback?code=valid&next=' + encodeURIComponent(next)
      )
    )
    expect(result.headers.get('location')).toBe('https://asca.example/profile')
  }
)

it.each(['', '?error=access_denied', '?code=expired'])(
  'handles missing, rejected and consumed codes without leaking them: %s',
  async suffix => {
    exchange.mockResolvedValue({ error: { code: 'flow_state_not_found', message: 'secret-code' } })
    const result = await GET(new NextRequest('https://asca.example/auth/callback' + suffix))
    expect(result.headers.get('location')).toBe('https://asca.example/sign-in?error=callback')
  }
)

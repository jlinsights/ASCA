/** @jest-environment node */
import { NextRequest, NextResponse } from 'next/server'
import { proxy } from '@/proxy'
import { refreshSupabaseSession } from '../session'
jest.mock('../session', () => ({ refreshSupabaseSession: jest.fn() }))
jest.mock('@/lib/security/audit-logger', () => ({
  auditLogger: { logCSRFOriginMismatch: jest.fn() },
}))

beforeEach(() =>
  jest.mocked(refreshSupabaseSession).mockResolvedValue({
    user: null,
    applySession: (response = NextResponse.next()) => response,
  })
)

it('does not allow a Playwright URL to disable authentication', async () => {
  process.env.PLAYWRIGHT_BASE_URL = 'https://asca.example'
  try {
    const response = await proxy(new NextRequest('https://asca.example/admin'))
    const destination = new URL(response.headers.get('location')!)
    expect(destination.pathname).toBe('/sign-in')
    expect(destination.searchParams.get('next')).toBe('/admin')
  } finally {
    delete process.env.PLAYWRIGHT_BASE_URL
  }
})

it.each(['/members', '/members/record', '/members/apply'])(
  'keeps main branch member-route protection: %s',
  async path => {
    const response = await proxy(new NextRequest('https://asca.example' + path))
    expect(new URL(response.headers.get('location')!).pathname).toBe('/sign-in')
  }
)

it('rejects cross-site mutations before any session operation', async () => {
  jest.mocked(refreshSupabaseSession).mockClear()
  const response = await proxy(
    new NextRequest('http://localhost:3000/api/auth/example', {
      method: 'POST',
      headers: { origin: 'https://attacker.example' },
    })
  )
  expect(response.status).toBe(403)
  expect(refreshSupabaseSession).not.toHaveBeenCalled()
})

it('preserves PKCE verification cookies for callbacks with an expired existing session', async () => {
  jest.mocked(refreshSupabaseSession).mockClear()
  jest.mocked(refreshSupabaseSession).mockRejectedValueOnce(new Error('Expired session'))
  const request = new NextRequest('https://asca.example/auth/callback?code=valid-code', {
    headers: { cookie: 'sb-test-auth-token=expired; sb-test-auth-token-code-verifier=verifier' },
  })
  const response = await proxy(request)
  expect(response.status).toBe(200)
  expect(refreshSupabaseSession).not.toHaveBeenCalled()
  expect(request.cookies.get('sb-test-auth-token-code-verifier')?.value).toBe('verifier')
  expect(response.cookies.getAll()).toEqual([])
  expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  expect(response.headers.get('Vary')).toBe('Cookie')
  jest.mocked(refreshSupabaseSession).mockReset()
})

it.each(['asca-main.vercel.app', 'asca-main-git-auth-jlinsights-projects.vercel.app'])(
  'preserves PR #120 Origin acceptance through the native auth proxy: %s',
  async host => {
    const keys = [
      'NEXT_PUBLIC_APP_URL',
      'VERCEL_URL',
      'VERCEL_PROJECT_PRODUCTION_URL',
      'VERCEL_BRANCH_URL',
      'CSRF_ALLOWED_ORIGINS',
      'CSRF_ENFORCE_HTTPS',
    ] as const
    const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]))
    try {
      delete process.env.NEXT_PUBLIC_APP_URL
      delete process.env.CSRF_ALLOWED_ORIGINS
      process.env.VERCEL_URL = 'asca-main-build-jlinsights-projects.vercel.app'
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'asca-main.vercel.app'
      process.env.VERCEL_BRANCH_URL = 'asca-main-git-auth-jlinsights-projects.vercel.app'
      process.env.CSRF_ENFORCE_HTTPS = 'true'
      jest.mocked(refreshSupabaseSession).mockClear()
      const response = await proxy(
        new NextRequest(`https://${host}/api/auth/example`, {
          method: 'POST',
          headers: { origin: `https://${host}` },
        })
      )
      expect(response.status).toBe(200)
      expect(refreshSupabaseSession).toHaveBeenCalledTimes(1)
    } finally {
      for (const key of keys) {
        if (saved[key] === undefined) delete process.env[key]
        else process.env[key] = saved[key]
      }
    }
  }
)

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

describe('언어 주소', () => {
  it('/en/history 는 접두사를 뗀 주소와 언어를 세션 갱신에 넘긴다', async () => {
    jest.mocked(refreshSupabaseSession).mockClear()
    await proxy(new NextRequest('https://asca.example/en/history'))
    const [, options] = jest.mocked(refreshSupabaseSession).mock.calls[0]!
    expect(options?.language).toBe('en')
    expect(options?.rewrite?.pathname).toBe('/history')
  })

  it('언어 주소로 들어오면 그 언어를 쿠키로 기억한다 — 본문의 한국어 주소 링크를 눌러도 언어를 잃지 않게', async () => {
    const response = await proxy(new NextRequest('https://asca.example/en'))
    expect(response.cookies.get('asca-lang')?.value).toBe('en')
    const other = await proxy(
      new NextRequest('https://asca.example/ja/history', { headers: { cookie: 'asca-lang=en' } })
    )
    expect(other.cookies.get('asca-lang')?.value).toBe('ja')
  })

  it('이미 같은 언어 쿠키면 다시 쓰지 않고, 한국어 주소는 쿠키를 건드리지 않는다', async () => {
    const same = await proxy(
      new NextRequest('https://asca.example/en/history', { headers: { cookie: 'asca-lang=en' } })
    )
    expect(same.cookies.get('asca-lang')).toBeUndefined()
    const korean = await proxy(new NextRequest('https://asca.example/history'))
    expect(korean.cookies.get('asca-lang')).toBeUndefined()
  })

  it('한국어 주소는 rewrite·언어 없이 넘긴다', async () => {
    jest.mocked(refreshSupabaseSession).mockClear()
    await proxy(new NextRequest('https://asca.example/history'))
    expect(jest.mocked(refreshSupabaseSession).mock.calls[0]![1]).toEqual({})
  })

  it('/en/profile 은 한국어 주소로 먼저 보낸다 — 접두사로 로그인 검사를 우회하지 못한다', async () => {
    const response = await proxy(new NextRequest('https://asca.example/en/profile'))
    expect(response.status).toBe(307)
    expect(new URL(response.headers.get('location')!).pathname).toBe('/profile')
  })

  it('첫 방문 홈 자동 이동에만 표시 쿠키를 단다 — 다른 리다이렉트에는 없다', async () => {
    const first = await proxy(
      new NextRequest('https://asca.example/', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
          'accept-language': 'ja-JP',
        },
      })
    )
    expect(first.status).toBe(307)
    expect(new URL(first.headers.get('location')!).pathname).toBe('/ja')
    expect(first.cookies.get('asca-lang-auto')?.value).toBe('1')
    const other = await proxy(new NextRequest('https://asca.example/en/profile'))
    expect(other.cookies.get('asca-lang-auto')).toBeUndefined()
  })
})

/** @jest-environment node */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { refreshSupabaseSession } from '../session'

jest.mock('@supabase/ssr', () => ({ createServerClient: jest.fn() }))

it('uses Secure cookies in production', async () => {
  const previous = process.env.NODE_ENV
  Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
  try {
    jest.mocked(createServerClient).mockReturnValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as any)
    await refreshSupabaseSession(new NextRequest('https://asca.example/profile'))
    expect(jest.mocked(createServerClient).mock.calls.at(-1)?.[2]).toMatchObject({
      cookieOptions: { secure: true },
    })
  } finally {
    Object.defineProperty(process.env, 'NODE_ENV', { value: previous, writable: true })
  }
})

it('preserves every refreshed cookie on requests, normal responses and redirects', async () => {
  jest.mocked(createServerClient).mockImplementation(
    (_url, _key, options: any) =>
      ({
        auth: {
          getUser: async () => {
            options.cookies.setAll([
              {
                name: 'sb-session.0',
                value: 'fresh-0',
                options: { httpOnly: true, sameSite: 'lax' },
              },
            ])
            options.cookies.setAll([
              { name: 'sb-session.1', value: 'fresh-1', options: { httpOnly: true } },
            ])
            return { data: { user: { id: 'native-id' } }, error: null }
          },
        },
      }) as any
  )
  const request = new NextRequest('https://asca.example/profile')
  const { user, applySession } = await refreshSupabaseSession(request)
  expect(user?.id).toBe('native-id')
  expect(request.cookies.get('sb-session.0')?.value).toBe('fresh-0')
  expect(request.cookies.get('sb-session.1')?.value).toBe('fresh-1')
  for (const response of [
    applySession(),
    applySession(NextResponse.redirect('https://asca.example/sign-in')),
  ]) {
    expect(response.cookies.get('sb-session.0')).toMatchObject({ value: 'fresh-0', httpOnly: true })
    expect(response.cookies.get('sb-session.1')?.value).toBe('fresh-1')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('vary')).toContain('Cookie')
  }
  expect(applySession().headers.get('x-middleware-request-cookie')).toContain('fresh-1')
})

it('propagates expired cookie removal even on a signed-out redirect', async () => {
  jest.mocked(createServerClient).mockImplementation(
    (_url, _key, options: any) =>
      ({
        auth: {
          getUser: async () => {
            options.cookies.setAll([{ name: 'sb-session', value: '', options: { maxAge: 0 } }])
            return { data: { user: null }, error: { name: 'AuthSessionMissingError' } }
          },
        },
      }) as any
  )
  const result = await refreshSupabaseSession(new NextRequest('https://asca.example/profile'))
  expect(result.user).toBeNull()
  expect(
    result
      .applySession(NextResponse.redirect('https://asca.example/sign-in'))
      .cookies.get('sb-session')
  ).toMatchObject({ value: '', maxAge: 0 })
})

it('fails closed on auth transport failure', async () => {
  jest.mocked(createServerClient).mockReturnValue({
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: { name: 'AuthRetryableFetchError' },
      }),
    },
  } as any)
  await expect(
    refreshSupabaseSession(new NextRequest('https://asca.example/profile'))
  ).rejects.toMatchObject({ status: 503 })
})

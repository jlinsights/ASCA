import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AuthForm } from '../auth-form'
import { LanguageProvider } from '@/contexts/language-context'
import { createAuthBrowserClient } from '@/lib/auth/supabase/browser'
import { nativeAuthTranslations } from '@/lib/i18n/translations/native-auth'

jest.mock('@/lib/auth/supabase/browser', () => ({ createAuthBrowserClient: jest.fn() }))
const signup = jest.fn()
const reset = jest.fn()
const signin = jest.fn()
beforeEach(() => {
  window.localStorage.clear()
  signup.mockReset().mockResolvedValue({ data: { session: null }, error: null })
  reset.mockReset().mockResolvedValue({ error: null })
  signin.mockReset().mockResolvedValue({ error: { code: 'invalid_credentials' } })
  jest.mocked(createAuthBrowserClient).mockReturnValue({
    auth: { signUp: signup, resetPasswordForEmail: reset, signInWithPassword: signin },
  } as any)
})

function show(mode: 'sign-in' | 'sign-up' | 'forgot' | 'reset', language = 'ko') {
  window.localStorage.setItem('asca-language', language)
  return render(
    <LanguageProvider>
      <AuthForm mode={mode} />
    </LanguageProvider>
  )
}
function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

it('sends only user-editable signup metadata, with explicit consent and a local callback', async () => {
  const { container } = show('sign-up')
  type('이름', '홍길동')
  type('이메일', 'artist@example.test')
  type('비밀번호', 'a-secure-passphrase')
  type('비밀번호 확인', 'a-secure-passphrase')
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.submit(container.querySelector('form')!)
  await waitFor(() => expect(signup).toHaveBeenCalled())
  const input = signup.mock.calls[0][0]
  expect(input.options.data).toEqual({
    full_name: '홍길동',
    locale: 'ko',
    terms_version: '2026-11-01',
  })
  expect(new URL(input.options.emailRedirectTo).pathname).toBe('/auth/callback')
  expect(input.options.data).not.toHaveProperty('role')
  expect(await screen.findByRole('status')).toHaveTextContent('메일')
})

it('does not submit mismatched passwords or absent consent', async () => {
  const { container } = show('sign-up')
  type('비밀번호', 'a-secure-passphrase')
  type('비밀번호 확인', 'different-passphrase')
  fireEvent.submit(container.querySelector('form')!)
  expect(await screen.findByRole('alert')).toHaveTextContent('일치')
  type('비밀번호 확인', 'a-secure-passphrase')
  fireEvent.submit(container.querySelector('form')!)
  expect(signup).not.toHaveBeenCalled()
})

it('uses a recovery callback and a neutral account-existence message', async () => {
  const { container } = show('forgot')
  type('이메일', 'artist@example.test')
  fireEvent.submit(container.querySelector('form')!)
  await waitFor(() => expect(reset).toHaveBeenCalled())
  const callback = new URL(reset.mock.calls[0][1].redirectTo)
  expect(callback.searchParams.get('next')).toBe('/reset-password')
  expect(await screen.findByRole('status')).toHaveTextContent('계정이면')
})

it('shows a translated credential error rather than exposing the provider response', async () => {
  const { container } = show('sign-in', 'en')
  await screen.findByLabelText('Email')
  type('Email', 'artist@example.test')
  type('Password', 'wrong-password')
  fireEvent.submit(container.querySelector('form')!)
  expect(await screen.findByRole('alert')).toHaveTextContent('Check your email and password.')
})

it('maintains the same native auth keys across all four languages', () => {
  const keys = Object.keys(nativeAuthTranslations.ko!).sort()
  for (const language of ['en', 'ja', 'zh'])
    expect(Object.keys(nativeAuthTranslations[language]!).sort()).toEqual(keys)
})

it('requires registered MFA before changing a recovered account password', async () => {
  const updateUser = jest.fn()
  jest.mocked(createAuthBrowserClient).mockReturnValue({
    auth: {
      getUser: async () => ({ data: { user: { id: 'recovered-user' } }, error: null }),
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({
          data: { currentLevel: 'aal1', nextLevel: 'aal2' },
          error: null,
        }),
      },
      updateUser,
    },
  } as any)
  const { container } = show('reset')
  type('비밀번호', 'a-secure-passphrase')
  type('비밀번호 확인', 'a-secure-passphrase')
  fireEvent.submit(container.querySelector('form')!)
  expect(await screen.findByRole('link', { name: /먼저 2단계/ })).toHaveAttribute(
    'href',
    '/auth/mfa?next=/reset-password'
  )
  expect(updateUser).not.toHaveBeenCalled()
})

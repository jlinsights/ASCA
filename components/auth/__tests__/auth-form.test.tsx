import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  window.sessionStorage.clear()
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
  type('이름', '가상 회원')
  type('이메일', 'member@example.test')
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
  expect(await screen.findByRole('alert')).toHaveTextContent('Passwords from our previous website')
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

it('passes the entered email to recovery and offers labelled password visibility', () => {
  show('sign-in')
  type('이메일', 'returning@example.test')
  expect(screen.getByRole('link', { name: '계정 만들기 →' })).toHaveAttribute(
    'href',
    '/sign-up?email=returning%40example.test'
  )
  const recovery = screen.getByRole('link', { name: '비밀번호 새로 만들기 →' })
  expect(recovery).toHaveAttribute('href', '/forgot-password?email=returning%40example.test')
  const password = screen.getByLabelText('비밀번호', { exact: true })
  expect(password).toHaveAttribute('type', 'password')
  fireEvent.click(screen.getByRole('button', { name: '보기 — 비밀번호' }))
  expect(password).toHaveAttribute('type', 'text')
  expect(screen.getByRole('button', { name: '숨기기 — 비밀번호' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
})

it('replaces the request form with an address, mail steps and a resend cooldown', async () => {
  const { container } = show('forgot')
  type('이메일', 'returning@example.test')
  fireEvent.submit(container.querySelector('form')!)
  const title = await screen.findByRole('heading', { name: '안내 메일을 확인해 주세요' })
  expect(title).toHaveFocus()
  expect(container.querySelector('form')).toBeNull()
  expect(screen.getByText('returning@example.test')).toBeVisible()
  expect(screen.getByText(/링크는 1시간/)).toBeVisible()
  expect(screen.getByText(/네이버:/)).toBeInTheDocument()
  expect(screen.getByText(/다음:/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /안내 메일 다시 보내기/, hidden: true })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: '이메일 주소 바꾸기' }))
  expect(screen.getByLabelText('이메일')).toHaveValue('returning@example.test')
})

it('guides an obfuscated existing signup to recovery without treating it as a failed signup', async () => {
  signup.mockResolvedValue({ data: { user: { identities: [] } }, error: null })
  const { container } = show('sign-up')
  type('이름', '가상 회원')
  type('이메일', 'existing@example.test')
  type('비밀번호', 'a-secure-passphrase')
  type('비밀번호 확인', 'a-secure-passphrase')
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.submit(container.querySelector('form')!)
  expect(await screen.findByRole('status')).toHaveTextContent('이미 계정이 있는 이메일이라면')
  expect(screen.queryByRole('alert')).toBeNull()
})

it('keeps typed values when the email service fails', async () => {
  reset.mockResolvedValue({
    error: { code: 'unexpected_failure', message: 'private provider output' },
  })
  const { container } = show('forgot')
  type('이메일', 'retry@example.test')
  fireEvent.submit(container.querySelector('form')!)
  expect(await screen.findByRole('alert')).toHaveTextContent('1~2분')
  expect(screen.getByLabelText('이메일')).toHaveValue('retry@example.test')
  expect(screen.queryByText(/private provider output/)).toBeNull()
})

it('keeps the requested address unchanged while waiting for the mail service', async () => {
  let finish!: (value: { error: null }) => void
  reset.mockImplementation(
    () =>
      new Promise(resolve => {
        finish = resolve
      })
  )
  const user = userEvent.setup()
  const { container } = show('forgot')
  type('이메일', 'requested@example.test')
  fireEvent.submit(container.querySelector('form')!)
  const input = screen.getByLabelText('이메일')
  expect(input).toHaveAttribute('readonly')
  await user.type(input, 'changed@example.test')
  expect(input).toHaveValue('requested@example.test')
  await act(async () => finish({ error: null }))
  expect(await screen.findByText('requested@example.test')).toBeVisible()
  expect(reset.mock.calls[0][0]).toBe('requested@example.test')
})

it('does not send a second request until the full cooldown elapses', async () => {
  jest.useFakeTimers()
  try {
    const { container } = show('forgot')
    type('이메일', 'cooldown@example.test')
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!)
    })
    const again = screen.getByRole('button', { name: /안내 메일 다시 보내기/, hidden: true })
    fireEvent.click(again)
    expect(reset).toHaveBeenCalledTimes(1)
    act(() => jest.advanceTimersByTime(60_000))
    expect(again).not.toBeDisabled()
    await act(async () => {
      fireEvent.click(again)
    })
    expect(reset).toHaveBeenCalledTimes(2)
  } finally {
    jest.useRealTimers()
  }
})

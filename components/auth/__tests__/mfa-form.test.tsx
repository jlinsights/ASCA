import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MfaForm } from '../mfa-form'
import { LanguageProvider } from '@/contexts/language-context'
import { createAuthBrowserClient } from '@/lib/auth/supabase/browser'
jest.mock('@/lib/auth/supabase/browser', () => ({ createAuthBrowserClient: jest.fn() }))
const listFactors = jest.fn()
const enroll = jest.fn()
const verify = jest.fn()
beforeEach(() => {
  window.localStorage.setItem('asca-language', 'ko')
  listFactors.mockReset().mockResolvedValue({
    data: { totp: [{ id: 'verified-factor', status: 'verified' }], all: [] },
    error: null,
  })
  enroll.mockReset().mockResolvedValue({
    data: {
      id: 'new-factor',
      totp: {
        qr_code: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg"></svg>',
        secret: 'TEST_SETUP_KEY',
      },
    },
    error: null,
  })
  verify.mockReset().mockResolvedValue({ error: { code: 'mfa_verification_failed' } })
  jest
    .mocked(createAuthBrowserClient)
    .mockReturnValue({ auth: { mfa: { listFactors, enroll, challengeAndVerify: verify } } } as any)
})

it('uses the verified factor for a fresh challenge and preserves errors for retry', async () => {
  const { container } = render(
    <LanguageProvider>
      <MfaForm />
    </LanguageProvider>
  )
  const input = await screen.findByLabelText('보안 앱의 6자리 숫자')
  fireEvent.change(input, { target: { value: '123456' } })
  fireEvent.submit(container.querySelector('form')!)
  await waitFor(() =>
    expect(verify).toHaveBeenCalledWith({ factorId: 'verified-factor', code: '123456' })
  )
  expect(await screen.findByRole('alert')).toHaveTextContent('코드')
  expect(enroll).not.toHaveBeenCalled()
})

it('enrolls TOTP explicitly and displays a QR image without injecting SVG markup', async () => {
  listFactors.mockResolvedValue({ data: { totp: [], all: [] }, error: null })
  render(
    <LanguageProvider>
      <MfaForm />
    </LanguageProvider>
  )
  const button = await screen.findByRole('button', { name: '휴대전화 보안 앱 연결' })
  await waitFor(() => expect(button).not.toBeDisabled())
  fireEvent.click(button)
  expect(await screen.findByText('TEST_SETUP_KEY')).toBeInTheDocument()
  expect(screen.getByRole('img')).toHaveAttribute(
    'src',
    'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg"></svg>'
  )
  expect(enroll).toHaveBeenCalledWith({ factorType: 'totp', issuer: 'ASCA' })
})

import { render, screen, waitFor } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { AuthShell } from '../auth-shell'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill: _fill, priority: _priority, ...props }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}))

function renderShell(variant: 'sign-in' | 'sign-up', lang = 'ko') {
  window.localStorage.setItem('asca-language', lang)
  return render(
    <LanguageProvider>
      <AuthShell variant={variant}>
        <div data-testid='clerk-widget' />
      </AuthShell>
    </LanguageProvider>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('AuthShell', () => {
  it('로그인: 제목·위젯·작품 캡션을 보여 준다', async () => {
    renderShell('sign-in')
    expect(
      await screen.findByRole('heading', { level: 1, name: '다시 오셨군요' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('clerk-widget')).toBeInTheDocument()
    expect(screen.getByText('立春大吉 建陽多慶')).toBeInTheDocument()
  })

  it('회원가입: 협회 표어를 캡션으로 쓴다', async () => {
    renderShell('sign-up')
    expect(
      await screen.findByRole('heading', { level: 1, name: '협회와 함께 쓰는 글씨' })
    ).toBeInTheDocument()
    expect(screen.getByText('法古創新 · 人書俱老')).toBeInTheDocument()
  })

  it('반대편 화면으로 가는 링크와 약관 링크가 있다', async () => {
    renderShell('sign-in')
    expect(await screen.findByRole('link', { name: '회원가입' })).toHaveAttribute(
      'href',
      '/sign-up'
    )
    expect(screen.getByRole('link', { name: '이용약관' })).toHaveAttribute(
      'href',
      '/terms-of-service'
    )
    expect(screen.getByRole('link', { name: '개인정보처리방침' })).toHaveAttribute(
      'href',
      '/privacy-policy'
    )
  })

  it('작품 패널은 캡션으로 이름이 붙는다', async () => {
    renderShell('sign-in')
    const figure = await screen.findByRole('figure')
    expect(figure).toHaveAccessibleName(/立春大吉/)
  })

  it.each(['en', 'ja', 'zh'])('%s: 셸 문구에 한글이 없다', async lang => {
    const { container } = renderShell('sign-up', lang)
    // 저장된 언어는 마운트 뒤 effect 로 적용되므로 전환이 끝날 때까지 기다린다.
    await waitFor(() => expect(container.textContent).not.toMatch(/[가-힣]/))
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent('')
  })
})

// Clerk 회원가입 폼의 이름 줄을 흉내 낸다 — Clerk 는 항상 이름→성 순서로 그린다.
function ClerkNameRow() {
  return (
    <div className='cl-formFieldRow cl-formFieldRow__name'>
      <div className='cl-formField cl-formField__firstName'>
        <input name='firstName' aria-label='given' />
      </div>
      <div className='cl-formField cl-formField__lastName'>
        <input name='lastName' aria-label='family' />
      </div>
    </div>
  )
}

const fieldOrder = (root: HTMLElement) =>
  [...root.querySelectorAll('.cl-formFieldRow__name input')].map(el => el.getAttribute('name'))

function renderSignUpWith(children: React.ReactNode, lang: string) {
  window.localStorage.setItem('asca-language', lang)
  return render(
    <LanguageProvider>
      <AuthShell variant='sign-up'>{children}</AuthShell>
    </LanguageProvider>
  )
}

describe('AuthShell 이름 칸 순서', () => {
  // 한·중·일은 성이 먼저다. DOM 순서를 바꾸므로 화면 순서와 Tab 순서가 함께 바뀐다.
  it.each(['ko', 'ja', 'zh'])('%s: 성 칸이 이름 칸보다 앞선다', async lang => {
    const { container } = renderSignUpWith(<ClerkNameRow />, lang)
    await waitFor(() => expect(fieldOrder(container)).toEqual(['lastName', 'firstName']))
  })

  // 첫 렌더는 기본 언어(ko)라 성→이름으로 바뀌었다가, 저장된 en 이 적용되면 되돌아와야 한다.
  it('en: 언어가 바뀌면 이름→성 순서로 되돌린다', async () => {
    const { container } = renderSignUpWith(<ClerkNameRow />, 'en')
    await waitFor(() => expect(document.documentElement.lang).toBe('en'))
    await waitFor(() => expect(fieldOrder(container)).toEqual(['firstName', 'lastName']))
  })

  it('Clerk 위젯이 나중에 그려져도 순서를 맞춘다', async () => {
    const { container, rerender } = renderSignUpWith(null, 'ko')
    rerender(
      <LanguageProvider>
        <AuthShell variant='sign-up'>
          <ClerkNameRow />
        </AuthShell>
      </LanguageProvider>
    )
    await waitFor(() => expect(fieldOrder(container)).toEqual(['lastName', 'firstName']))
  })
})

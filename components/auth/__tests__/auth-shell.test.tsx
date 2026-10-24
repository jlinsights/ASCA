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
        <div data-testid='auth-form' />
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
    expect(screen.getByTestId('auth-form')).toBeInTheDocument()
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

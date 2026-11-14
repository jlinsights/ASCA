import { fireEvent, render, screen } from '@testing-library/react'
import { AccountView, accountInitial } from '../account-panel'
import type { SupabaseAccount } from '@/lib/auth/supabase/types'

jest.mock('../artist-claim-section', () => ({
  ArtistClaimSection: () => <section aria-label='작가 연결'>claim</section>,
}))
jest.mock('../my-contest-entries', () => ({ MyContestEntries: () => <section>entries</section> }))
jest.mock('../member-help', () => ({ MemberHelp: () => null }))
jest.mock('@/lib/auth/supabase/browser', () => ({ createAuthBrowserClient: jest.fn() }))
jest.mock('@/contexts/language-context', () => {
  const { translations } = jest.requireActual('@/lib/i18n/translations')
  return {
    useLanguage: () => ({ language: 'ko', t: (key: string) => translations.ko[key] || key }),
  }
})

const user = (over: Partial<SupabaseAccount> = {}): SupabaseAccount => ({
  id: 'u1',
  email: 'min@example.com',
  displayName: '민문자',
  locale: 'ko',
  role: 'member',
  assuranceLevel: 'aal1',
  artistIds: [],
  createdAt: '',
  updatedAt: '',
  ...over,
})

function view(
  over: Partial<SupabaseAccount> = {},
  handlers: Partial<Parameters<typeof AccountView>[0]> = {}
) {
  const props = {
    user: user(over),
    passwordUpdated: false,
    busy: false,
    failed: false,
    onSave: jest.fn(),
    onSignOut: jest.fn(),
    onClaimChanged: jest.fn(),
    ...handlers,
  }
  render(<AccountView {...props} />)
  return props
}

describe('accountInitial', () => {
  it('이름 첫 글자, 이름이 없으면 메일 첫 글자(대문자)', () => {
    expect(accountInitial({ displayName: '민문자', email: 'a@b.c' })).toBe('민')
    expect(accountInitial({ displayName: '  ', email: 'min@b.c' })).toBe('M')
  })
})

describe('AccountView', () => {
  it('머리에 이름과 메일, 이름이 없으면 메일을 제목으로', () => {
    view()
    expect(screen.getByRole('heading', { level: 1, name: '민문자' })).toBeInTheDocument()
    expect(screen.getByText('min@example.com')).toBeInTheDocument()
  })

  it('작가가 연결돼 있으면 작품 기록 링크를 단다', () => {
    view({ artistIds: ['a-1'] })
    expect(screen.getByRole('link', { name: '작품 기록하기' })).toHaveAttribute(
      'href',
      '/archive/submit'
    )
    // 회귀(Codex P2): 비공개 작가는 공개 페이지가 404 — 작가 페이지로 바로 잇지 않는다
    expect(screen.queryByRole('link', { name: /작가 페이지/ })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('작가 연결')).not.toBeInTheDocument()
  })

  it('작가가 연결돼 있지 않으면 작가 연결 칸을 보인다', () => {
    view()
    expect(screen.getByLabelText('작가 연결')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '작품 기록하기' })).not.toBeInTheDocument()
  })

  it('이름을 저장하면 공백을 지운 이름으로 onSave', () => {
    const props = view()
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '  민소정  ' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(props.onSave).toHaveBeenCalledWith('민소정')
  })

  it('로그아웃 버튼은 onSignOut 을 부른다', () => {
    const props = view()
    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))
    expect(props.onSignOut).toHaveBeenCalledTimes(1)
  })

  it('관리자만 2단계 확인 링크 — 확인 전이면 MFA 로', () => {
    view({ role: 'admin' })
    expect(screen.getByRole('link', { name: '2단계 확인' })).toHaveAttribute(
      'href',
      '/auth/mfa?next=/admin'
    )
  })

  it('관리자가 아니면 2단계 확인 링크가 없다', () => {
    view()
    expect(screen.queryByRole('link', { name: '2단계 확인' })).not.toBeInTheDocument()
  })

  it('저장 실패를 알린다', () => {
    view({}, { failed: true })
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

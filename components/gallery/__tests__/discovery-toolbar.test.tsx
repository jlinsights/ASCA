import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { DiscoveryToolbar } from '../discovery-toolbar'
import { useLanguage } from '@/contexts/language-context'
import { discoveryCopy } from '../discovery-copy'
import { getArtistFilterOptions } from '@/app/artists/_components/artist-filter-options'
import type { Language } from '@/lib/i18n/types'

jest.mock('@/contexts/language-context', () => ({ useLanguage: jest.fn() }))

function Toolbar({ busy = false }: { busy?: boolean }) {
  const [search, setSearch] = useState('김')
  const [membership, setMembership] = useState('초대작가')
  const [available, setAvailable] = useState(true)
  return (
    <DiscoveryToolbar
      search={search}
      searchLabel='작가 검색'
      onSearchChange={setSearch}
      resultText='작가 12명'
      busy={busy}
      onReset={() => {
        setSearch('')
        setMembership('all')
        setAvailable(false)
      }}
      filters={[
        {
          id: 'membership',
          label: '회원 구분',
          value: membership,
          onChange: setMembership,
          options: [
            { value: 'all', label: '전체' },
            { value: '초대작가', label: '초대작가' },
          ],
        },
      ]}
      extraConditions={
        available
          ? [{ id: 'available', label: '구매 가능', onRemove: () => setAvailable(false) }]
          : []
      }
    />
  )
}

beforeEach(() => {
  jest.mocked(useLanguage).mockReturnValue({ language: 'ko' } as ReturnType<typeof useLanguage>)
})

describe('DiscoveryToolbar', () => {
  it('검색어만 지워도 선택한 필터는 유지된다', async () => {
    const user = userEvent.setup()
    render(<Toolbar />)
    const search = screen.getByRole('searchbox', { name: '작가 검색' })
    await user.click(screen.getByRole('button', { name: '검색어 지우기' }))
    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
    expect(
      screen.getByRole('button', { name: '조건 해제: 회원 구분: 초대작가' })
    ).toBeInTheDocument()
    await user.type(search, '서예')
    expect(search).toHaveValue('서예')
  })

  it('개별 조건 해제는 다른 조건과 검색어를 보존한다', async () => {
    const user = userEvent.setup()
    render(<Toolbar />)
    await user.click(screen.getByRole('button', { name: '조건 해제: 회원 구분: 초대작가' }))
    expect(
      screen.queryByRole('button', { name: '조건 해제: 회원 구분: 초대작가' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '조건 해제: 구매 가능' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('김')
    expect(screen.getByRole('searchbox')).toHaveFocus()
    expect(screen.getByRole('combobox', { name: '회원 구분' })).toHaveTextContent('전체')
  })

  it('전체 초기화로 검색어와 모든 조건을 해제한다', async () => {
    const user = userEvent.setup()
    render(<Toolbar />)
    await user.click(screen.getByRole('button', { name: '전체 초기화' }))
    expect(screen.getByRole('searchbox')).toHaveValue('')
    expect(screen.getByRole('searchbox')).toHaveFocus()
    expect(screen.queryByRole('list', { name: '선택한 조건' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '전체 초기화' })).not.toBeInTheDocument()
  })

  it('모바일 상세 필터는 열림 상태와 연결된 패널을 알린다', async () => {
    const user = userEvent.setup()
    render(<Toolbar />)
    const toggle = screen.getByRole('button', { name: '상세 필터 (2)' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById(toggle.getAttribute('aria-controls')!)).toBeInTheDocument()
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('조회 중에는 이전 결과 수 대신 진행 상태를 알린다', () => {
    const { rerender } = render(<Toolbar busy />)
    expect(screen.getByRole('status')).toHaveTextContent('결과를 불러오는 중…')
    rerender(<Toolbar />)
    expect(screen.getByRole('status')).toHaveTextContent('작가 12명')
  })

  it('폼 라벨과 선택 조건에 접근성 위반이 없다', async () => {
    const { container } = render(<Toolbar />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it.each<Language>(['ko', 'en', 'ja', 'zh'])(
    '%s에서 필터 라벨을 번역해도 API 값은 보존한다',
    language => {
      jest.mocked(useLanguage).mockReturnValue({ language } as ReturnType<typeof useLanguage>)
      render(<Toolbar />)
      expect(
        screen.getByRole('button', { name: discoveryCopy[language].clearSearch })
      ).toBeInTheDocument()
      expect(getArtistFilterOptions('membership', language).map(option => option.value)).toEqual(
        getArtistFilterOptions('membership', 'ko').map(option => option.value)
      )
      expect(
        getArtistFilterOptions('membership', language).every(option => Boolean(option.label))
      ).toBe(true)
    }
  )
})

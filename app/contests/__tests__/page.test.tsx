import { render, screen, within } from '@testing-library/react'
import ContestsPage from '../page'
import { CONTEST_23, SCHEDULE, koDate } from '../_components/contest-23-data'

jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'ko' }),
}))
jest.mock('@/components/contests/contest-flipbook', () => ({ ContestFlipbook: () => null }))

describe('koDate', () => {
  // 요일은 손으로 적지 않는다 — 날짜에서 계산한 값이 공모요강 표기와 맞아야 한다
  it.each([
    ['2027-01-31', '2027년 1월 31일(일)'],
    ['2027-02-13', '2027년 2월 13일(토)'],
    ['2027-03-13', '2027년 3월 13일(토)'],
    ['2027-04-21', '2027년 4월 21일(수)'],
    ['2027-04-24', '2027년 4월 24일(토)'],
    ['2027-04-26', '2027년 4월 26일(월)'],
    ['2027-04-30', '2027년 4월 30일(금)'],
  ])('%s → %s', (iso, label) => {
    expect(koDate(iso)).toBe(label)
  })

  it('연도를 뺄 수 있다', () => {
    expect(koDate('2027-04-30', false)).toBe('4월 30일(금)')
  })
})

describe('공모전 페이지 — 제23회 공모요강', () => {
  beforeEach(() => render(<ContestsPage />))

  // 회귀: 요강이 나온 뒤에도 "확정되는 대로 공지사항에 안내합니다"가 남아 있었다
  it('미정 안내 문구가 없다', () => {
    expect(screen.queryByText(/확정되는 대로/)).not.toBeInTheDocument()
  })

  it('일정 표에 접수 마감·심사·전시·시상식이 모두 있다', () => {
    const table = screen.getByRole('table', { name: /일정/ })
    for (const row of SCHEDULE) {
      expect(within(table).getByText(row.label)).toBeInTheDocument()
    }
    expect(within(table).getByText(/2027년 1월 31일\(일\) 18:00 도착분/)).toBeInTheDocument()
    // 회귀: 4월 20일(화) 로 잘못 적혀 있었다
    expect(within(table).getByText(/2027년 4월 21일\(수\) ~ 4월 30일\(금\)/)).toBeInTheDocument()
    expect(screen.queryByText(/4월 20일/)).not.toBeInTheDocument()
  })

  it('입금 계좌와 접수처를 보여 준다', () => {
    expect(
      screen.getByText(`${CONTEST_23.account.bank} ${CONTEST_23.account.number}`)
    ).toBeInTheDocument()
    expect(screen.getByText(CONTEST_23.mailTo)).toBeInTheDocument()
  })

  // 공모요강 2쪽 "특별규정 신설" — 정회원이 아니어도 초대작가전에 참여할 수 있다
  it('특별규정으로 비회원 작가도 초대작가전에 참여할 수 있음을 알린다', () => {
    expect(screen.getByText('특별규정')).toBeInTheDocument()
    expect(
      screen.getByText(/정회원이 아니어도.*초대작가전에 참여할 수 있습니다/)
    ).toBeInTheDocument()
  })

  it('출품료·시상 표가 있고 출품원서로 이어진다', () => {
    expect(screen.getByRole('table', { name: /출품료/ })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: '시상 내역' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /출품원서 작성하기/ })).toHaveAttribute(
      'href',
      '/application'
    )
  })

  it('목차의 모든 항목이 페이지 안 구역을 가리킨다', () => {
    const toc = screen
      .getAllByRole('link')
      .filter(link => link.getAttribute('href')?.startsWith('#'))
    expect(toc.length).toBeGreaterThan(5)
    for (const link of toc) {
      const id = link.getAttribute('href')!.slice(1)
      expect(document.getElementById(id)).not.toBeNull()
    }
  })
})

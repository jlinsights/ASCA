import { render, screen, within } from '@testing-library/react'
import { HomepagePrograms } from '../_components/homepage-programs'
import { homepageProgramsTranslations } from '@/lib/i18n/translations/homepage-programs'
import { regulationHref } from '@/lib/regulations/catalog'

let mockLanguage = 'ko'
jest.mock('@/contexts/language-context', () => {
  // 실제 번역 표로 찾는다 — 키가 빠지면 키 이름이 그대로 나와 테스트가 잡는다
  const { translations } = jest.requireActual('@/lib/i18n/translations')
  return {
    useLanguage: () => ({
      language: mockLanguage,
      t: (key: string) => translations[mockLanguage][key] || key,
    }),
  }
})

afterEach(() => {
  mockLanguage = 'ko'
})

const ko = homepageProgramsTranslations.ko

describe('작가의 홈페이지 — 참여하면 열리는 온라인 공간', () => {
  it('참여 → 기록 → 집 세 단계를 순서 있는 목록으로 보인다', () => {
    render(<HomepagePrograms />)
    expect(screen.getByRole('heading', { level: 2, name: ko.hpProgTitle })).toBeInTheDocument()
    const steps = within(screen.getByRole('list', { name: ko.hpProgStepsLabel })).getAllByRole(
      'listitem',
      { name: undefined }
    )
    const titles = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)
    expect(titles.slice(0, 3)).toEqual([
      expect.stringContaining(ko.hpProgStep1Title),
      expect.stringContaining(ko.hpProgStep2Title),
      expect.stringContaining(ko.hpProgStep3Title),
    ])
    expect(steps.length).toBeGreaterThanOrEqual(3)
  })

  // 주장마다 근거 조문으로 보낸다 — 출품 수량 감면은 제10조, 단체 홈페이지는 제10조의2
  it.each([
    [ko.hpProgStep1Cite, `${regulationHref('exhibition')}#a12`],
    [ko.hpProgStep2Cite, `${regulationHref('membership-dues')}#a9`],
    [ko.hpProgStep2Cite2, `${regulationHref('exhibition')}#a4-2`],
    [ko.hpProgStep3Cite, `${regulationHref('membership-dues')}#a10`],
    [ko.hpProgStep3Cite2, `${regulationHref('membership-dues')}#a10-2`],
    [ko.hpProgWhoCite, `${regulationHref('artist-selection')}#a11`],
  ])('근거 "%s" → %s', (name, href) => {
    render(<HomepagePrograms />)
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
  })

  it('상담·회원 가입·작가 소개로 잇는다', () => {
    render(<HomepagePrograms />)
    expect(screen.getByRole('link', { name: new RegExp(ko.hpProgCta) })).toHaveAttribute(
      'href',
      '/contact'
    )
    expect(screen.getByRole('link', { name: ko.hpProgCtaMembership })).toHaveAttribute(
      'href',
      '/membership'
    )
    expect(screen.getByRole('link', { name: new RegExp(ko.hpProgStep1Link) })).toHaveAttribute(
      'href',
      '/artists'
    )
  })

  it('비회원도 특별선임으로 신청할 수 있음을 알린다', () => {
    render(<HomepagePrograms />)
    expect(screen.getByText(ko.hpProgWhoSpecial)).toBeInTheDocument()
  })

  it.each(['en', 'ja', 'zh'])('%s: 한글·키 이름이 새지 않는다', lang => {
    mockLanguage = lang
    const { container } = render(<HomepagePrograms />)
    expect(container.textContent).not.toMatch(/[가-힣]/)
    expect(container.textContent).not.toMatch(/hpProg/)
  })

  // 제10조 ①: 연회비 면제는 유지보수 계약 '과' 연간 유지보수비 납부가 모두 있어야 한다
  it.each([
    ['ko', /유지보수비를 낸/],
    ['en', /pay the annual maintenance fee/],
    ['ja', /年間保守費を納めた/],
    ['zh', /繳納年度維護費/],
  ])('%s: 연회비 면제 조건에 유지보수비 납부를 쓴다', (lang, pattern) => {
    const table = homepageProgramsTranslations[lang as keyof typeof homepageProgramsTranslations]
    expect(table.hpProgStep3Body).toMatch(pattern)
  })

  // keep-all 은 한글을 단어 단위로 끊지만, 띄어쓰기가 거의 없는 일본어·중국어는 줄을 못 바꿔 넘친다
  it.each([
    ['ko', true],
    ['en', false],
    ['ja', false],
    ['zh', false],
  ])('%s: 단어 단위 줄바꿈(break-keep)은 한국어에만 = %s', (lang, keep) => {
    mockLanguage = lang as string
    const { container } = render(<HomepagePrograms />)
    expect(container.querySelector('section')?.classList.contains('break-keep')).toBe(keep)
  })

  // 금액은 규정·자주 묻는 질문 한 곳에만 둔다 (featured-homepages-copy 와 같은 원칙)
  it('네 언어 모두 금액을 쓰지 않고, 키가 같다', () => {
    const keys = Object.keys(ko).sort()
    for (const table of Object.values(homepageProgramsTranslations)) {
      expect(Object.keys(table).sort()).toEqual(keys)
      expect(Object.values(table).join(' ')).not.toMatch(/\d[\d,]*\s*(원|만원|円|元)|₩|\$/)
    }
  })
})

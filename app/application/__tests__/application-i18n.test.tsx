import { render, screen } from '@testing-library/react'
import ApplicationPage from '../page'
import { applicationDataStrings } from '@/app/application/_components/application-copy'
import { applicationTranslations } from '@/lib/i18n/translations/application'
import { SIMPLIFIED_ONLY_CHARS } from '@/lib/i18n/simplified-only'

type Lang = 'ko' | 'en' | 'ja' | 'zh'
let mockLanguage: Lang = 'ko'
jest.mock('@/contexts/language-context', () => {
  // 실제 언어별 표로 찾는다 — 키가 빠지면 키 이름이 그대로 나와 테스트가 잡는다
  const { translations } = jest.requireActual('@/lib/i18n/translations')
  return {
    useLanguage: () => ({
      language: mockLanguage,
      t: (key: string) => translations[mockLanguage][key] || key,
    }),
  }
})
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/components/apply/tally-embed', () => ({ TallyEmbed: () => null }))
jest.mock('@/components/contests/contest-flipbook', () => ({
  CONTEST_FLIPBOOK_URL: 'https://online.fliphtml5.com/orientalcalligraphy/ulsw/',
  ContestFlipbook: () => null,
}))

afterEach(() => {
  mockLanguage = 'ko'
})

const LANGS: Lang[] = ['en', 'ja', 'zh']
const tables = applicationTranslations as Record<Lang, Record<string, string>>
const PLACEHOLDERS = /\{[a-z]+\}/g

const MULTIPLIER: Record<string, number> = { 만: 10_000, 万: 10_000, 萬: 10_000 }
const MONEY: Record<Lang, RegExp> = {
  ko: /([\d,]+)\s*(만)?\s*원/g,
  en: /KRW\s*([\d,]+)()/g,
  ja: /([\d,]+)\s*(万)?\s*ウォン/g,
  zh: /([\d,]+)\s*(萬)?\s*韓元/g,
}
const amounts = (lang: Lang, text: string): number[] =>
  [...text.matchAll(MONEY[lang])]
    .map(([, digits, unit]) => Number(digits.replace(/,/g, '')) * (MULTIPLIER[unit] ?? 1))
    .sort((a, b) => a - b)

/** lang='ko'(주소·언어 목록의 '한국어')를 뺀 화면 글자 */
const visibleText = (): string => {
  const clone = document.body.cloneNode(true) as HTMLElement
  clone.querySelectorAll('[lang="ko"]').forEach(node => node.remove())
  return clone.textContent ?? ''
}

describe('/application 번역 표', () => {
  it('ko 표의 출품 데이터는 application-data.ts 와 같다', () => {
    const koData = Object.fromEntries(
      Object.entries(tables.ko).filter(([key]) => !key.startsWith('ap.ui.'))
    )
    expect(koData).toEqual(applicationDataStrings())
  })

  it.each(LANGS)('%s: 키가 ko 와 같고 빈 값·한글이 없으며 자리표시·금액이 같다', lang => {
    expect(Object.keys(tables[lang]).sort()).toEqual(Object.keys(tables.ko).sort())
    for (const [key, ko] of Object.entries(tables.ko)) {
      const value = tables[lang][key]
      expect([key, value.trim().length > 0, /[가-힣]/.test(value)]).toEqual([key, true, false])
      expect([key, (value.match(PLACEHOLDERS) ?? []).sort()]).toEqual([
        key,
        (ko.match(PLACEHOLDERS) ?? []).sort(),
      ])
      expect([key, amounts(lang, value)]).toEqual([key, amounts('ko', ko)])
    }
  })

  it('zh: 간체 전용 글자를 쓰지 않는다', () => {
    const text = Object.values(tables.zh).join('')
    expect(SIMPLIFIED_ONLY_CHARS.filter(c => text.includes(c))).toEqual([])
  })
})

// 회귀: 언어를 바꿔도 출품원서 화면(출품비·심사·시상 표 포함)이 한국어로 남았다
describe('/application 화면', () => {
  it('ko: 원래 글자 그대로 그린다', () => {
    render(<ApplicationPage />)
    expect(screen.getByRole('heading', { level: 1, name: '출품원서' })).toBeInTheDocument()
    expect(document.body.textContent).toContain('상장 및 상금 200만원')
    expect(document.body.textContent).toContain('다섯 부문, 세 규격')
  })

  it.each(LANGS)('%s: 출품비·심사·시상 표까지 고른 언어로, 한글·키 이름이 없다', lang => {
    mockLanguage = lang
    render(<ApplicationPage />)
    const t = tables[lang]
    expect(
      screen.getByRole('heading', { level: 1, name: t['ap.ui.heroTitle'] })
    ).toBeInTheDocument()
    expect(document.body.textContent).toContain(t['ap.entryFee.1.2'])
    expect(document.body.textContent).toContain(t['ap.ui.divisionsTitle'])
    expect(visibleText().match(/[^\s]*[가-힣][^\s]*/g)).toBeNull()
    expect(document.body.textContent).not.toMatch(/\b(ap|aw)\.[a-z]/)
  })
})

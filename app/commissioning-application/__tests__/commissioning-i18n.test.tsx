import { render, screen } from '@testing-library/react'
import CommissioningPage from '../page'
import { commissioningDataStrings } from '@/app/commissioning-application/_components/commissioning-copy'
import { commissioningTranslations } from '@/lib/i18n/translations/commissioning'
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

afterEach(() => {
  mockLanguage = 'ko'
})

const LANGS: Lang[] = ['en', 'ja', 'zh']
const tables = commissioningTranslations as Record<Lang, Record<string, string>>
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

describe('/commissioning-application 번역 표', () => {
  it('ko 표의 위촉 데이터는 commissioning-data.ts 와 같다', () => {
    const koData = Object.fromEntries(
      Object.entries(tables.ko).filter(([key]) => !key.startsWith('cm.ui.'))
    )
    expect(koData).toEqual(commissioningDataStrings())
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

// 회귀: 언어를 바꿔도 위원 위촉 지원 화면(수당 표 포함)이 한국어로 남았다
describe('/commissioning-application 화면', () => {
  it('ko: 원래 글자 그대로 그린다', () => {
    render(<CommissioningPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: '동양서예대전 위원 위촉 지원' })
    ).toBeInTheDocument()
    expect(document.body.textContent).toContain('15만원 (1일 / 반일)')
    expect(document.body.textContent).toContain('세 갈래의 위원')
  })

  it.each(LANGS)('%s: 자격·수당 표까지 고른 언어로, 한글·키 이름이 없다', lang => {
    mockLanguage = lang
    render(<CommissioningPage />)
    const t = tables[lang]
    expect(
      screen.getByRole('heading', { level: 1, name: t['cm.ui.heroTitle'] })
    ).toBeInTheDocument()
    expect(document.body.textContent).toContain(t['cm.jurorPay.1.2'])
    expect(document.body.textContent).toContain(t['cm.role.3.qual.1'])
    expect(document.body.textContent?.match(/[^\s]*[가-힣][^\s]*/g) ?? null).toBeNull()
    expect(document.body.textContent).not.toMatch(/\bcm\.[a-z]/)
  })
})

import { render, screen } from '@testing-library/react'
import MembershipPage from '../page'
import { membershipDataStrings } from '../_components/membership-copy'
import { membershipTranslations } from '@/lib/i18n/translations/membership'
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

afterEach(() => {
  mockLanguage = 'ko'
})

const LANGS: Lang[] = ['en', 'ja', 'zh']
const tables = membershipTranslations as Record<Lang, Record<string, string>>

/** 글 속 원화 금액을 원 단위 숫자로 — 언어마다 표기가 다르다(30,000원 · 5만원 · 1백만원 · KRW 50,000 · 5万ウォン · 5萬韓元) */
const MULTIPLIER: Record<string, number> = { 만: 10_000, 万: 10_000, 萬: 10_000, 백만: 1_000_000 }
const MONEY: Record<Lang, RegExp> = {
  ko: /([\d,]+)\s*(백만|만)?\s*원/g,
  en: /KRW\s*([\d,]+)()/g,
  ja: /([\d,]+)\s*(万)?\s*ウォン/g,
  zh: /([\d,]+)\s*(萬)?\s*韓元/g,
}
function amounts(lang: Lang, text: string): number[] {
  return [...text.matchAll(MONEY[lang])]
    .map(([, digits, unit]) => Number(digits.replace(/,/g, '')) * (MULTIPLIER[unit] ?? 1))
    .sort((a, b) => a - b)
}

describe('/membership 번역 표', () => {
  it('ko 표의 데이터 글자는 membership-data.ts 와 같다 — 한국어가 바뀌면 번역도 다시 보라고 실패한다', () => {
    const data = membershipDataStrings()
    const koData = Object.fromEntries(
      Object.entries(tables.ko).filter(([key]) => !key.startsWith('mb.ui.'))
    )
    expect(koData).toEqual(data)
  })

  it.each(LANGS)('%s: 키가 ko 와 같고 빈 값·한글이 없다', lang => {
    expect(Object.keys(tables[lang]).sort()).toEqual(Object.keys(tables.ko).sort())
    for (const [key, value] of Object.entries(tables[lang])) {
      expect([key, value.trim().length > 0]).toEqual([key, true])
      expect([key, /[가-힣]/.test(value)]).toEqual([key, false])
    }
  })

  it.each(LANGS)('%s: 모든 금액이 한국어 원문과 같은 원 단위 값이다', lang => {
    for (const [key, ko] of Object.entries(tables.ko)) {
      expect([key, amounts(lang, tables[lang][key])]).toEqual([key, amounts('ko', ko)])
    }
  })

  it.each(LANGS)('%s: 조문 번호(제N조)·숫자 자리표시({n})가 남는다', lang => {
    for (const [key, ko] of Object.entries(tables.ko)) {
      const articles = [...ko.matchAll(/제\s*(\d+)\s*조/g)].map(m => m[1]).sort()
      const value = tables[lang][key]
      for (const n of articles) expect([key, value.includes(n)]).toEqual([key, true])
      if (ko.includes('{n}')) expect([key, value.includes('{n}')]).toEqual([key, true])
    }
  })

  it('zh: 간체 전용 글자를 쓰지 않는다', () => {
    const text = Object.values(tables.zh).join('')
    expect(SIMPLIFIED_ONLY_CHARS.filter(c => text.includes(c))).toEqual([])
  })
})

// 회귀: 언어를 바꿔도 회원 안내 전체가 한국어로 남았다
describe('/membership 화면', () => {
  it('ko: 원래 글자 그대로 그린다', () => {
    render(<MembershipPage />)
    expect(screen.getByRole('heading', { level: 1, name: '회원 안내' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '회원 등급 및 연회비' })).toBeInTheDocument()
    expect(document.body.textContent).toContain('30,000원 ~ 200,000원')
  })

  it.each(LANGS)('%s: 제목을 고른 언어로, 본문에 한글·키 이름이 남지 않는다', lang => {
    mockLanguage = lang
    render(<MembershipPage />)
    const t = tables[lang]
    expect(
      screen.getByRole('heading', { level: 1, name: t['mb.ui.heroTitle'] })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: t['mb.ui.tiersTitle'] })).toBeInTheDocument()
    const text = document.body.textContent ?? ''
    expect(text).not.toMatch(/[가-힣]/)
    expect(text).not.toMatch(/\bmb\.[a-zA-Z]/)
  })

  it('en: 등급 영문 부제를 겹쳐 달지 않고, 배점 숫자 뒤에 단위를 붙이지 않는다', () => {
    mockLanguage = 'en'
    render(<MembershipPage />)
    expect(document.querySelector('.asca-mb__tier-en')).toBeNull()
    // 배점 칸만 본다 — 본문 문장의 "10 or more points" 는 정상이다
    const cells = [...document.querySelectorAll('.asca-mb__points')].map(
      el => el.parentElement?.textContent?.trim() ?? ''
    )
    expect(cells.length).toBeGreaterThan(0)
    for (const cell of cells) expect(cell).toMatch(/^[\d.]+$/)
  })
})

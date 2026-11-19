import { fireEvent, render, screen } from '@testing-library/react'
import AcademyPage from '../page'
import { UNTRANSLATED, academyDataStrings } from '../_components/academy-copy'
import { academyTranslations } from '@/lib/i18n/translations/academy'
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
const tables = academyTranslations as Record<Lang, Record<string, string>>
const PLACEHOLDERS = /\{[a-z]+\}/g

/** 글 속 원화 금액을 원 단위 숫자로 — 언어마다 표기가 다르다(300,000원 · KRW 300,000 · 300,000ウォン · 300,000韓元) */
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

/** 화면 글자에서 원문 그대로 두는 것(사람 이름·작품 제목·주소)과 장식용 글자를 뺀 나머지 */
function translatableText(): string {
  document
    .querySelectorAll('.asca-ac__subject-mark, [aria-hidden="true"]')
    .forEach(el => el.remove())
  let text = document.body.textContent ?? ''
  for (const keep of [...UNTRANSLATED].sort((a, b) => b.length - a.length)) {
    text = text.split(keep).join(' ')
  }
  return text
}

describe('/academy 번역 표', () => {
  it('ko 표의 데이터 글자는 academy-data.ts 와 같다 — 한국어가 바뀌면 번역도 다시 보라고 실패한다', () => {
    const koData = Object.fromEntries(
      Object.entries(tables.ko).filter(([key]) => !key.startsWith('ac.ui.'))
    )
    expect(koData).toEqual(academyDataStrings())
  })

  it.each(LANGS)('%s: 키가 ko 와 같고 빈 값·한글이 없다', lang => {
    expect(Object.keys(tables[lang]).sort()).toEqual(Object.keys(tables.ko).sort())
    for (const [key, value] of Object.entries(tables[lang])) {
      expect([key, value.trim().length > 0, /[가-힣]/.test(value)]).toEqual([key, true, false])
    }
  })

  it.each(LANGS)('%s: 자리표시·금액·시각이 한국어 원문과 같다', lang => {
    for (const [key, ko] of Object.entries(tables.ko)) {
      const value = tables[lang][key]
      expect([key, (value.match(PLACEHOLDERS) ?? []).sort()]).toEqual([
        key,
        (ko.match(PLACEHOLDERS) ?? []).sort(),
      ])
      expect([key, amounts(lang, value)]).toEqual([key, amounts('ko', ko)])
      for (const time of ko.match(/\d{2}:\d{2}/g) ?? []) {
        expect([key, value.includes(time)]).toEqual([key, true])
      }
    }
  })

  it('zh: 간체 전용 글자를 쓰지 않는다', () => {
    const text = Object.values(tables.zh).join('')
    expect(SIMPLIFIED_ONLY_CHARS.filter(c => text.includes(c))).toEqual([])
  })
})

// 회귀: 언어를 바꿔도 강좌 화면 전체가 한국어로 남았다
describe('/academy 화면', () => {
  it('ko: 원래 글자 그대로 그린다', () => {
    render(<AcademyPage />)
    expect(screen.getByRole('heading', { level: 1, name: '강좌' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '문원한문서예학원' })).toBeInTheDocument()
    expect(document.body.textContent).toContain('300,000원')
    expect(screen.getByRole('heading', { name: /^화\s*요일$/ })).toBeInTheDocument()
  })

  it.each(LANGS)('%s: 제목을 고른 언어로, 원문 유지 대상 밖에는 한글·키 이름이 없다', lang => {
    mockLanguage = lang
    render(<AcademyPage />)
    const t = tables[lang]
    expect(
      screen.getByRole('heading', { level: 1, name: t['ac.ui.heroTitle'] })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: t['ac.day.1'] })).toBeInTheDocument()
    expect(document.body.textContent).toContain('벽하 최형주')
    const text = translatableText()
    expect(text.match(/[^\s]*[가-힣][^\s]*/g)).toBeNull()
    expect(text).not.toMatch(/\bac\.[a-zA-Z]/)
  })

  it.each(LANGS)('%s: 분야 버튼 이름과 상태 알림도 고른 언어로', lang => {
    mockLanguage = lang
    render(<AcademyPage />)
    const t = tables[lang]
    const group = screen.getByRole('group', { name: t['ac.ui.filterLabel'] })
    const button = [...group.querySelectorAll('button')].find(b =>
      b.textContent?.startsWith(t['ac.cat.1'])
    )
    expect(button).toBeDefined()
    fireEvent.click(button as HTMLButtonElement)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toContain(t['ac.cat.1'])
    expect(document.querySelector('[aria-live="polite"]')?.textContent).not.toMatch(/[가-힣]/)
  })
})

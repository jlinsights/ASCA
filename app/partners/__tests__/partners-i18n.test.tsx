import { render, screen } from '@testing-library/react'
import PartnersPage from '../page'
import { PARTNER_CATEGORIES, PARTNER_COUNT } from '../_components/partners-data'
import { partnersTranslations } from '@/lib/i18n/translations/partners'
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
jest.mock('@/components/about/about-nav', () => ({ AboutNav: () => null }))
jest.mock('@/components/about/about-motion', () => ({ AboutMotion: () => null }))
jest.mock('next/navigation', () => ({ usePathname: () => '/partners' }))

afterEach(() => {
  mockLanguage = 'ko'
})

const LANGS: Lang[] = ['en', 'ja', 'zh']
const tables = partnersTranslations as Record<Lang, Record<string, string>>

describe('/partners 번역 표', () => {
  it('ko 분류 제목은 partners-data.ts 의 title 과 같다', () => {
    for (const category of PARTNER_CATEGORIES) {
      expect(tables.ko[`partnersCat_${category.id}`]).toBe(category.title)
    }
  })

  it.each(LANGS)('%s: 키가 ko 와 같고 빈 값·한글이 없으며 {n} 이 남는다', lang => {
    expect(Object.keys(tables[lang]).sort()).toEqual(Object.keys(tables.ko).sort())
    for (const [key, value] of Object.entries(tables[lang])) {
      expect([key, value.trim().length > 0, /[가-힣]/.test(value)]).toEqual([key, true, false])
      if (tables.ko[key].includes('{n}')) expect([key, value.includes('{n}')]).toEqual([key, true])
    }
  })

  it('zh: 간체 전용 글자를 쓰지 않는다', () => {
    const text = Object.values(tables.zh).join('')
    expect(SIMPLIFIED_ONLY_CHARS.filter(c => text.includes(c))).toEqual([])
  })
})

// 회귀: 언어를 바꿔도 머리·분류 제목·안내가 한국어로 남았다(기관 이름은 고유명사라 원문 유지)
describe('/partners 화면', () => {
  it('ko: 원래 글자 그대로 그린다', () => {
    render(<PartnersPage />)
    expect(screen.getByRole('heading', { level: 1, name: '유관단체' })).toBeInTheDocument()
    expect(document.body.textContent).toContain(`${PARTNER_COUNT}곳`)
    expect(screen.getByRole('heading', { name: /관련 기관 및 단체/ })).toBeInTheDocument()
  })

  it.each(LANGS)('%s: 머리·분류 제목·안내를 고른 언어로, 기관 이름은 원문 그대로', lang => {
    mockLanguage = lang
    render(<PartnersPage />)
    const t = tables[lang]
    expect(screen.getByRole('heading', { level: 1, name: t.partnersTitle })).toBeInTheDocument()
    // 분류 머리는 클래스로 찾는다 — 'partners' 분류의 id 가 장(chapter) 머리 id 와 겹친다(기존 마크업)
    const headings = [...document.querySelectorAll('.ab-links__title')].map(
      h => h.textContent ?? ''
    )
    expect(headings).toHaveLength(PARTNER_CATEGORIES.length)
    PARTNER_CATEGORIES.forEach((category, index) => {
      expect(headings[index]).toContain(t[`partnersCat_${category.id}`])
      expect(headings[index]).not.toMatch(/[가-힣]/)
    })
    const chrome = [...document.querySelectorAll('.ab-hero, .ab-chapter__title, .ab-chapter__note')]
      .map(el => el.textContent)
      .join(' ')
    expect(chrome).not.toMatch(/[가-힣]/)
    expect(document.body.textContent).not.toMatch(/partners[A-Z]/)
    expect(document.body.textContent).toContain('문화체육관광부')
  })
})

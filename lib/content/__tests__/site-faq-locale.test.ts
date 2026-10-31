import { SITE_FAQ } from '../site-faq'
import { SITE_FAQ_TRANSLATIONS, localizeFaqItem } from '../site-faq-locale'
import { SIMPLIFIED_ONLY_CHARS } from '@/lib/i18n/simplified-only'

const LANGS = ['en', 'ja', 'zh'] as const

/** 원문 '18만원' · 영문 'KRW 180,000' · 일문 '18万ウォン' · 중문 '18萬韓元' → 원 단위 금액 목록(정렬) */
function amounts(text: string, lang: 'ko' | (typeof LANGS)[number]): number[] {
  const pattern = {
    ko: /(\d+)만원/g,
    en: /KRW ([\d,]+)/g,
    ja: /(\d+)万ウォン/g,
    zh: /(\d+)萬韓元/g,
  }[lang]
  return [...text.matchAll(pattern)]
    .map(match => {
      const n = Number(match[1]!.replace(/,/g, ''))
      return lang === 'en' ? n : n * 10000
    })
    .sort((a, b) => a - b)
}

const percents = (text: string) => [...text.matchAll(/(\d+)%/g)].map(m => m[1]).sort()

describe('자주 묻는 질문 번역', () => {
  it.each(LANGS)('%s — 모든 질문에 번역이 있고, 남는 번역이 없다', lang => {
    const ids = SITE_FAQ.map(item => item.id).sort()
    expect(Object.keys(SITE_FAQ_TRANSLATIONS[lang]).sort()).toStrictEqual(ids)
  })

  describe.each(LANGS)('%s', lang => {
    it.each(SITE_FAQ.map(item => [item.id!, item] as const))(
      '%s — 금액·비율·근거 수가 원문과 같다',
      (_, item) => {
        const translation = SITE_FAQ_TRANSLATIONS[lang][item.id!]!
        expect(amounts(translation.a, lang)).toStrictEqual(amounts(item.a, 'ko'))
        expect(percents(translation.a)).toStrictEqual(percents(item.a))
        expect(translation.sources?.length ?? 0).toBe(item.sources?.length ?? 0)
        expect(
          `${translation.q}${translation.a}${(translation.sources ?? []).join('')}`
        ).not.toMatch(/[가-힣]/)
      }
    )
  })

  it('근거 주소는 원문 그대로 두고 이름만 바꾼다', () => {
    const item = SITE_FAQ.find(faq => faq.id === 'special-appointment')!
    const localized = localizeFaqItem(item, 'ja')
    expect(localized.sources?.map(source => source.href)).toStrictEqual(
      item.sources?.map(source => source.href)
    )
    expect(localized.sources?.[0]?.label).toBe('推薦・招待作家選任規程 第11条')
    expect(localizeFaqItem(item, 'ko')).toMatchObject({ q: item.q, translated: true })
  })

  it('zh 번역에 간체 전용 글자가 없다', () => {
    const text = JSON.stringify(SITE_FAQ_TRANSLATIONS.zh)
    expect(SIMPLIFIED_ONLY_CHARS.filter(char => text.includes(char))).toStrictEqual([])
  })
})

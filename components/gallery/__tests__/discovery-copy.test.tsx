import { readFileSync } from 'fs'
import path from 'path'
import { renderHook } from '@testing-library/react'
import { DISCOVERY_FIELDS, discoveryKey, useDiscoveryCopy } from '../discovery-copy'
import { discoveryTranslations } from '@/lib/i18n/translations/discovery'

let mockLanguage = 'ko'
jest.mock('@/contexts/language-context', () => {
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

// 둘러보기 문구는 네 언어를 한 객체로 묶어 클라이언트 번들에 싣던 마지막 파일이었다 (#229 방식으로 정리)
describe('discovery-copy', () => {
  it('네 언어 표의 키가 같고, 모든 필드에 번역이 있다', () => {
    const keys = DISCOVERY_FIELDS.map(discoveryKey).sort()
    for (const table of Object.values(discoveryTranslations)) {
      expect(Object.keys(table).sort()).toStrictEqual(keys)
      expect(Object.values(table).every(Boolean)).toBe(true)
    }
  })

  it.each([
    ['ko', '검색어 지우기', '작가 {count}명'],
    ['en', 'Clear search', '{count} artists'],
  ])('%s: 고른 언어의 문구를 돌려준다', (lang, clearSearch, artistResults) => {
    mockLanguage = lang
    const { result } = renderHook(() => useDiscoveryCopy())
    expect(result.current.clearSearch).toBe(clearSearch)
    expect(result.current.artistResults).toBe(artistResults)
  })

  it('클라이언트 모듈이 네 언어 표를 직접 불러오지 않는다', () => {
    const source = readFileSync(path.join(__dirname, '../discovery-copy.ts'), 'utf8')
    expect(source).not.toMatch(/from ['"]@\/lib\/i18n\/(locales|translations)/)
  })
})

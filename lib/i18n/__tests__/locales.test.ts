import fs from 'node:fs'
import path from 'node:path'
import { translations } from '../translations'
import { defaultLocaleTable, getLoadedLocale, loadLocale } from '../locales'
import { resolveTable } from '../locales/resolve'
import type { Language } from '../types'

const LANGUAGES: Language[] = ['ko', 'en', 'ja', 'zh']
const root = path.resolve(__dirname, '../../..')

describe('언어별 번역표', () => {
  it('기본 언어(ko) 표는 처음부터 있고, 나머지는 받기 전에는 없다', () => {
    expect(getLoadedLocale('ko')).toBe(defaultLocaleTable)
    expect(getLoadedLocale('ja')).toBeUndefined()
  })

  it.each(LANGUAGES)('%s 표는 정적 표의 모든 키를 담는다', async language => {
    const table = await loadLocale(language)
    for (const key of Object.keys(translations[language])) {
      expect(table[key]).toBeTruthy()
    }
  })

  // 예전 t() 는 번역을 미리 불러온 뒤 내비게이션 → 작품 → 정적 표 → 컨텍스트 내장 표 순서로 찾았다.
  // 같은 키가 여러 표에 있을 때 화면에 실제로 보이던 문구다(분할 전 코드로 뽑은 값).
  it.each([
    ['en', 'artGalleryExhibition', 'The Asian Society of Calligraphic Arts'],
    ['en', 'searchPlaceholder', 'Search by artwork, artist, or tags...'],
    ['ja', 'events', 'イベント'],
    ['ja', 'sold', '売却済み'],
    ['zh', 'catalog', '圖錄'],
    ['zh', 'artGalleryExhibition', '東洋書藝協會'],
    ['ko', 'exhibition', '전시'],
  ] as const)('%s.%s 는 예전과 같은 문구로 보인다', async (language, key, expected) => {
    expect((await loadLocale(language))[key]).toBe(expected)
  })

  it('빈 문자열은 다음 표로 넘긴다 (예전 || 와 같게)', () => {
    expect(resolveTable([{ a: '' }, { a: 'fallback' }]).a).toBe('fallback')
    expect(resolveTable([{ a: 'first' }, { a: 'second' }]).a).toBe('first')
  })

  // 클라이언트 진입점이 네 언어 표(lib/i18n/translations.ts)를 다시 불러오면
  // 모든 페이지 첫 번들에 네 언어가 실린다.
  it.each(['contexts/language-context.tsx', 'lib/i18n/index.ts'])(
    '%s 는 네 언어를 한꺼번에 싣는 표를 불러오지 않는다',
    file => {
      const src = fs.readFileSync(path.join(root, file), 'utf8')
      expect(src).not.toMatch(/from ['"](@\/lib\/i18n|\.)\/translations['"]/)
      expect(src).not.toMatch(/import\(['"]\.\/translations['"]\)/)
      expect(src).not.toMatch(/lib\/i18n\/translations\//)
      expect(src).not.toMatch(/from ['"]\.\/translations\//)
    }
  )
})

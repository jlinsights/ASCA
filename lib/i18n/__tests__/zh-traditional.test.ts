import { translations } from '../translations'
import { LANGUAGE_METADATA } from '../index'
import { SIMPLIFIED_ONLY_CHARS } from '../simplified-only'

describe('zh 번역은 번체다', () => {
  it('zh 로케일이 번체(zh-TW)다', () => {
    expect(LANGUAGE_METADATA.zh.locale).toBe('zh-TW')
  })

  it('zh 표에 간체 전용 글자가 없다', () => {
    const chars = SIMPLIFIED_ONLY_CHARS
    const zh = translations.zh ?? {}
    const offenders = Object.entries(zh)
      .filter(([, value]) => chars.some(c => value.includes(c)))
      .map(([key, value]) => `${key}=${value}`)
    expect(Object.keys(zh).length).toBeGreaterThan(100)
    expect(offenders).toStrictEqual([])
  })
})

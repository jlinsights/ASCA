import { normalizeCalligraphyStyle } from '../normalize-style'

describe('normalizeCalligraphyStyle', () => {
  it.each([
    ['전서', 'zhuan'],
    ['예서', 'li'],
    ['해서', 'kai'],
    ['행서', 'xing'],
    ['초서', 'cao'],
    ['한글', 'hangul'],
    ['Zhuan', 'zhuan'],
    ['XING', 'xing'],
  ])('maps "%s" to "%s"', (input, expected) => {
    expect(normalizeCalligraphyStyle(input)).toBe(expected)
  })

  it('returns null for unknown style', () => {
    expect(normalizeCalligraphyStyle('unknown')).toBeNull()
  })

  it('returns null for empty/null input', () => {
    expect(normalizeCalligraphyStyle('')).toBeNull()
    expect(normalizeCalligraphyStyle(null)).toBeNull()
    expect(normalizeCalligraphyStyle(undefined)).toBeNull()
  })
})

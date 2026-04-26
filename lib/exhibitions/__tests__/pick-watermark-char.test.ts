import { pickWatermarkChar } from '../pick-watermark-char'

describe('pickWatermarkChar', () => {
  it('extracts up to 2 Hanja characters when title contains them', () => {
    expect(pickWatermarkChar('서경(書境) 새로운 지평')).toBe('書境')
  })

  it('returns first Hangul character when no Hanja present', () => {
    expect(pickWatermarkChar('훈민정음 정신')).toBe('훈')
  })

  it('falls back to "書" when no CJK characters', () => {
    expect(pickWatermarkChar('Modern Calligraphy Show')).toBe('書')
  })

  it('falls back to "書" for empty string', () => {
    expect(pickWatermarkChar('')).toBe('書')
  })

  it('limits Hanja extraction to 2 characters even when more present', () => {
    expect(pickWatermarkChar('天地玄黃 우주')).toBe('天地')
  })
})

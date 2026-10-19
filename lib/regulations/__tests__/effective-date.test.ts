import { latestEffectiveDate } from '../effective-date'

describe('latestEffectiveDate', () => {
  it('여러 표기 중 가장 늦은 "시행" 날짜를 고른다 — 시행령 개정일은 세지 않는다', () => {
    expect(
      latestEffectiveDate([
        '[시행 2025. 2. 8.] [제3호 시행령, 2026. 1. 1., 일부개정]',
        '[시행 2026. 2. 13.] [제1호 시행령, 2026. 2. 13., 신규 개정]',
        '[시행 2023. 8. 23.]',
        '',
      ])
    ).toBe('2026. 2. 13.')
  })

  it('월·일을 숫자로 비교한다 (2026. 1. 13. 보다 2026. 2. 1. 이 늦다)', () => {
    expect(latestEffectiveDate(['[시행 2026. 1. 13.]', '[시행 2026. 2. 1.]'])).toBe('2026. 2. 1.')
  })

  it('시행 표기가 없으면 빈 문자열', () => {
    expect(latestEffectiveDate(['', '정관'])).toBe('')
  })
})

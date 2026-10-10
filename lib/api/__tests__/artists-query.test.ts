jest.mock('../../supabase', () => ({ ensureSupabase: () => null }))

import {
  pageRange,
  sanitizeSearchTerm,
  spacingTolerantPattern,
  MAX_ARTISTS_PAGE_SIZE,
} from '../artists'

describe('pageRange', () => {
  it('turns a 1-based page into an inclusive PostgREST range', () => {
    expect(pageRange(1, 24)).toEqual({ from: 0, to: 23 })
    expect(pageRange(3, 24)).toEqual({ from: 48, to: 71 })
  })

  it('clamps bad or oversized input instead of fetching everything', () => {
    expect(pageRange(Number.NaN, Number.NaN)).toEqual({ from: 0, to: 0 })
    expect(pageRange(-2, 0)).toEqual({ from: 0, to: 0 })
    expect(pageRange(1, 10_000)).toEqual({ from: 0, to: MAX_ARTISTS_PAGE_SIZE - 1 })
  })
})

describe('sanitizeSearchTerm', () => {
  // or() 필터 문자열에 들어가므로 구문 문자가 섞이면 다른 컬럼 조건을 끼워 넣을 수 있다
  it('strips characters that would break or inject into the PostgREST or() filter', () => {
    expect(sanitizeSearchTerm('김,id.eq.1)')).toBe('김 id eq 1')
    expect(sanitizeSearchTerm('%*')).toBe('')
  })

  it('handles empty input and caps length', () => {
    expect(sanitizeSearchTerm(undefined)).toBe('')
    expect(sanitizeSearchTerm('가'.repeat(80))).toHaveLength(50)
  })
})

describe('spacingTolerantPattern', () => {
  // 원본 직함이 '고 문'·'감 사' 처럼 글자 사이에 공백이 있다
  it('matches titles stored with spaces between syllables', () => {
    expect(spacingTolerantPattern('고문')).toBe('%고%문%')
    expect(spacingTolerantPattern('고 문')).toBe('%고%문%')
  })

  it('drops LIKE wildcards from user input', () => {
    expect(spacingTolerantPattern('a_%b')).toBe('%a%b%')
  })
})

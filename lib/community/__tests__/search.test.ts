import { SEARCH_MAX, normalizeSearch, searchFilter } from '../search'

describe('normalizeSearch', () => {
  it('returns null for missing or blank input', () => {
    expect(normalizeSearch(undefined)).toBeNull()
    expect(normalizeSearch(null)).toBeNull()
    expect(normalizeSearch('')).toBeNull()
    expect(normalizeSearch('   \n\t ')).toBeNull()
  })

  it('takes the first value when the query repeats', () => {
    expect(normalizeSearch(['전시', '공모'])).toBe('전시')
  })

  it('collapses whitespace, drops control characters and caps the length', () => {
    expect(normalizeSearch('  가을\u0000  정기전\n')).toBe('가을 정기전')
    expect(normalizeSearch('가'.repeat(SEARCH_MAX + 10))).toHaveLength(SEARCH_MAX)
  })
})

describe('searchFilter', () => {
  it('matches title or body, quoted so commas and parentheses stay literal', () => {
    expect(searchFilter('쉼표, (괄호)')).toBe(
      'title.ilike."%쉼표, (괄호)%",body.ilike."%쉼표, (괄호)%"'
    )
  })

  it('escapes LIKE wildcards so % and _ are searched as text', () => {
    expect(searchFilter('100%_')).toBe('title.ilike."%100\\\\%\\\\_%",body.ilike."%100\\\\%\\\\_%"')
  })

  it('escapes quotes and backslashes inside the quoted value', () => {
    expect(searchFilter('"a\\b')).toBe('title.ilike."%\\"a\\\\\\\\b%",body.ilike."%\\"a\\\\\\\\b%"')
  })

  it('drops * which PostgREST would treat as a wildcard', () => {
    expect(searchFilter('a*b')).toBe('title.ilike."%a b%",body.ilike."%a b%"')
  })
})

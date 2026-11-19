import { beforeFilter, decodeCursor, encodeCursor, pageHref } from '../paging'

const ID = '0b6f5a5e-1c2d-4e3f-8a9b-0c1d2e3f4a5b'
const AT = '2026-10-26T12:34:56.123456+00:00'

describe('encodeCursor / decodeCursor', () => {
  it('round-trips the last row, keeping microseconds as written', () => {
    const cursor = encodeCursor({ created_at: AT, id: ID })
    expect(cursor).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeCursor(cursor)).toEqual({ createdAt: AT, id: ID })
  })

  it('accepts a Z timestamp without fractions', () => {
    const cursor = encodeCursor({ created_at: '2026-10-26T12:34:56Z', id: ID })
    expect(decodeCursor(cursor)).toEqual({ createdAt: '2026-10-26T12:34:56Z', id: ID })
  })

  it('returns null for missing, repeated-first or malformed input', () => {
    expect(decodeCursor(undefined)).toBeNull()
    expect(decodeCursor(null)).toBeNull()
    expect(decodeCursor('')).toBeNull()
    expect(decodeCursor('not base64 !!')).toBeNull()
    expect(decodeCursor(Buffer.from(`${AT}~not-a-uuid`).toString('base64url'))).toBeNull()
    expect(decodeCursor(Buffer.from(`yesterday~${ID}`).toString('base64url'))).toBeNull()
    expect(decodeCursor(Buffer.from(`${AT},id.gt.0~${ID}`).toString('base64url'))).toBeNull()
    expect(decodeCursor('a'.repeat(500))).toBeNull()
  })

  it('takes the first value when the parameter repeats', () => {
    const cursor = encodeCursor({ created_at: AT, id: ID })
    expect(decodeCursor([cursor, 'junk'])).toEqual({ createdAt: AT, id: ID })
  })
})

describe('beforeFilter', () => {
  it('selects rows strictly older, breaking ties by id', () => {
    expect(beforeFilter({ createdAt: AT, id: ID })).toBe(
      `created_at.lt."${AT}",and(created_at.eq."${AT}",id.lt.${ID})`
    )
  })
})

describe('pageHref', () => {
  it('keeps the tab and search and adds the cursor', () => {
    expect(pageHref({ view: 'mine', search: '가을 전시', before: 'abc' })).toBe(
      '/community/board?view=mine&q=%EA%B0%80%EC%9D%84+%EC%A0%84%EC%8B%9C&before=abc'
    )
  })

  it('drops empty parts so the first page is the plain board address', () => {
    expect(pageHref({ view: 'all', search: null })).toBe('/community/board')
  })
})

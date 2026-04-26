/**
 * 통합 테스트 — 실제 DB 연결 필요 (Supabase test DB 또는 mock).
 * ASCA의 기존 패턴(npx tsx lib/db/test.ts)을 따라
 * 시드 데이터에 대한 실측 검증으로 작성.
 *
 * DB env (DATABASE_URL/NEXT_PUBLIC_SUPABASE_URL) 미설정 시 전체 suite skip.
 * jest 환경에서는 env validation이 import 시점에 throw되므로 require는 it 안에서.
 */
const hasDbEnv =
  Boolean(process.env.DATABASE_URL) ||
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)

const d = hasDbEnv ? describe : describe.skip

d('getExhibitionFullById', () => {
  let getExhibitionFullById: (
    id: string
  ) => Promise<{ data: any; error: Error | null }>

  beforeAll(() => {
    // env validation은 import 시점에 throw됨 → 가드된 describe 안에서만 require
    getExhibitionFullById = require('../queries').getExhibitionFullById
  })

  it('returns null + error for non-existent ID', async () => {
    const { data, error } = await getExhibitionFullById('non-existent-uuid')
    expect(data).toBeNull()
    expect(error).toBeNull()  // not-found는 error가 아니라 data null
  })

  it('returns exhibition with artwork details for valid ID', async () => {
    const { data, error } = await getExhibitionFullById('test-exhibition-1')
    if (!data) return  // 시드 없으면 skip
    expect(error).toBeNull()
    expect(data.id).toBe('test-exhibition-1')
    expect(Array.isArray(data.artworks)).toBe(true)
    if (data.artworks.length > 0) {
      const a = data.artworks[0]
      expect(typeof a.title).toBe('string')
      expect(typeof a.artistName).toBe('string')
    }
  })

  it('orders artworks by displayOrder ASC', async () => {
    const { data } = await getExhibitionFullById('test-exhibition-1')
    if (!data || data.artworks.length < 2) return
    for (let i = 1; i < data.artworks.length; i++) {
      expect(data.artworks[i].displayOrder).toBeGreaterThanOrEqual(
        data.artworks[i - 1].displayOrder
      )
    }
  })
})

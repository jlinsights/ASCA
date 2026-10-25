/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET } from '../route'
import type { GalleryItem } from '@/lib/types/gallery/gallery-legacy'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'

interface Body {
  items: GalleryItem[]
  pagination: { totalCount: number; totalPages: number; photoCount: number; limit: number }
}

async function get(query: string): Promise<Body> {
  const response = await GET(new NextRequest(`http://localhost/api/gallery?${query}`))
  return (await response.json()) as Body
}

async function allPages(query: string): Promise<GalleryItem[]> {
  const first = await get(`${query}&page=1&limit=48`)
  const rest = await Promise.all(
    Array.from({ length: first.pagination.totalPages - 1 }, (_, i) =>
      get(`${query}&page=${i + 2}&limit=48`)
    )
  )
  return [first, ...rest].flatMap(body => body.items)
}

describe('갤러리 API — 비슷한 사진 접기', () => {
  // 회귀: 연속 촬영으로 거의 같은 사진이 목록에 2~7장씩 줄줄이 보였다
  it('기본은 대표 사진만 — 쪽 수와 건수가 접은 결과를 따른다', async () => {
    const body = await get('page=1&limit=48')
    expect(body.pagination.photoCount).toBe(582)
    expect(body.pagination.totalCount).toBeLessThan(582)
    expect(body.pagination.totalPages).toBe(Math.ceil(body.pagination.totalCount / 48))
  })

  it('접힌 사진은 하나도 사라지지 않는다 — 대표 + 묶인 사진 = 전체', async () => {
    const items = await allPages('')
    const shown = new Set(
      items.flatMap(item => (item.similar ? item.similar.map(frame => frame.id) : [item.id]))
    )
    expect(shown.size).toBe(582)
    expect(items.every(item => !item.similar || item.similar.some(f => f.id === item.id))).toBe(
      true
    )
  })

  it('similar=all 이면 모두 펼쳐 보인다', async () => {
    const body = await get('similar=all&page=1&limit=48')
    expect(body.pagination.totalCount).toBe(582)
    expect(body.items.some(item => item.similar)).toBe(false)
  })

  it('분류로 거른 뒤에도 묶음이 그 분류 안에서만 생긴다', async () => {
    const items = await allPages('category=award')
    expect(items.every(item => item.category === 'award')).toBe(true)
    expect(items.flatMap(item => item.similar ?? []).length).toBeGreaterThan(0)
  })
})

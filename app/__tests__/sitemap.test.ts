/**
 * @jest-environment node
 */
import { localPosts } from '@/lib/blog/local-posts'

const rangeCalls: Array<[number, number]> = []
let pages: Array<{ data: unknown; error: unknown }> = []

const anonClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn(() => ({
        range: jest.fn((from: number, to: number) => {
          rangeCalls.push([from, to])
          return Promise.resolve(pages.shift() ?? { data: [], error: null })
        }),
      })),
    })),
  })),
}
const adminFactory = jest.fn()

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => anonClient,
  getSupabaseAdminClient: (...args: unknown[]) => adminFactory(...args),
  ensureSupabaseAdmin: (...args: unknown[]) => adminFactory(...args),
}))

import sitemap from '../sitemap'

const BASE = 'https://orientalcalligraphy.org'
const urls = (entries: Awaited<ReturnType<typeof sitemap>>) => entries.map(e => e.url)

beforeEach(() => {
  rangeCalls.length = 0
  pages = []
  anonClient.from.mockClear()
  adminFactory.mockClear()
})

describe('sitemap', () => {
  test('옛 Webflow 블로그 글을 /blog/<slug> 로 싣는다', async () => {
    const entries = await sitemap()
    for (const post of localPosts) expect(urls(entries)).toContain(`${BASE}/blog/${post.id}`)
  })

  test('공개 작가 상세를 anon 클라이언트로 읽어 싣고, 1,000행씩 끝까지 넘긴다', async () => {
    const first = Array.from({ length: 1000 }, (_, i) => ({
      id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      updated_at: '2026-10-01T00:00:00Z',
    }))
    pages = [
      { data: first, error: null },
      { data: [{ id: 'aaaaaaaa-0000-4000-8000-000000000001', updated_at: null }], error: null },
    ]
    const entries = await sitemap()
    expect(anonClient.from).toHaveBeenCalledWith('artists')
    expect(adminFactory).not.toHaveBeenCalled()
    expect(rangeCalls).toEqual([
      [0, 999],
      [1000, 1999],
    ])
    expect(urls(entries)).toContain(`${BASE}/artists/${first[0]!.id}`)
    expect(urls(entries)).toContain(`${BASE}/artists/aaaaaaaa-0000-4000-8000-000000000001`)
    const artist = entries.find(e => e.url === `${BASE}/artists/${first[0]!.id}`)
    expect(artist?.lastModified).toEqual(new Date('2026-10-01T00:00:00Z'))
  })

  test('DB 오류면 작가 없이 고정 페이지·블로그만 낸다 (빌드를 죽이지 않는다)', async () => {
    pages = [{ data: null, error: { message: 'boom' } }]
    const entries = await sitemap()
    expect(urls(entries)).toContain(BASE)
    expect(urls(entries).some(u => u.startsWith(`${BASE}/artists/`))).toBe(false)
    expect(urls(entries)).toContain(`${BASE}/blog/${localPosts[0]!.id}`)
  })
})

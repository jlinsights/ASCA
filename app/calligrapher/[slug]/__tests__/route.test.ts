/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const getArtist = jest.fn()
jest.mock('@/lib/api/artists', () => ({ getArtist: (key: string) => getArtist(key) }))
jest.mock('@/lib/utils/logger', () => ({ log: { error: jest.fn() } }))

import { GET } from '../route'

const call = (slug: string) =>
  GET(new NextRequest(`http://localhost/calligrapher/${slug}`), {
    params: Promise.resolve({ slug }),
  })

beforeEach(() => getArtist.mockReset())

describe('GET /calligrapher/[slug] (옛 Webflow 작가 주소)', () => {
  it('찾으면 대표 slug 의 작가 페이지로 영구 이동', async () => {
    getArtist.mockResolvedValue({ id: 'a1', slug: 'test-artist' })
    const response = await call('test-artist-2')
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('http://localhost/artists/test-artist')
    expect(getArtist).toHaveBeenCalledWith('test-artist-2')
  })

  it('slug 가 없는 작가는 id 주소로', async () => {
    getArtist.mockResolvedValue({ id: 'a1', slug: null })
    const response = await call('test-artist')
    expect(response.headers.get('location')).toBe('http://localhost/artists/a1')
  })

  // 비공개 작가(RLS)·대조 미확정 작가는 404 대신 예전처럼 목록으로
  it('못 찾으면 작가 목록으로 임시 이동', async () => {
    getArtist.mockResolvedValue(null)
    const response = await call('unknown-artist')
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/artists')
  })

  it('조회가 실패해도 목록으로', async () => {
    getArtist.mockRejectedValue(new Error('db down'))
    const response = await call('test-artist')
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/artists')
  })
})

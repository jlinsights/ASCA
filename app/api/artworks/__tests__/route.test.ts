/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const fetchArtworks = jest.fn()
const fetchArtworksByArtist = jest.fn()

jest.mock('@/lib/api/artworks', () => ({
  fetchArtworks: (...args: unknown[]) => fetchArtworks(...args),
  fetchArtworksByArtist: (...args: unknown[]) => fetchArtworksByArtist(...args),
}))
// 작가 이름 붙이기는 이 테스트의 관심 밖 — 클라이언트가 없으면 artist: null 로 돌려준다
jest.mock('@/lib/supabase', () => ({ getSupabaseClient: () => null }))

import { GET } from '../route'

const ARTIST = 'e19df5c5-0f91-431b-8891-9f79ee98f3f4'
const call = (query = '') => GET(new NextRequest(`http://localhost/api/artworks${query}`))

beforeEach(() => {
  fetchArtworks.mockReset().mockResolvedValue({ data: [], error: null })
  fetchArtworksByArtist.mockReset().mockResolvedValue({ data: [], error: null })
})

// 회귀: artist_id 를 무시하고 전체 작품을 돌려줘서, 작가 상세의 작품 칸을 켤 수 없었다
describe('GET /api/artworks?artist_id=', () => {
  it('그 작가의 공개(published) 작품만 조회한다', async () => {
    fetchArtworksByArtist.mockResolvedValue({
      data: [{ id: 'w1', artist_id: ARTIST, title: '獨逍遙', images: {}, year_created: 2025 }],
      error: null,
    })
    const response = await call(`?artist_id=${ARTIST}`)
    expect(response.status).toBe(200)
    expect(fetchArtworksByArtist).toHaveBeenCalledWith(ARTIST, ['published'])
    expect(fetchArtworks).not.toHaveBeenCalled()
    const body = await response.json()
    expect(body.artworks.map((a: { id: string }) => a.id)).toEqual(['w1'])
  })

  it('artistId 표기도 받는다', async () => {
    await call(`?artistId=${ARTIST}`)
    expect(fetchArtworksByArtist).toHaveBeenCalledWith(ARTIST, ['published'])
  })

  it('uuid 가 아닌 작가 id 는 400 — 필터 없이 전체를 돌려주지 않는다', async () => {
    const response = await call('?artist_id=not-a-uuid')
    expect(response.status).toBe(400)
    expect(fetchArtworks).not.toHaveBeenCalled()
    expect(fetchArtworksByArtist).not.toHaveBeenCalled()
  })

  it('작가 id 가 없으면 예전처럼 전체 목록', async () => {
    await call()
    expect(fetchArtworks).toHaveBeenCalled()
    expect(fetchArtworksByArtist).not.toHaveBeenCalled()
  })
})

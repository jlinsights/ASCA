/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const getArtist = jest.fn()
const getArtistById = jest.fn()

jest.mock('@/lib/api/artists', () => ({ getArtist: (id: string) => getArtist(id) }))
jest.mock('@/lib/api/enhanced-admin-api', () => ({
  EnhancedAdminAPI: { getArtistById: (id: string) => getArtistById(id) },
}))
jest.mock('@/lib/auth/middleware', () => ({ requireAdminAuth: jest.fn() }))

import { GET } from '../route'

const call = (id: string) =>
  GET(new NextRequest(`http://localhost/api/artists/${id}`), { params: Promise.resolve({ id }) })

beforeEach(() => {
  getArtist.mockReset()
  getArtistById.mockReset()
})

// 회귀: 공개 GET 이 service role(select '*')로 조회해 RLS 를 우회했다 — 비공개 준회원이 내부 컬럼째 노출됐다
describe('GET /api/artists/[id]', () => {
  it('공개 조회 경로(anon + 공개 컬럼)만 쓰고 관리자 조회는 부르지 않는다', async () => {
    getArtist.mockResolvedValue({ id: 'a1', name: '김작가' })
    const response = await call('a1')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ id: 'a1', name: '김작가' })
    expect(getArtist).toHaveBeenCalledWith('a1')
    expect(getArtistById).not.toHaveBeenCalled()
  })

  it('RLS 로 보이지 않는 작가는 404', async () => {
    getArtist.mockResolvedValue(null)
    const response = await call('hidden-1')
    expect(response.status).toBe(404)
    expect(getArtistById).not.toHaveBeenCalled()
  })
})

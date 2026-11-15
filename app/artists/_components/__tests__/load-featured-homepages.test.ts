import { getArtist } from '@/lib/api/artists'
import { FEATURED_HOMEPAGES } from '../featured-homepages'
import { loadFeaturedHomepages } from '../load-featured-homepages'

jest.mock('@/lib/api/artists', () => ({ getArtist: jest.fn() }))
jest.mock('@/lib/utils/logger', () => ({ log: { error: jest.fn() } }))

const mockGetArtist = getArtist as jest.MockedFunction<typeof getArtist>

function row(slug: string, profileImage: string | null) {
  return {
    id: slug,
    name: slug,
    name_en: null,
    art_name_hanja: null,
    profile_image: profileImage,
    death_year: null,
  } as unknown as Awaited<ReturnType<typeof getArtist>>
}

describe('loadFeaturedHomepages', () => {
  it('DB 사진이 없으면 저장소 사진(portrait)으로 채운다 — 성곡', async () => {
    mockGetArtist.mockImplementation(async slug => row(slug, null))
    const artists = await loadFeaturedHomepages()
    const seonggok = artists.find(artist => artist.slug === 'lim-hyun-ki')
    expect(seonggok?.profileImage).toBe('/images/artists/lim-hyun-ki/portrait.jpg')
    // portrait 가 없는 작가는 그대로 비어 있다(호 세로쓰기 칸)
    const withoutPortrait = FEATURED_HOMEPAGES.filter(entry => !entry.portrait).map(e => e.slug)
    for (const slug of withoutPortrait) {
      expect(artists.find(artist => artist.slug === slug)?.profileImage).toBeNull()
    }
  })

  it('DB 사진이 생기면 DB 사진이 이긴다', async () => {
    mockGetArtist.mockImplementation(async slug => row(slug, `https://cdn/${slug}.png`))
    const artists = await loadFeaturedHomepages()
    expect(artists.find(artist => artist.slug === 'lim-hyun-ki')?.profileImage).toBe(
      'https://cdn/lim-hyun-ki.png'
    )
  })
})

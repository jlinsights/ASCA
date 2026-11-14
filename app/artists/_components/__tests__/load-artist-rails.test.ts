import { getArtists } from '@/lib/api/artists'
import { getSupabaseClient } from '@/lib/supabase'
import { artistRankLinks } from '@/components/layout/site-menu'
import {
  filtersFromHref,
  loadArtistRails,
  photoFirst,
  RAIL_MIN,
  RAIL_SIZE,
  type ArtistRailItem,
} from '../load-artist-rails'

jest.mock('@/lib/api/artists', () => ({ getArtists: jest.fn() }))
jest.mock('@/lib/supabase', () => ({ getSupabaseClient: jest.fn() }))
jest.mock('@/lib/utils/logger', () => ({ log: { error: jest.fn(), warn: jest.fn() } }))

const mockGetArtists = getArtists as jest.MockedFunction<typeof getArtists>
const mockClient = getSupabaseClient as jest.MockedFunction<typeof getSupabaseClient>

const artist = (id: string, profileImage: string | null = null) => ({
  id,
  name: `작가${id}`,
  nameEn: null,
  nameJa: null,
  nameZh: null,
  bio: null,
  birthYear: null,
  deathYear: null,
  nationality: null,
  specialties: [],
  awards: [],
  profileImage,
  membershipType: '초대작가',
  artistType: null,
  title: null,
  slug: null,
  artNameKo: null,
  artNameHanja: null,
})

const artists = (n: number, withPhotoFrom = n) =>
  Array.from({ length: n }, (_, i) => artist(String(i), i >= withPhotoFrom ? `p${i}.jpg` : null))

beforeEach(() => {
  // 작품 레일은 클라이언트가 없으면 조용히 빠진다
  mockClient.mockReturnValue(null)
  mockGetArtists.mockResolvedValue({ artists: [], total: 0 })
})

describe('filtersFromHref', () => {
  it('메뉴 주소의 조건을 그대로 조회 조건으로 옮긴다', () => {
    expect(filtersFromHref('/artists?title=%EA%B3%A0%EB%AC%B8')).toEqual({
      membershipType: undefined,
      title: ['고문'],
    })
    expect(filtersFromHref('/artists?membershipType=초대작가')).toEqual({
      membershipType: ['초대작가'],
      title: undefined,
    })
  })
})

describe('photoFirst', () => {
  it('사진 있는 작가를 앞으로 옮기되 나머지 순서는 지킨다', () => {
    const items: ArtistRailItem[] = [
      { artist: artist('a'), cover: null },
      { artist: artist('b', 'b.jpg'), cover: null },
      { artist: artist('c'), cover: null },
      { artist: artist('d'), cover: { src: 'w.jpg', width: 1, height: 3 } },
    ]
    expect(photoFirst(items).map(item => item.artist.id)).toEqual(['b', 'd', 'a', 'c'])
  })
})

describe('loadArtistRails', () => {
  it('직함·등급 레일은 메뉴와 같은 주소·제목으로, 사진 있는 작가부터 최대 RAIL_SIZE 명', async () => {
    mockGetArtists.mockResolvedValue({ artists: artists(20, 15), total: 20 })
    const rails = await loadArtistRails()
    expect(rails.map(rail => rail.href)).toEqual(artistRankLinks.map(link => link.href))
    expect(rails.map(rail => rail.labelKey)).toEqual(artistRankLinks.map(link => link.labelKey))
    expect(rails[0].items).toHaveLength(RAIL_SIZE)
    expect(rails[0].items[0].artist.profileImage).toBe('p15.jpg')
  })

  it('RAIL_MIN 명보다 적은 레일은 뺀다', async () => {
    mockGetArtists.mockImplementation(async filters =>
      filters?.membershipType?.[0] === '추천작가'
        ? { artists: artists(RAIL_MIN - 1), total: RAIL_MIN - 1 }
        : { artists: artists(RAIL_MIN), total: RAIL_MIN }
    )
    const rails = await loadArtistRails()
    expect(rails.map(rail => rail.href)).not.toContain(
      artistRankLinks.find(link => link.href.includes(encodeURIComponent('추천작가')))?.href
    )
    expect(rails).toHaveLength(artistRankLinks.length - 1)
  })

  it('레일 하나가 실패해도 나머지 레일은 돌려준다', async () => {
    mockGetArtists.mockImplementation(async filters => {
      if (filters?.title?.[0] === '고문') throw new Error('db down')
      return { artists: artists(RAIL_MIN), total: RAIL_MIN }
    })
    const rails = await loadArtistRails()
    expect(rails).toHaveLength(artistRankLinks.length - 1)
  })

  it('새로 걸린 작품 레일 — 작가당 최근 한 점, 이미지 없는 작품·탈퇴 작가는 뺀다', async () => {
    const works = [
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `w${i}`,
        artist_id: String(i),
        images: { main: { url: `https://x/w${i}.jpg`, width: 100, height: 300 } },
      })),
      { id: 'dup', artist_id: '0', images: { main: { url: 'https://x/old.jpg' } } },
      { id: 'noimg', artist_id: '9', images: null },
    ].map(w => ({ title: 't', title_en: null, year_created: null, style: null, tags: null, ...w }))
    const rows = Array.from({ length: 8 }, (_, i) => ({
      ...artistRow(String(i)),
      membership_type: i === 7 ? '탈퇴' : '초대작가',
    }))
    const orders: unknown[][] = []
    const chain = (data: unknown) => {
      const q: Record<string, unknown> = {}
      for (const m of ['select', 'eq', 'not', 'in']) q[m] = () => q
      q.order = (...args: unknown[]) => {
        orders.push(args)
        return q
      }
      q.limit = async () => ({ data, error: null })
      q.then = (resolve: (v: unknown) => void) => resolve({ data, error: null })
      return q
    }
    mockClient.mockReturnValue({
      from: (table: string) => chain(table === 'artworks' ? works : rows),
    } as never)

    const rails = await loadArtistRails()
    const recent = rails.find(rail => rail.key === 'recent-works')
    expect(recent?.items.map(item => item.artist.id)).toEqual(['0', '1', '2', '3', '4', '5', '6'])
    expect(recent?.items[0].cover?.src).toBe('https://x/w0.jpg')
    // 회귀(Codex P2): 만든 시각이 아니라 게시한 시각 순으로 고른다
    expect(orders[0]?.[0]).toBe('published_at')
  })
})

function artistRow(id: string) {
  return {
    id,
    name: `작가${id}`,
    name_en: null,
    name_ja: null,
    name_zh: null,
    bio: null,
    birth_year: null,
    death_year: null,
    nationality: null,
    specialties: [],
    awards: [],
    profile_image: null,
    membership_type: '초대작가',
    artist_type: null,
    title: null,
    slug: null,
    art_name_ko: null,
    art_name_hanja: null,
  }
}

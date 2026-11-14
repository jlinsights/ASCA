import { getArtists } from '@/lib/api/artists'
import { getSupabaseClient } from '@/lib/supabase'
import { RAIL_MIN, RAIL_SIZE } from '../../../_components/load-artist-rails'
import { loadRelatedArtists, rankByStyles } from '../load-related-artists'

jest.mock('@/lib/api/artists', () => ({ getArtists: jest.fn() }))
jest.mock('@/lib/supabase', () => ({ getSupabaseClient: jest.fn() }))
jest.mock('@/lib/utils/logger', () => ({ log: { error: jest.fn(), warn: jest.fn() } }))

const mockGetArtists = getArtists as jest.MockedFunction<typeof getArtists>
const mockClient = getSupabaseClient as jest.MockedFunction<typeof getSupabaseClient>

const SELF = { id: 'self', membership_type: '초대작가' }

function publicArtist(id: string, profileImage: string | null = null) {
  return {
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
  }
}

function artistRow(id: string, membershipType = '초대작가') {
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
    membership_type: membershipType,
    artist_type: null,
    title: null,
    slug: null,
    art_name_ko: null,
    art_name_hanja: null,
  }
}

interface StyleRow {
  artist_id: string | null
  style: string | null
}

/** 작품 조회는 .range() 에서(페이지마다), 작가 조회는 .in() 에서 끝난다 */
function fakeClient(works: StyleRow[], rows: ReturnType<typeof artistRow>[]) {
  const calls: { table: string; inArgs: unknown[] }[] = []
  const ranges: [number, number][] = []
  const orders: unknown[][] = []
  return {
    calls,
    ranges,
    orders,
    client: {
      from: (table: string) => {
        const q: Record<string, unknown> = {}
        q.select = () => q
        q.eq = () => q
        q.order = (...args: unknown[]) => {
          orders.push(args)
          return q
        }
        q.range = async (from: number, to: number) => {
          ranges.push([from, to])
          return { data: works.slice(from, to + 1), error: null }
        }
        q.in = (...args: unknown[]) => {
          calls.push({ table, inArgs: args })
          return table === 'artworks' ? q : Promise.resolve({ data: rows, error: null })
        }
        return q
      },
    },
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockClient.mockReturnValue(null)
  mockGetArtists.mockResolvedValue({ artists: [], total: 0 })
})

describe('rankByStyles', () => {
  it('겹치는 서체 종류가 많은 작가부터, 같으면 겹치는 작품이 많은 작가부터 — 자기 자신은 뺀다', () => {
    const rows: StyleRow[] = [
      { artist_id: 'a', style: '행서' },
      { artist_id: 'a', style: '행서' },
      { artist_id: 'a', style: '행서' },
      { artist_id: 'b', style: '행서' },
      { artist_id: 'b', style: '예서' },
      { artist_id: 'c', style: '예서' },
      { artist_id: 'self', style: '행서' },
      { artist_id: 'd', style: '전서' },
      { artist_id: null, style: '행서' },
    ]
    expect(rankByStyles(rows, ['행서', '예서'], 'self')).toEqual(['b', 'a', 'c'])
  })
})

describe('loadRelatedArtists', () => {
  it('서체가 겹치는 작가를 앞에, 모자라면 같은 등급 작가로 채운다(겹침·자기 자신 제외)', async () => {
    const works: StyleRow[] = [
      { artist_id: 's1', style: '행서' },
      { artist_id: 's2', style: '행서' },
      { artist_id: 'gone', style: '행서' },
    ]
    const { client, calls } = fakeClient(works, [
      artistRow('s1'),
      artistRow('s2'),
      artistRow('gone', '탈퇴'),
    ])
    mockClient.mockReturnValue(client as never)
    mockGetArtists.mockResolvedValue({
      artists: [
        publicArtist('self'),
        publicArtist('s1'),
        publicArtist('g1'),
        publicArtist('g2', 'g2.jpg'),
        ...Array.from({ length: 20 }, (_, i) => publicArtist(`f${i}`)),
      ],
      total: 24,
    })

    const rail = await loadRelatedArtists(SELF, ['행서'])
    const ids = rail?.items.map(item => item.artist.id) ?? []

    expect(rail?.key).toBe('related')
    expect(rail?.labelKey).toBe('adRelatedTitle')
    expect(rail?.href).toBeNull()
    expect(ids.slice(0, 2)).toEqual(['s1', 's2'])
    // 같은 등급 무리 안에서는 사진 있는 작가가 앞
    expect(ids[2]).toBe('g2')
    expect(ids).toHaveLength(RAIL_SIZE)
    expect(ids).not.toContain('self')
    expect(ids).not.toContain('gone')
    expect(new Set(ids).size).toBe(ids.length)
    expect(calls.find(call => call.table === 'artworks')?.inArgs).toEqual(['style', ['행서']])
    expect(mockGetArtists).toHaveBeenCalledWith({ membershipType: ['초대작가'] }, undefined, 1, 60)
  })

  it('같은 서체 작품이 한 번 응답 한도를 넘으면 id 순으로 끝까지 넘겨 읽는다', async () => {
    // 앞 1,000점은 a 의 작품, 그 뒤에만 있는 b·c 도 빠지지 않아야 한다
    const works: StyleRow[] = [
      ...Array.from({ length: 1000 }, () => ({ artist_id: 'a', style: '행서' })),
      ...Array.from({ length: 5 }, () => ({ artist_id: 'b', style: '행서' })),
      { artist_id: 'c', style: '예서' },
    ]
    const { client, ranges, orders } = fakeClient(works, [
      artistRow('a'),
      artistRow('b'),
      artistRow('c'),
    ])
    mockClient.mockReturnValue(client as never)
    mockGetArtists.mockResolvedValue({
      artists: Array.from({ length: RAIL_SIZE }, (_, i) => publicArtist(`g${i}`)),
      total: RAIL_SIZE,
    })
    const rail = await loadRelatedArtists(SELF, ['행서', '예서'])
    expect(ranges).toEqual([
      [0, 999],
      [1000, 1999],
    ])
    expect(orders[0]).toEqual(['id', { ascending: true }])
    expect(rail?.items.slice(0, 3).map(item => item.artist.id)).toEqual(['a', 'b', 'c'])
  })

  it('일반작가는 DB 에 저장된 값(회원작가)으로 채운다', async () => {
    mockGetArtists.mockResolvedValue({
      artists: Array.from({ length: RAIL_SIZE }, (_, i) => publicArtist(`m${i}`)),
      total: RAIL_SIZE,
    })
    const rail = await loadRelatedArtists({ id: 'self', membership_type: '회원작가' }, [])
    expect(mockGetArtists).toHaveBeenCalledWith({ membershipType: ['회원작가'] }, undefined, 1, 60)
    expect(rail?.items).toHaveLength(RAIL_SIZE)
  })

  it('RAIL_MIN 명이 안 되면 줄을 걸지 않는다', async () => {
    mockGetArtists.mockResolvedValue({
      artists: Array.from({ length: RAIL_MIN - 1 }, (_, i) => publicArtist(`m${i}`)),
      total: RAIL_MIN - 1,
    })
    expect(await loadRelatedArtists(SELF, [])).toBeNull()
  })

  it('조회가 실패하면 null — 작가 페이지는 그대로 보인다', async () => {
    mockClient.mockReturnValue({
      from: () => {
        throw new Error('boom')
      },
    } as never)
    expect(await loadRelatedArtists(SELF, ['행서'])).toBeNull()
  })
})

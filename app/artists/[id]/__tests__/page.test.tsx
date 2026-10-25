import { render, screen, within } from '@testing-library/react'
import ArtistPage, { generateMetadata } from '../page'

const ARTIST = 'e19df5c5-0f91-431b-8891-9f79ee98f3f4'
const PHOTO = `https://caxjyimsuvjnbmjoxfad.supabase.co/storage/v1/object/public/artist-images/profiles/${ARTIST}.png`
const BASE = 'https://caxjyimsuvjnbmjoxfad.supabase.co'

const getArtist = jest.fn()
const worksQuery = jest.fn()

jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ language: 'ko', t: (key: string) => key }),
}))
jest.mock('@/lib/utils/logger', () => ({ log: { error: jest.fn() } }))
jest.mock('@/lib/api/artists', () => ({ getArtist: (key: string) => getArtist(key) }))
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: (table: string) => {
      const filters: Array<[string, unknown]> = []
      const chain = {
        select: () => chain,
        eq: (column: string, value: unknown) => {
          filters.push([column, value])
          return filters.length === 2 ? worksQuery(table, filters) : chain
        },
      }
      return chain
    },
  }),
}))

const artistRow = {
  id: ARTIST,
  name: '김형석',
  name_en: null,
  name_ja: null,
  name_zh: '金炯石',
  bio: '고려대학교 경영대학원 수료',
  bio_en: null,
  bio_ja: null,
  bio_zh: null,
  birth_year: null,
  death_year: null,
  nationality: '韓國',
  specialties: [],
  awards: [],
  exhibitions: [],
  profile_image: PHOTO,
  membership_type: '초대작가, 심사위원',
  artist_type: null,
  title: '심사위원',
  created_at: null,
  updated_at: null,
  airtable_id: null,
  slug: 'jeongam',
}

const works = [
  {
    id: 'w1',
    title: '獨逍遙',
    title_en: null,
    year_created: 2025,
    style: '행서',
    tags: ['特選', '행서'],
    images: { main: { path: 'w1/main.webp', width: 600, height: 1800 } },
  },
  {
    id: 'w2',
    title: '제목 미상',
    title_en: null,
    year_created: 2023,
    style: null,
    tags: [],
    images: {},
  },
]

const params = (id: string) => ({ params: Promise.resolve({ id }) })

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = BASE
})

beforeEach(() => {
  getArtist.mockReset().mockResolvedValue(artistRow)
  worksQuery.mockReset().mockResolvedValue({ data: works, error: null })
})

async function renderPage(id = ARTIST) {
  render(await ArtistPage(params(id)))
}

describe('작가 상세', () => {
  // 회귀: snake_case 응답을 artist.profileImage 로 읽어 모든 작가가 빈 아이콘이었다
  it('profile_image 의 사진을 보여 준다', async () => {
    await renderPage()
    expect(screen.getByRole('img', { name: '김형석' })).toHaveAttribute('src', PHOTO)
  })

  it('그 작가의 공개 작품만 읽어 원래 비율·수상 표시와 함께 보여 준다', async () => {
    await renderPage()
    expect(worksQuery).toHaveBeenCalledWith('artworks', [
      ['artist_id', ARTIST],
      ['status', 'published'],
    ])
    const work = screen.getByRole('link', { name: /獨逍遙/ })
    expect(work).toHaveAttribute('href', '/artworks/w1')
    expect(within(work).getByRole('img', { name: '獨逍遙' })).toHaveAttribute(
      'src',
      `${BASE}/storage/v1/object/public/artwork-images/w1/main.webp`
    )
    expect(within(work).getByText('特選')).toBeInTheDocument()
  })

  it('이미지가 없는 작품은 다른 사진으로 채우지 않는다', async () => {
    await renderPage()
    const work = screen.getByRole('link', { name: /제목 미상/ })
    expect(within(work).queryByRole('img')).not.toBeInTheDocument()
  })

  // 회귀: 실제 등급 대신 'Member'·'Artist' 배지가 고정으로 찍혔다
  it('등급·직함을 겹치지 않게 한 줄로, 한자 이름을 題簽으로 쓴다', async () => {
    await renderPage()
    expect(screen.getByText('초대작가 · 심사위원')).toBeInTheDocument()
    expect(screen.queryByText('Member')).not.toBeInTheDocument()
    expect(screen.getAllByText('金炯石').length).toBeGreaterThan(0)
  })

  it('경력 줄은 연보로 나눠 보여 준다', async () => {
    getArtist.mockResolvedValue({
      ...artistRow,
      bio: '서예를 오래 익혔다.\n제10회(2013) 동양서예대전 특선\n제11회(2014) 동양서예대전 삼체상',
    })
    await renderPage()
    expect(screen.getByRole('heading', { name: '경력' })).toBeInTheDocument()
    expect(screen.getByText('서예를 오래 익혔다.')).toBeInTheDocument()
    expect(screen.getByText('2013')).toBeInTheDocument()
    expect(screen.getByText('제10회 동양서예대전 특선')).toBeInTheDocument()
  })

  it('작품·소개가 모두 없으면 빈 구역 대신 안내 한 줄', async () => {
    getArtist.mockResolvedValue({ ...artistRow, bio: null, profile_image: null })
    worksQuery.mockResolvedValue({ data: [], error: null })
    await renderPage()
    expect(screen.getByText('작가 소개와 작품을 준비하고 있습니다.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '작품' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '작가 소개' })).not.toBeInTheDocument()
  })

  it('작품을 못 읽어도 작가 소개는 보여 준다', async () => {
    worksQuery.mockResolvedValue({ data: null, error: { code: '42501' } })
    await renderPage()
    expect(screen.getByText('고려대학교 경영대학원 수료')).toBeInTheDocument()
    expect(screen.getByText('공개된 작품이 아직 없습니다.')).toBeInTheDocument()
  })

  it('없거나 비공개인 작가는 404', async () => {
    getArtist.mockResolvedValue(null)
    await expect(ArtistPage(params('hidden-artist'))).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it.each([
    ['한자·한글 둘 다', { art_name_hanja: '靑山', art_name_ko: '청산' }, '靑山 · 청산'],
    ['한자만', { art_name_hanja: '靑山', art_name_ko: null }, '靑山'],
    ['한글만', { art_name_hanja: null, art_name_ko: '청산' }, '청산'],
  ])('아호를 이름 아래 보여 준다 — %s', async (_case, artName, label) => {
    getArtist.mockResolvedValue({ ...artistRow, ...artName })
    await renderPage()
    expect(screen.getByText('雅號')).toBeInTheDocument()
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('아호가 없으면 아호 줄을 그리지 않는다', async () => {
    await renderPage()
    expect(screen.queryByText('雅號')).not.toBeInTheDocument()
  })

  it('아호가 있으면 문서 제목에 호를 이름 앞에 둔다', async () => {
    getArtist.mockResolvedValue({ ...artistRow, art_name_hanja: '靑山', art_name_ko: '청산' })
    const meta = await generateMetadata(params(ARTIST))
    expect(meta.title).toBe('청산 김형석 | 동양서예협회')
  })

  it('slug 가 있으면 canonical 을 slug 주소로 둔다', async () => {
    const meta = await generateMetadata(params(ARTIST))
    expect(meta.alternates?.canonical).toBe('/artists/jeongam')
    expect(String(meta.title)).toContain('김형석')
  })
})

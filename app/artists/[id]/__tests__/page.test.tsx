import { render, screen, within } from '@testing-library/react'
import ArtistPage from '../page'

const ARTIST = 'e19df5c5-0f91-431b-8891-9f79ee98f3f4'
const PHOTO = `https://caxjyimsuvjnbmjoxfad.supabase.co/storage/v1/object/public/artist-images/profiles/${ARTIST}.png`
const WORK_IMG = `https://caxjyimsuvjnbmjoxfad.supabase.co/storage/v1/object/public/artwork-images/w1/main.webp`

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'e19df5c5-0f91-431b-8891-9f79ee98f3f4' }),
  notFound: jest.fn(),
}))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ language: 'ko', t: (key: string) => key }),
}))

// /api/artists/[id] 는 DB 행을 snake_case 그대로 돌려준다
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
  membership_type: '초대작가',
  artist_type: null,
  title: null,
}

const fetchMock = jest.fn()
const originalFetch = global.fetch
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body })

beforeEach(() => {
  fetchMock.mockReset().mockImplementation(async (url: string) => {
    if (url === `/api/artists/${ARTIST}`) return ok(artistRow)
    if (url.startsWith('/api/artworks')) {
      return ok({
        artworks: [
          {
            id: 'w1',
            title: '獨逍遙',
            title_en: null,
            medium: '행서',
            year_created: 2025,
            image_url: WORK_IMG,
          },
          {
            id: 'w2',
            title: '제목 미상',
            title_en: null,
            medium: '초서',
            year_created: 2023,
            image_url: null,
          },
        ],
      })
    }
    throw new Error(`unexpected fetch ${url}`)
  })
  global.fetch = fetchMock as unknown as typeof fetch
})
afterAll(() => {
  global.fetch = originalFetch
})

describe('작가 상세', () => {
  // 회귀: snake_case 응답을 artist.profileImage 로 읽어 모든 작가가 빈 아이콘이었다
  it('profile_image 의 사진을 보여 준다', async () => {
    render(<ArtistPage />)
    const photo = await screen.findByRole('img', { name: '김형석' })
    expect(photo).toHaveAttribute('src', PHOTO)
  })

  // 회귀: 작품 불러오기가 "임시 비활성화"로 꺼져 늘 '작품이 없습니다' 였다
  it('그 작가의 작품만 요청해 이미지와 함께 보여 준다', async () => {
    render(<ArtistPage />)
    const work = await screen.findByRole('link', { name: /獨逍遙/ })
    expect(work).toHaveAttribute('href', '/artworks/w1')
    expect(within(work).getByRole('img', { name: '獨逍遙' })).toHaveAttribute('src', WORK_IMG)
    const artworkCall = fetchMock.mock.calls
      .map(c => c[0] as string)
      .find(u => u.startsWith('/api/artworks'))
    expect(artworkCall).toBe(`/api/artworks?artist_id=${ARTIST}`)
    expect(screen.queryByText('작품이 없습니다')).not.toBeInTheDocument()
  })

  it('이미지가 없는 작품은 다른 작가 사진으로 채우지 않고 빈 칸으로 둔다', async () => {
    render(<ArtistPage />)
    const work = await screen.findByRole('link', { name: /제목 미상/ })
    expect(within(work).queryByRole('img')).not.toBeInTheDocument()
  })
})

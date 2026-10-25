import { render, screen } from '@testing-library/react'
import type { PublicArtist } from '@/lib/api/artist-mapper'
import { ArtistCard } from '../artist-card'

jest.mock('@/components/kakao/kakao-share-button', () => ({ ArtistShareButton: () => null }))

const artist = (overrides: Partial<PublicArtist>): PublicArtist => ({
  id: '1',
  name: '김작가',
  nameEn: null,
  nameJa: null,
  nameZh: null,
  bio: null,
  birthYear: null,
  deathYear: null,
  nationality: null,
  specialties: [],
  awards: [],
  profileImage: null,
  membershipType: null,
  artistType: null,
  title: null,
  slug: null,
  artNameKo: null,
  artNameHanja: null,
  ...overrides,
})

describe('ArtistCard 작가 등급', () => {
  it.each(['pc', 'mobile'] as const)('%s: 규정 등급을 보여 준다', variant => {
    render(<ArtistCard artist={artist({ membershipType: '회원작가' })} variant={variant} />)
    expect(screen.getByText('일반작가')).toBeInTheDocument()
    expect(screen.queryByText('회원작가')).not.toBeInTheDocument()
  })

  // 회귀(Bugbot #116): 등급도 직위도 없는 준회원 카드에 빈 구분선 띠가 남았다
  it.each(['pc', 'mobile'] as const)(
    '%s: 등급·직위가 없으면 구분선 블록을 그리지 않는다',
    variant => {
      const dividers = (membershipType: string) =>
        render(
          <ArtistCard artist={artist({ membershipType })} variant={variant} />
        ).container.querySelectorAll('.border-t').length
      const graded = dividers('초대작가')
      const ungraded = dividers('준회원')
      expect(ungraded).toBe(graded - 1)
      expect(screen.queryByText('준회원')).not.toBeInTheDocument()
    }
  )
})

describe('ArtistCard 아호', () => {
  it.each(['pc', 'mobile'] as const)('%s: 아호를 이름 아래 보여 준다', variant => {
    render(
      <ArtistCard artist={artist({ artNameKo: '청산', artNameHanja: '靑山' })} variant={variant} />
    )
    expect(screen.getByText('靑山')).toBeInTheDocument()
    expect(screen.queryByText(/청산/)).not.toBeInTheDocument()
  })

  it('아호가 없으면 아호 줄이 없다', () => {
    render(<ArtistCard artist={artist({})} variant='pc' />)
    expect(screen.queryByText(/아호/)).not.toBeInTheDocument()
  })
})

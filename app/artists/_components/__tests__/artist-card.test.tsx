import { fireEvent, render, screen } from '@testing-library/react'
import type { PublicArtist } from '@/lib/api/artist-mapper'
import { ArtistCard } from '../artist-card'
import { ArtistShareButton } from '@/components/kakao/kakao-share-button'

jest.mock('@/components/kakao/kakao-share-button', () => ({
  ArtistShareButton: jest.fn(() => null),
}))

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

describe('ArtistCard 사진의 주인 확인', () => {
  it.each(['pc', 'mobile'] as const)(
    '%s: 사진이 없으면 인물 사진을 대신 사용하지 않는다',
    variant => {
      const { container } = render(<ArtistCard artist={artist({})} variant={variant} />)
      expect(screen.getByRole('img', { name: '김작가 — 초상 준비 중' })).toBeVisible()
      expect(container.querySelector('img')).toBeNull()
      expect(jest.mocked(ArtistShareButton).mock.calls.at(-1)?.[0].imageUrl).toBe(
        '/placeholder.svg'
      )
    }
  )

  it('등록된 사진은 해당 작가의 초상으로 표시하고 공유한다', () => {
    const url = 'https://example.test/artist-portrait.jpg'
    render(<ArtistCard artist={artist({ profileImage: url })} variant='pc' />)
    expect(screen.getAllByAltText('김작가')).toHaveLength(2)
    expect(screen.queryByText('초상 준비 중')).toBeNull()
    expect(jest.mocked(ArtistShareButton).mock.calls.at(-1)?.[0].imageUrl).toBe(url)
  })

  it('사진 로딩에 실패해도 타인의 초상으로 바꾸지 않는다', () => {
    const { container, rerender } = render(
      <ArtistCard
        artist={artist({ profileImage: 'https://example.test/missing.jpg' })}
        variant='pc'
      />
    )
    fireEvent.error(screen.getAllByAltText('김작가')[0]!)
    expect(screen.getByText('초상 준비 중')).toBeVisible()
    expect(container.querySelector('img')).toBeNull()
    expect(jest.mocked(ArtistShareButton).mock.calls.at(-1)?.[0].imageUrl).toBe('/placeholder.svg')
    rerender(
      <ArtistCard
        artist={artist({ profileImage: 'https://example.test/replacement.jpg' })}
        variant='pc'
      />
    )
    expect(screen.getAllByAltText('김작가')).toHaveLength(2)
  })
})

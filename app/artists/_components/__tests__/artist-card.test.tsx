import { render, screen } from '@testing-library/react'
import type { PublicArtist } from '@/lib/api/artist-mapper'
import { ArtistCard, photoPlaceholderName } from '../artist-card'

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

// 회귀(2026-10-25): 사진 없는 작가 카드에 다른 작가(강대희) 사진이 기본 이미지로 걸렸고,
// 사진 칸 아래 잘린 둥근 프로필·이름이 한 번 더 보였다
describe('ArtistCard 사진', () => {
  it.each(['pc', 'mobile'] as const)('%s: 사진이 없으면 다른 사람 사진을 쓰지 않는다', variant => {
    const { container } = render(<ArtistCard artist={artist({})} variant={variant} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.innerHTML).not.toContain('kangdaehee')
  })

  it.each(['pc', 'mobile'] as const)('%s: 사진이 있으면 한 장만 건다', variant => {
    const { container } = render(
      <ArtistCard
        artist={artist({ profileImage: 'https://example.test/me.png' })}
        variant={variant}
      />
    )
    expect(container.querySelectorAll('img')).toHaveLength(1)
  })

  it.each(['pc', 'mobile'] as const)('%s: 이름은 카드에 한 번만 보인다', variant => {
    render(
      <ArtistCard
        artist={artist({ profileImage: 'https://example.test/me.png', nameEn: 'Kim' })}
        variant={variant}
      />
    )
    expect(screen.getAllByRole('heading', { name: '김작가' })).toHaveLength(1)
  })
})

describe('photoPlaceholderName', () => {
  it('한자 이름이 있으면 한자, 없거나 한자가 아니면 한글 이름', () => {
    expect(photoPlaceholderName({ name: '강명희', nameZh: '姜明姬' })).toBe('姜明姬')
    expect(photoPlaceholderName({ name: '감해빈', nameZh: null })).toBe('감해빈')
    expect(photoPlaceholderName({ name: '감해빈', nameZh: 'Gam' })).toBe('감해빈')
  })

  it('사진 없는 카드는 그 작가의 이름을 사진 칸에 쓴다', () => {
    const { container } = render(<ArtistCard artist={artist({ nameZh: '金作家' })} variant='pc' />)
    expect(container.querySelector('[aria-hidden="true"][lang="zh-Hant"]')).toHaveTextContent(
      '金作家'
    )
  })
})

import { render, screen } from '@testing-library/react'
import type { PublicArtist } from '@/lib/api/artist-mapper'
import { ArtistCard, photoPlaceholderName } from '../artist-card'

let mockLanguage = 'ko'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ language: mockLanguage, t: (key: string) => key }),
}))
jest.mock('@/components/kakao/kakao-share-button', () => ({
  ArtistShareButton: ({ title, description }: { title: string; description: string }) => (
    <button aria-label={title} data-description={description}>
      공유
    </button>
  ),
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
  it('pc: 등급·직위가 없으면 구분선 블록을 그리지 않는다', () => {
    const dividers = (membershipType: string) =>
      render(
        <ArtistCard artist={artist({ membershipType })} variant='pc' />
      ).container.querySelectorAll('.border-t').length
    const graded = dividers('초대작가')
    const ungraded = dividers('준회원')
    expect(ungraded).toBe(graded - 1)
    expect(screen.queryByText('준회원')).not.toBeInTheDocument()
  })

  // 모바일 카드(2026-11-01)는 구분선 없이 등급 한 줄만 둔다 — 등급이 없으면 그 줄도 없다
  it('mobile: 등급·직위가 없으면 등급 줄을 그리지 않는다', () => {
    const { container } = render(
      <ArtistCard artist={artist({ membershipType: '준회원' })} variant='mobile' />
    )
    expect(container.querySelectorAll('.border-t')).toHaveLength(0)
    expect(screen.queryByText('준회원')).not.toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringMatching(/^\/artists\//))
  })
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
    expect(container.querySelector('[aria-hidden="true"][lang="zh"]')).toHaveTextContent('金作家')
  })
})

describe('ArtistCard 국적별 이름', () => {
  it('기본 이름이 이미 원어일 때도 사진 대체 이름이 다른 번역으로 바뀌지 않는다', () => {
    const source = artist({
      name: '書家一',
      nationality: '日本',
      nameJa: '書家一',
      nameZh: '書家二',
    })
    expect(photoPlaceholderName(source)).toBe('書家一')
    const { container } = render(<ArtistCard artist={source} variant='pc' />)
    expect(screen.getByRole('heading', { name: '書家一' })).toBeVisible()
    expect(container.querySelector('[aria-hidden="true"][lang="ja"]')).toHaveTextContent('書家一')
  })
  it.each(['pc', 'mobile'] as const)('%s: 일본 작가 이름·이미지 설명·공유 제목', variant => {
    render(
      <ArtistCard
        artist={artist({
          name: '가상 일본 작가',
          nationality: '日本',
          nameJa: '書家一',
          nameZh: '書家二',
          profileImage: 'https://example.test/artist.jpg',
        })}
        variant={variant}
      />
    )
    expect(screen.getByRole('heading', { name: '書家一' })).toBeVisible()
    expect(screen.getByRole('img', { name: '書家一' })).toBeVisible()
    expect(screen.getByRole('button', { name: '書家一 작가' })).toBeVisible()
    expect(screen.queryByText('가상 일본 작가')).not.toBeInTheDocument()
  })
  it.each(['pc', 'mobile'] as const)('%s: 중국 작가 이름·사진 대체 표기·故 표기', variant => {
    const { container } = render(
      <ArtistCard
        artist={artist({ nationality: '中國', nameZh: '書家二', deathYear: 2020 })}
        variant={variant}
      />
    )
    expect(screen.getByRole('heading', { name: '故 書家二' })).toBeVisible()
    expect(container.querySelector('[aria-hidden="true"][lang="zh"]')).toHaveTextContent('書家二')
  })
})

describe('ArtistCard 라벨 번역', () => {
  afterEach(() => {
    mockLanguage = 'ko'
  })
  const full = artist({
    membershipType: '초대작가',
    title: '이사',
    artNameKo: '청암',
    awards: ['대상'],
  })

  // 라이브 확인(#225 이후): 영어로 바꿔도 카드 라벨 '작가 등급'·'직위'·'아호'가 한국어로 남았다
  it.each([
    ['en', ['Artist grade', 'Position', 'Pen name', 'Awards', 'View artist']],
    ['ja', ['作家等級', '役職', '雅号', '受賞歴', '作家詳細']],
    ['zh', ['作家等級', '職位', '雅號', '獲獎經歷', '作家詳情']],
  ] as const)('pc %s: 라벨을 그 언어로 쓴다', (language, labels) => {
    mockLanguage = language
    const { container } = render(<ArtistCard artist={full} variant='pc' />)
    for (const label of labels) expect(container).toHaveTextContent(label)
    for (const ko of ['작가 등급', '직위', '아호', '수상 경력', '상세보기']) {
      expect(container).not.toHaveTextContent(ko)
    }
  })

  it('mobile en: 아호 낭독 라벨도 번역한다', () => {
    mockLanguage = 'en'
    const { container } = render(<ArtistCard artist={full} variant='mobile' />)
    expect(container).toHaveTextContent('Pen name')
    expect(container).not.toHaveTextContent('아호')
  })

  it('ko: 기존 한국어 라벨을 그대로 쓴다', () => {
    const { container } = render(<ArtistCard artist={full} variant='pc' />)
    for (const label of ['작가 등급', '직위', '아호', '수상 경력', '1개', '작가 상세보기']) {
      expect(container).toHaveTextContent(label)
    }
  })
})

describe('ArtistCard 카카오 공유 문구', () => {
  afterEach(() => {
    mockLanguage = 'ko'
  })
  const bare = artist({ name: '김작가' })

  it.each([
    ['ko', '김작가 작가', '서예 작가 - 동양서예협회 소속 작가입니다.'],
    [
      'en',
      '김작가 · ASCA artist',
      'Calligrapher - An artist of the Asian Society of Calligraphic Arts.',
    ],
    ['ja', '김작가 作家', '書道作家 - 東洋書道協会所属の作家です。'],
    ['zh', '김작가 作家', '書法作家 - 東洋書藝協會所屬作家。'],
  ] as const)('%s: 공유 제목과 대체 설명을 그 언어로 만든다', (language, title, description) => {
    mockLanguage = language
    render(<ArtistCard artist={bare} variant='pc' />)
    const button = screen.getByRole('button', { name: title })
    expect(button).toHaveAttribute('data-description', description)
  })
})

import { render, screen, within } from '@testing-library/react'
import { ArtistRails, railInitial, railRole } from '../artist-rails'
import type { ArtistRail } from '../load-artist-rails'

const t = (key: string) =>
  ({ arSeeAll: '모두 보기', siteArtistAdvisor: '고문', arRecentWorks: '새로 걸린 작품' })[key] ??
  key

const artist = (over: Record<string, unknown> = {}) =>
  ({
    id: 'a1',
    name: '김형석',
    nameZh: null,
    profileImage: null,
    membershipType: '초대작가, 심사위원',
    title: null,
    slug: null,
    artNameHanja: null,
    ...over,
  }) as ArtistRail['items'][number]['artist']

describe('railRole', () => {
  it('직위가 있으면 첫 직위를, 없으면 규정 등급을 고른 언어로', () => {
    expect(railRole(artist({ title: '고 문' }), 'ko')).toBe('고문')
    expect(railRole(artist({ title: '고 문' }), 'en')).not.toMatch(/[가-힣]/)
    expect(railRole(artist({ membershipType: '초대작가, 심사위원' }), 'ko')).toBe('초대작가')
    expect(railRole(artist({ membershipType: '초대작가' }), 'en')).not.toMatch(/[가-힣]/)
    expect(railRole(artist({ membershipType: null }), 'ko')).toBeNull()
  })
})

describe('railInitial', () => {
  it('호(한자) → 한자 이름 → 이름 순으로 첫 글자', () => {
    expect(railInitial(artist({ artNameHanja: '井巖', nameZh: '金亨錫' }))).toBe('井')
    expect(railInitial(artist({ nameZh: '金亨錫' }))).toBe('金')
    expect(railInitial(artist())).toBe('김')
  })
})

describe('ArtistRails', () => {
  const rails: ArtistRail[] = [
    {
      key: '/artists?title=고문',
      labelKey: 'siteArtistAdvisor',
      href: '/artists?title=%EA%B3%A0%EB%AC%B8',
      items: [
        {
          artist: artist({ id: 'a1', slug: 'hoam', profileImage: 'https://x/p.jpg' }),
          cover: null,
        },
        { artist: artist({ id: 'a2', name: '이영희', nameZh: '李英姬' }), cover: null },
      ],
    },
    {
      key: 'recent-works',
      labelKey: 'arRecentWorks',
      href: '/artworks',
      items: [
        {
          artist: artist({ id: 'a3', name: '민문자', artNameHanja: '小晶' }),
          cover: { src: 'https://x/w.jpg', width: 100, height: 300 },
        },
      ],
    },
  ]

  it('줄마다 제목·모두 보기 링크·옆으로 넘기는 목록을 단다', () => {
    render(<ArtistRails rails={rails} t={t} language='ko' />)
    const advisors = screen.getByRole('region', { name: '고문' })
    expect(within(advisors).getByRole('link', { name: /모두 보기/ })).toHaveAttribute(
      'href',
      '/artists?title=%EA%B3%A0%EB%AC%B8'
    )
    const list = within(advisors).getByRole('list', { name: '고문' })
    expect(list).toHaveAttribute('tabindex', '0')
    expect(within(advisors).getByRole('link', { name: /김형석/ })).toHaveAttribute(
      'href',
      '/artists/hoam'
    )
    // 사진이 없으면 원 안에 한자 한 글자
    expect(within(advisors).getByText('李')).toBeInTheDocument()
  })

  it('작품 줄은 작품 이미지와 작가 이름으로 작가에게 간다', () => {
    render(<ArtistRails rails={rails} t={t} language='ko' />)
    const recent = screen.getByRole('region', { name: '새로 걸린 작품' })
    expect(within(recent).getByRole('link', { name: /민문자/ })).toHaveAttribute(
      'href',
      '/artists/a3'
    )
    expect(within(recent).getByText('小晶')).toBeInTheDocument()
  })

  it('줄이 없으면 아무것도 그리지 않는다', () => {
    const { container } = render(<ArtistRails rails={[]} t={t} language='ko' />)
    expect(container).toBeEmptyDOMElement()
  })
})

import { render, screen, within } from '@testing-library/react'
import type { Language } from '@/lib/i18n/types'
import { regulationHref } from '@/lib/regulations/catalog'
import { FeaturedHomepagesSection, type FeaturedArtist } from '../featured-homepages-section'
import { FEATURED_HOMEPAGES, INVITE_LINKS } from '../featured-homepages'
import { featuredHomepagesCopy } from '../featured-homepages-copy'

let language: Language = 'ko'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key, language }),
}))

afterEach(() => {
  language = 'ko'
})

const ARTISTS: FeaturedArtist[] = [
  {
    slug: 'lim-hyun-ki',
    name: '임현기',
    nameEn: null,
    artNameHanja: '惺谷',
    profileImage: null,
    deathYear: 2026,
    sites: [{ url: 'https://seonggok.com', kind: 'personal' }],
    role: { ko: '협회 창립자 · 명예이사장', en: 'Founder', ja: '創立者', zh: '創會者' },
    note: 'renewed',
    story: null,
  },
  {
    slug: 'heelang',
    name: '공경순',
    nameEn: null,
    artNameHanja: '熙勆',
    profileImage: 'https://example.supabase.co/storage/v1/object/public/a.jpg',
    deathYear: null,
    sites: [
      { url: 'https://heelang.orientalcalligraphy.org', kind: 'personal' },
      {
        url: 'https://brushways.org',
        kind: 'group',
        name: { ko: '브러시웨이즈', en: 'Brushways', ja: 'ブラッシュウェイズ', zh: 'Brushways' },
      },
    ],
    role: null,
    note: null,
    story: null,
  },
]

const cards = () =>
  screen
    .getAllByRole('listitem')
    .filter(item => item.querySelector('h3'))
    .map(item => within(item as HTMLElement))

describe('홈페이지 작가 목록', () => {
  // 같은 이름의 비공개 회원이 있다 — 이름이 아니라 slug 로만 고른다
  it('세 작가를 slug 로 고르고 성곡·아남·희랑 순서다', () => {
    expect(FEATURED_HOMEPAGES.map(entry => entry.slug)).toEqual(['lim-hyun-ki', 'anam', 'heelang'])
    for (const entry of FEATURED_HOMEPAGES) {
      expect(entry.sites[0]?.kind).toBe('personal')
      for (const site of entry.sites) expect(site.url).toMatch(/^https:\/\//)
    }
  })

  it('희랑은 개인 홈페이지와 브러시웨이즈 단체 홈페이지를 함께 건다', () => {
    const heelang = FEATURED_HOMEPAGES.find(entry => entry.slug === 'heelang')
    expect(heelang?.sites.map(site => site.url)).toEqual([
      'https://heelang.orientalcalligraphy.org',
      'https://brushways.org',
    ])
  })

  it('작가마다 협회 작가 소개와 홈페이지(새 창)로 잇는다', () => {
    render(<FeaturedHomepagesSection artists={ARTISTS} />)
    expect(cards()).toHaveLength(2)
    for (const [index, artist] of ARTISTS.entries()) {
      const card = cards()[index]!
      expect(card.getByRole('link', { name: /작가 소개/ })).toHaveAttribute(
        'href',
        `/artists/${artist.slug}`
      )
      const external = card.getAllByRole('link').filter(link => link.getAttribute('target'))
      expect(external.map(link => link.getAttribute('href'))).toEqual(artist.sites.map(s => s.url))
      for (const link of external) expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
    expect(cards()[1]!.getByRole('link', { name: /브러시웨이즈/ })).toHaveAttribute(
      'href',
      'https://brushways.org'
    )
  })

  it('별세한 창립자는 고인 표시·협회 내 자리·새 단장 표시를 단다', () => {
    render(<FeaturedHomepagesSection artists={ARTISTS} />)
    const founder = cards()[0]!
    expect(founder.getByRole('heading', { level: 3 })).toHaveTextContent('故 임현기')
    expect(founder.getByText('협회 창립자 · 명예이사장')).toBeInTheDocument()
    expect(founder.getByText(featuredHomepagesCopy.ko.renewed)).toBeInTheDocument()
    expect(cards()[1]!.queryByText(featuredHomepagesCopy.ko.renewed)).not.toBeInTheDocument()
  })

  it('아남은 심사위원장이고, 書境 개인전과 홈페이지가 이어진 사례를 보여 준다', () => {
    const anam = FEATURED_HOMEPAGES.find(entry => entry.slug === 'anam')
    expect(anam?.role?.ko).toBe('협회 심사위원장')
    expect(anam?.story?.ko).toContain('書境 새로운 지평')
    render(
      <FeaturedHomepagesSection
        artists={[{ ...ARTISTS[1]!, role: anam!.role!, story: anam!.story! }]}
      />
    )
    expect(screen.getByText(/개인전으로 참여하며 홈페이지를 열었습니다/)).toBeInTheDocument()
  })

  it('사진이 없으면 호를 크게 보여 준다', () => {
    render(<FeaturedHomepagesSection artists={ARTISTS} />)
    expect(screen.getAllByText('惺谷').length).toBeGreaterThan(1)
    expect(screen.getByRole('img', { name: '공경순' })).toBeInTheDocument()
  })

  it('h1 을 만들지 않는다 — 페이지 제목은 히어로 하나', () => {
    render(<FeaturedHomepagesSection artists={ARTISTS} />)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('작가를 하나도 못 읽어도 안내 띠는 남는다', () => {
    render(<FeaturedHomepagesSection artists={[]} />)
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })
})

describe('書境 개인전·부스전·홈페이지 안내', () => {
  it('비용은 쓰지 않고 규정 조문과 출품 경로로 보낸다', () => {
    render(<FeaturedHomepagesSection artists={ARTISTS} />)
    const invite = within(screen.getByRole('complementary'))
    const copy = featuredHomepagesCopy.ko
    expect(invite.getByRole('link', { name: copy.linkHomepageRule })).toHaveAttribute(
      'href',
      `${regulationHref('membership-dues')}#a10`
    )
    expect(invite.getByRole('link', { name: copy.linkBenefitRule })).toHaveAttribute(
      'href',
      `${regulationHref('membership-dues')}#a10-2`
    )
    expect(invite.getByRole('link', { name: copy.linkShogyeong })).toHaveAttribute(
      'href',
      INVITE_LINKS.shogyeong
    )
    expect(invite.getByRole('link', { name: /사무국/ })).toHaveAttribute('href', '/contact')
    expect(copy.inviteBody).not.toMatch(/\d+만원|무료|최고/)
  })

  it('네 언어 문구의 키가 같다', () => {
    const keys = Object.keys(featuredHomepagesCopy.ko).sort()
    for (const lang of ['en', 'ja', 'zh'] as const) {
      expect(Object.keys(featuredHomepagesCopy[lang]).sort()).toEqual(keys)
    }
  })

  it('영어 화면은 영어 이름이 있으면 쓴다', () => {
    language = 'en'
    render(<FeaturedHomepagesSection artists={[{ ...ARTISTS[1]!, nameEn: 'Kong Kyung-soon' }]} />)
    expect(screen.getByRole('heading', { name: /Kong Kyung-soon/ })).toBeInTheDocument()
  })
})

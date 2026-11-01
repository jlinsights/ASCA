import fs from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import type { Language } from '@/lib/i18n/types'
import { ArtistHomepagesPage } from '../homepages-client'
import { featuredHomepagesCopy } from '../../_components/featured-homepages-copy'
import type { FeaturedArtist } from '../../_components/featured-homepages-section'

let language: Language = 'ko'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key, language }),
}))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))

afterEach(() => {
  language = 'ko'
})

const ARTISTS: FeaturedArtist[] = [
  {
    slug: 'anam',
    name: '아남',
    nameEn: null,
    artNameHanja: '雅南',
    profileImage: null,
    deathYear: null,
    sites: [{ url: 'https://anam.orientalcalligraphy.org', kind: 'personal' }],
    role: null,
    note: null,
    story: null,
  },
]

describe('/artists/homepages — 작가의 홈페이지', () => {
  it('메뉴 이름을 h1 으로, 소개 문단을 한 번만 보이고 카드와 書境 안내를 그린다', () => {
    render(<ArtistHomepagesPage artists={ARTISTS} />)
    const copy = featuredHomepagesCopy.ko

    expect(screen.getByRole('heading', { level: 1, name: copy.eyebrow })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: copy.title })).toBeInTheDocument()
    expect(screen.getAllByText(copy.lede)).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 3, name: /아남/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: copy.inviteTitle })).toBeInTheDocument()
  })

  it('선택한 언어로 제목이 바뀐다', () => {
    language = 'en'
    render(<ArtistHomepagesPage artists={ARTISTS} />)
    expect(
      screen.getByRole('heading', { level: 1, name: featuredHomepagesCopy.en.eyebrow })
    ).toBeInTheDocument()
  })

  it('요청마다 그린다 — 배포 뒤 숨긴 작가가 정적 결과에 남지 않게', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'page.tsx'), 'utf8')
    expect(source).toMatch(/export const dynamic = 'force-dynamic'/)
  })

  it('/artists 목록 페이지에는 더 이상 홈페이지 칸을 싣지 않는다', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', '..', 'page.tsx'), 'utf8')
    expect(source).not.toMatch(/FeaturedHomepagesSection|loadFeaturedHomepages/)
  })
})

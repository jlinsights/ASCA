import { existsSync } from 'fs'
import path from 'path'
import { headerMenu, footerMenu } from '../site-menu'
import { translations } from '@/lib/i18n/translations'
import { findRegulation } from '@/lib/regulations/catalog'

const groups = headerMenu.map(group => ({ labelKey: group.labelKey, href: group.href }))
const links = [
  ...groups,
  ...headerMenu.flatMap(group => group.items ?? []),
  ...footerMenu.flatMap(section => section.items),
]

function pageExists(href: string) {
  const route = (href.split('?')[0] ?? '').replace(/\/$/, '')
  const slug = /^\/regulations\/([^/]+)$/.exec(route)?.[1]
  if (slug && !findRegulation(slug)) return false
  const dir = path.join(
    process.cwd(),
    'app',
    route.replace(/^\/regulations\/[^/]+$/, '/regulations/[slug]')
  )
  return existsSync(path.join(dir, 'page.tsx')) || existsSync(path.join(dir, 'page.ts'))
}

describe('site-menu — 헤더·푸터 메뉴', () => {
  // 2026-10-25 요청 순서, 2026-10-26 전시·공모와 작가·작품을 각각 한 메뉴로 묶음
  it('헤더 메뉴는 정해진 순서로 놓인다', () => {
    expect(headerMenu.map(group => translations.ko?.[group.labelKey])).toStrictEqual([
      '소개',
      '전시·공모',
      '작가·작품',
      '소식',
      '정관·규정',
      '회원·후원',
    ])
  })

  it('작품은 작가·작품 메뉴 아래 하위 메뉴로 들어간다', () => {
    const artists = headerMenu.find(group => group.key === 'artists')?.items ?? []
    expect(artists.map(link => link.href)).toContain('/artworks')
    expect(headerMenu.some(group => group.href === '/artworks')).toBe(false)
  })

  it('전시·공모 메뉴는 왼쪽 전시, 오른쪽 공모 두 칸으로 하위 메뉴를 나눈다', () => {
    const group = headerMenu.find(g => g.key === 'exhibitions')
    expect(group?.columns?.map(c => translations.ko?.[c.titleKey])).toStrictEqual(['전시', '공모'])
    const [exhibitions, contests] = group?.columns ?? []
    expect(exhibitions?.items.map(link => link.href)).toStrictEqual([
      '/exhibitions/current',
      '/exhibitions/upcoming',
      '/exhibitions/past',
      '/exhibitions/online',
    ])
    expect(contests?.items.map(link => link.href)).toStrictEqual([
      '/contests',
      '/application',
      '/application-for-recommended-invited-calligrapher',
      '/commissioning-application',
      '/forms',
      '/profile/applications',
    ])
    // 평평한 목록(items)은 두 칸을 순서대로 이은 것 — 모바일·검사가 이걸 쓴다
    expect(group?.items).toStrictEqual([...(exhibitions?.items ?? []), ...(contests?.items ?? [])])
    expect(headerMenu.some(g => g.key === 'contests')).toBe(false)
  })

  it('소개·정관·규정 머리 라벨을 바꿔도 푸터 제목은 그대로다', () => {
    expect(footerMenu.map(s => translations.ko?.[s.titleKey])).toEqual(
      expect.arrayContaining(['협회 소개', '정관 및 규정'])
    )
  })

  it('소식 메뉴에서 회원 게시판으로 갈 수 있다', () => {
    const news = headerMenu.find(group => group.key === 'news')?.items ?? []
    expect(news.map(link => link.href)).toContain('/community/board')
    expect(footerMenu.flatMap(s => s.items).map(link => link.href)).toContain('/community/board')
  })

  it('회원·후원 메뉴와 푸터에서 자주 묻는 질문으로 갈 수 있다', () => {
    const membership = headerMenu.find(group => group.key === 'membership')?.items ?? []
    expect(membership.map(link => link.href)).toContain('/faq')
    expect(footerMenu.flatMap(s => s.items).map(link => link.href)).toContain('/faq')
  })

  it.each(links.filter(link => !('external' in link && link.external)).map(link => link.href))(
    '%s 는 실제 페이지로 간다',
    href => expect(pageExists(href)).toBe(true)
  )

  it.each(['ko', 'en', 'ja', 'zh'] as const)('%s: 모든 라벨이 번역돼 있다', lang => {
    const keys = [...links.map(link => link.labelKey), ...footerMenu.map(s => s.titleKey)]
    expect(keys.filter(key => !translations[lang]?.[key])).toStrictEqual([])
  })

  // 작가 필터는 /artists 와 /api/artists 의 파라미터 이름을 그대로 써야 걸린다 (?type= 은 아무것도 거르지 않았다)
  it('작가 링크는 필터 파라미터 이름만 쓴다', () => {
    const allowed = new Set(['membershipType', 'title', 'nationality'])
    const artistLinks = links.filter(link => link.href.startsWith('/artists?'))
    expect(artistLinks.length).toBeGreaterThan(5)
    for (const link of artistLinks) {
      const params = new URLSearchParams(link.href.split('?')[1])
      expect([...params.keys()].every(key => allowed.has(key))).toBe(true)
    }
  })

  it('등록자가 없는 청년작가와 예시 데이터 경로는 메뉴에 없다', () => {
    const hrefs = links.map(link => decodeURIComponent(link.href))
    expect(hrefs.some(href => href.includes('청년작가'))).toBe(false)
    expect(hrefs.some(href => href.startsWith('/artists/country/'))).toBe(false)
    expect(links.some(link => link.labelKey === 'siteArtistYoung')).toBe(false)
  })

  it('한 섹션 안에 같은 주소가 두 번 나오지 않는다', () => {
    for (const section of [
      ...headerMenu.map(g => g.items ?? []),
      ...footerMenu.map(s => s.items),
    ]) {
      const hrefs = section.map(link => link.href)
      expect(new Set(hrefs).size).toBe(hrefs.length)
    }
  })
})

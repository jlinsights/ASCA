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
  // 2026-10-25 요청 순서: 협회 소개 · 공모전 · 전시회 · 작가 · 작품 · 소식 · 정관 및 규정 · 회원·후원
  it('헤더 메뉴는 정해진 순서로 놓인다', () => {
    expect(headerMenu.map(group => translations.ko?.[group.labelKey])).toStrictEqual([
      '협회 소개',
      '공모전',
      '전시회',
      '작가',
      '작품',
      '소식',
      '정관 및 규정',
      '회원·후원',
    ])
  })

  it('소식 메뉴에서 회원 게시판으로 갈 수 있다', () => {
    const news = headerMenu.find(group => group.key === 'news')?.items ?? []
    expect(news.map(link => link.href)).toContain('/community/board')
    expect(footerMenu.flatMap(s => s.items).map(link => link.href)).toContain('/community/board')
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

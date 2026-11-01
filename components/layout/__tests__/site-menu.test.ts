import { existsSync } from 'fs'
import path from 'path'
import { headerMenu, footerMenu } from '../site-menu'
import { translations } from '@/lib/i18n/translations'
import { REGULATIONS, findRegulation, regulationHref } from '@/lib/regulations/catalog'

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
  // 2026-10-25 요청 순서, 2026-10-26 전시·공모와 작가·작품을 각각 한 메뉴로 묶음, 2026-10-31 소식을 문의 바로 앞으로
  it('헤더 메뉴는 정해진 순서로 놓인다', () => {
    expect(headerMenu.map(group => translations.ko?.[group.labelKey])).toStrictEqual([
      '소개',
      '전시·공모',
      '작가·작품',
      '정관·규정',
      '회원·후원',
      '소식',
      '문의',
    ])
  })

  it('작품은 작가·작품 메뉴 아래 하위 메뉴로 들어간다', () => {
    const artists = headerMenu.find(group => group.key === 'artists')?.items ?? []
    expect(artists.map(link => link.href)).toContain('/artworks')
    expect(headerMenu.some(group => group.href === '/artworks')).toBe(false)
  })

  // 2026-11-01 요청: 소개 8개를 네 개씩 두 칸으로
  it('소개 메뉴는 왼쪽 협회, 오른쪽 조직·활동 네 개씩 두 칸이고 푸터는 같은 순서다', () => {
    const about = headerMenu.find(group => group.key === 'about')
    const ko = (key: string) => translations.ko?.[key]
    expect(
      about?.columns?.map(column => [ko(column.titleKey), column.items.map(i => ko(i.labelKey))])
    ).toStrictEqual([
      ['협회', ['소개', '인사말씀', '사명', '연혁']],
      ['조직·활동', ['임원', '사업계획', '유관단체', '브랜드']],
    ])
    expect(about?.items).toEqual(about?.columns?.flatMap(column => column.items))
    const footerAbout = footerMenu.find(section => section.titleKey === 'siteNavAboutShort')
    expect(footerAbout?.items).toEqual(about?.items)
  })

  // 2026-11-01 요청: 왼쪽 작가 소개·작가의 홈페이지·작품, 오른쪽 고문·자문위원·초대·추천·일반작가
  it('작가·작품 메뉴는 왼쪽 둘러보기, 오른쪽 직함·등급 두 칸으로 하위 메뉴를 나눈다', () => {
    const artists = headerMenu.find(group => group.key === 'artists')
    const ko = (key: string) => translations.ko?.[key]
    expect(
      artists?.columns?.map(column => [ko(column.titleKey), column.items.map(i => ko(i.labelKey))])
    ).toStrictEqual([
      ['둘러보기', ['작가 소개', '작가의 홈페이지', '작품']],
      ['직함·등급', ['고문', '자문위원', '초대작가', '추천작가', '일반작가']],
    ])
    expect(artists?.columns?.[0]?.items.map(link => link.href)).toEqual([
      '/artists',
      '/artists/homepages',
      '/artworks',
    ])
    // 모바일 목록은 두 칸을 순서대로 이은 것
    expect(artists?.items).toEqual(artists?.columns?.flatMap(column => column.items))
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

  it('전시·공모 메뉴 머리를 누르면 공모전 페이지로 간다', () => {
    expect(headerMenu.find(g => g.key === 'exhibitions')?.href).toBe('/contests')
  })

  it('정관·규정 메뉴는 왼쪽 전체·정관·자격 요건, 오른쪽 나머지 규정 두 칸으로 나눈다', () => {
    const group = headerMenu.find(g => g.key === 'regulations')
    expect(group?.columns?.map(c => translations.ko?.[c.titleKey])).toStrictEqual([
      '정관·자격',
      '운영 규정',
    ])
    const [core, rules] = group?.columns ?? []
    expect(core?.items.map(link => translations.ko?.[link.labelKey])).toStrictEqual([
      '전체 규정 보기',
      '정관',
      '작가·회원·임원 자격 및 요건',
    ])
    // 나머지 규정은 빠짐없이, 겹치지 않게 오른쪽에
    const all = REGULATIONS.map(entry => regulationHref(entry.slug))
    const right = rules?.items.map(link => link.href) ?? []
    expect([...right].sort()).toStrictEqual(
      all.filter(href => !core?.items.some(link => link.href === href)).sort()
    )
    expect(right).not.toContain(regulationHref('articles'))
    expect(group?.items).toStrictEqual([...(core?.items ?? []), ...(rules?.items ?? [])])
  })

  it('칸 제목은 네 언어 모두 번역이 있다', () => {
    for (const lang of ['ko', 'en', 'ja', 'zh'] as const) {
      for (const key of ['siteNavColRegsCore', 'siteNavColRegsRules']) {
        expect(translations[lang]?.[key]).toBeTruthy()
      }
    }
  })

  it('푸터 제목도 헤더와 같은 소개·정관·규정 라벨을 쓴다', () => {
    expect(footerMenu.map(s => translations.ko?.[s.titleKey])).toEqual(
      expect.arrayContaining(['소개', '정관·규정'])
    )
  })

  it('소식 메뉴에서 회원 게시판으로 갈 수 있다', () => {
    const news = headerMenu.find(group => group.key === 'news')?.items ?? []
    expect(news.map(link => link.href)).toContain('/community/board')
    expect(footerMenu.flatMap(s => s.items).map(link => link.href)).toContain('/community/board')
  })

  it('소식 메뉴는 머리와 첫 하위 메뉴가 회원 게시판이다', () => {
    const news = headerMenu.find(group => group.key === 'news')
    expect(news?.href).toBe('/community/board')
    expect(news?.items?.[0]?.href).toBe('/community/board')
  })

  it('문의는 따로 된 메뉴이고, 자주 묻는 질문이 그 아래에 있다', () => {
    const contact = headerMenu.find(group => group.key === 'contact')
    expect(contact?.href).toBe('/contact')
    expect(contact?.items?.map(link => link.href)).toStrictEqual(['/contact', '/faq'])
    const membership = headerMenu.find(group => group.key === 'membership')?.items ?? []
    expect(membership.map(link => link.href)).not.toContain('/faq')
    expect(membership.map(link => link.href)).not.toContain('/contact')
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

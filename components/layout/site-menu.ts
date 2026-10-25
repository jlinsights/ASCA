import { REGULATIONS, REGULATIONS_BASE_PATH, regulationHref } from '@/lib/regulations/catalog'

// 헤더·푸터 메뉴의 단일 출처. 라벨은 lib/i18n/translations 의 번역 키, 링크 주소는 언어와 무관하다.
// 작가 링크의 쿼리(membershipType·title·nationality)는 /artists 필터와 /api/artists 파라미터 이름 그대로다.

export interface MenuLink {
  labelKey: string
  href: string
  external?: boolean
}

export interface MenuGroup {
  key: string
  labelKey: string
  href: string
  items?: MenuLink[]
}

const artistsBy = (params: Record<string, string>) =>
  `/artists?${new URLSearchParams(params).toString()}`

const about: MenuLink[] = [
  { labelKey: 'siteNavIntro', href: '/introductions' },
  { labelKey: 'siteNavGreetings', href: '/greetings' },
  { labelKey: 'siteNavMission', href: '/mission' },
  { labelKey: 'siteAboutHistory', href: '/history' },
  { labelKey: 'siteNavBoard', href: '/board-members' },
  { labelKey: 'siteNavBusinessPlan', href: '/business-plan' },
  { labelKey: 'siteNavPartners', href: '/partners' },
  { labelKey: 'siteAboutBrand', href: '/brand' },
]

// 규정 등급만 싣는다 — 공모작가는 등급이 아니다(2026-10-24). 일반작가는 DB 에 '회원작가' 로 들어 있다.
// 청년작가는 등록자가 없어 싣지 않는다 (2026-10-22). 등록이 시작되면 membershipType=청년작가 로 되살린다
const artistGrades: MenuLink[] = [
  { labelKey: 'siteArtistInvited', href: artistsBy({ membershipType: '초대작가' }) },
  { labelKey: 'siteArtistRecommended', href: artistsBy({ membershipType: '추천작가' }) },
  { labelKey: 'siteArtistMember', href: artistsBy({ membershipType: '회원작가' }) },
]

const exhibitions: MenuLink[] = [
  { labelKey: 'siteExCurrent', href: '/exhibitions/current' },
  { labelKey: 'siteExUpcoming', href: '/exhibitions/upcoming' },
  { labelKey: 'siteExPast', href: '/exhibitions/past' },
  { labelKey: 'siteExOnline', href: '/exhibitions/online' },
]

const regulations: MenuLink[] = REGULATIONS.map(entry => ({
  labelKey: entry.nameKey,
  href: regulationHref(entry.slug),
}))

const news: MenuLink[] = [
  { labelKey: 'siteNewsNotices', href: '/notice' },
  { labelKey: 'siteNavCommunityBoard', href: '/community/board' },
  { labelKey: 'siteNewsEvents', href: '/events' },
  { labelKey: 'siteNavGallery', href: '/gallery' },
  { labelKey: 'siteNavBlog', href: '/blog' },
]

const membership: MenuLink[] = [
  { labelKey: 'siteNavMembershipGuide', href: '/membership' },
  { labelKey: 'siteNavAcademy', href: '/academy' },
  { labelKey: 'siteNavFundraising', href: '/fundraising' },
  { labelKey: 'siteNavContact', href: '/contact' },
]

// 동양서예대전 신청서 — 지원하는 사람과 시점 순서(출품자 → 수상 작가 → 위원)
const contestApplications: MenuLink[] = [
  { labelKey: 'siteNavEntryForm', href: '/application' },
  { labelKey: 'siteNavApplication', href: '/application-for-recommended-invited-calligrapher' },
  { labelKey: 'siteNavCommissioning', href: '/commissioning-application' },
]

export const headerMenu: MenuGroup[] = [
  // 순서: 협회 소개 · 공모전 · 전시회 · 작가 · 작품 · 소식 · 정관 및 규정 · 회원·후원 (2026-10-25)
  { key: 'about', labelKey: 'siteNavAbout', href: '/introductions', items: about },
  {
    key: 'contests',
    labelKey: 'siteNavContests',
    href: '/contests',
    items: [
      { labelKey: 'siteNavContestsGuide', href: '/contests' },
      ...contestApplications,
      { labelKey: 'siteNavForms', href: '/forms' },
      { labelKey: 'siteContestMine', href: '/profile/applications' },
    ],
  },
  { key: 'exhibitions', labelKey: 'siteNavExhibitions', href: '/exhibitions', items: exhibitions },
  {
    key: 'artists',
    labelKey: 'siteNavArtists',
    href: '/artists',
    items: [
      { labelKey: 'siteNavArtistsIntro', href: '/artists' },
      { labelKey: 'siteArtistAdvisor', href: artistsBy({ title: '고문' }) },
      { labelKey: 'siteArtistAdvisory', href: artistsBy({ title: '자문위원' }) },
      ...artistGrades,
    ],
  },
  // 작품 분류 링크(?category=)는 작품 페이지가 쿼리를 읽지 않아 뺐다 — 분류는 페이지 안 필터로 고른다
  { key: 'artworks', labelKey: 'siteNavArtworks', href: '/artworks' },
  // 공지사항·행사는 옛 CMS 데이터가 없어 비어 있다 — 메뉴 머리는 사진이 있는 갤러리로 보낸다
  { key: 'news', labelKey: 'siteFtNews', href: '/gallery', items: news },
  {
    key: 'regulations',
    labelKey: 'regsMenu',
    href: REGULATIONS_BASE_PATH,
    items: [{ labelKey: 'regsAll', href: REGULATIONS_BASE_PATH }, ...regulations],
  },
  { key: 'membership', labelKey: 'siteNavMembership', href: '/membership', items: membership },
]

export const footerMenu: { titleKey: string; items: MenuLink[] }[] = [
  { titleKey: 'siteNavAbout', items: about },
  {
    titleKey: 'siteFtSecArtists',
    items: [
      {
        labelKey: 'siteArtistInvitedKorea',
        href: artistsBy({ membershipType: '초대작가', nationality: '韓國' }),
      },
      {
        labelKey: 'siteArtistInvitedChina',
        href: artistsBy({ membershipType: '초대작가', nationality: '中國' }),
      },
      {
        labelKey: 'siteArtistInvitedJapan',
        href: artistsBy({ membershipType: '초대작가', nationality: '日本' }),
      },
      ...artistGrades.slice(1),
      { labelKey: 'siteExPast', href: '/exhibitions/past' },
      { labelKey: 'siteNavArtworks', href: '/artworks' },
    ],
  },
  { titleKey: 'regsMenu', items: regulations },
  {
    titleKey: 'siteFtSecJoin',
    items: [
      ...membership.slice(0, 3),
      ...contestApplications,
      { labelKey: 'siteNavForms', href: '/forms' },
      ...news,
      {
        labelKey: 'siteNavNewsletters',
        href: 'https://orientalcalligraphy.stibee.com/',
        external: true,
      },
      { labelKey: 'siteNavContact', href: '/contact' },
    ],
  },
]

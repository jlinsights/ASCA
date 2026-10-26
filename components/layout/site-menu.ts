import { REGULATIONS, REGULATIONS_BASE_PATH, regulationHref } from '@/lib/regulations/catalog'

// 헤더·푸터 메뉴의 단일 출처. 라벨은 lib/i18n/translations 의 번역 키, 링크 주소는 언어와 무관하다.
// 작가 링크의 쿼리(membershipType·title·nationality)는 /artists 필터와 /api/artists 파라미터 이름 그대로다.

export interface MenuLink {
  labelKey: string
  href: string
  external?: boolean
}

/** 드롭다운을 여러 칸으로 나눌 때 한 칸 — 제목과 그 아래 링크 */
export interface MenuColumn {
  titleKey: string
  items: MenuLink[]
}

export interface MenuGroup {
  key: string
  labelKey: string
  href: string
  /** 평평한 하위 메뉴 목록. columns 가 있으면 칸들을 순서대로 이은 것 */
  items?: MenuLink[]
  /** 데스크톱 드롭다운을 칸으로 나눠 보일 때 */
  columns?: MenuColumn[]
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
  { labelKey: 'siteNavFaq', href: '/faq' },
  { labelKey: 'siteNavContact', href: '/contact' },
]

// 동양서예대전 신청서 — 지원하는 사람과 시점 순서(출품자 → 수상 작가 → 위원)
const contestApplications: MenuLink[] = [
  { labelKey: 'siteNavEntryForm', href: '/application' },
  { labelKey: 'siteNavApplication', href: '/application-for-recommended-invited-calligrapher' },
  { labelKey: 'siteNavCommissioning', href: '/commissioning-application' },
]

const contests: MenuLink[] = [
  { labelKey: 'siteNavContestsGuide', href: '/contests' },
  ...contestApplications,
  { labelKey: 'siteNavForms', href: '/forms' },
  { labelKey: 'siteContestMine', href: '/profile/applications' },
]

// 왼쪽 전시, 오른쪽 공모 — 데스크톱 드롭다운은 두 칸, 모바일은 칸 제목 아래로 이어 붙인다
const exhibitionsAndContests: MenuColumn[] = [
  { titleKey: 'siteNavColExhibitions', items: exhibitions },
  { titleKey: 'siteNavColContests', items: contests },
]

export const headerMenu: MenuGroup[] = [
  // 순서: 소개 · 전시·공모 · 작가·작품 · 소식 · 정관·규정 · 회원·후원 (2026-10-26)
  // 소개·정관·규정 라벨은 헤더·푸터 제목·규정 페이지 경로 표시가 같은 키를 쓴다 (2026-10-26)
  { key: 'about', labelKey: 'siteNavAboutShort', href: '/introductions', items: about },
  {
    key: 'exhibitions',
    labelKey: 'siteNavExhibitionsContests',
    href: '/exhibitions',
    columns: exhibitionsAndContests,
    items: exhibitionsAndContests.flatMap(column => column.items),
  },
  {
    key: 'artists',
    labelKey: 'siteNavArtists',
    href: '/artists',
    items: [
      { labelKey: 'siteNavArtistsIntro', href: '/artists' },
      { labelKey: 'siteArtistAdvisor', href: artistsBy({ title: '고문' }) },
      { labelKey: 'siteArtistAdvisory', href: artistsBy({ title: '자문위원' }) },
      ...artistGrades,
      // 작품 분류 링크(?category=)는 작품 페이지가 쿼리를 읽지 않아 뺐다 — 분류는 페이지 안 필터로 고른다
      { labelKey: 'siteNavArtworks', href: '/artworks' },
    ],
  },
  // 공지사항·행사는 옛 CMS 데이터가 없어 비어 있다 — 메뉴 머리는 사진이 있는 갤러리로 보낸다
  { key: 'news', labelKey: 'siteFtNews', href: '/gallery', items: news },
  {
    key: 'regulations',
    labelKey: 'siteNavRegulations',
    href: REGULATIONS_BASE_PATH,
    items: [{ labelKey: 'regsAll', href: REGULATIONS_BASE_PATH }, ...regulations],
  },
  { key: 'membership', labelKey: 'siteNavMembership', href: '/membership', items: membership },
]

export const footerMenu: { titleKey: string; items: MenuLink[] }[] = [
  { titleKey: 'siteNavAboutShort', items: about },
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
  { titleKey: 'siteNavRegulations', items: regulations },
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
      { labelKey: 'siteNavFaq', href: '/faq' },
      { labelKey: 'siteNavContact', href: '/contact' },
    ],
  },
]

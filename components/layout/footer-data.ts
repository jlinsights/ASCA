export type FooterLink = {
  /** lib/i18n/translations/site-chrome.ts 의 번역 키 */
  labelKey: string
  href: string
  external?: boolean
  logo?: { src: string; width: number; height: number }
}

type FooterLinkSection =
  | 'exhibitions'
  | 'artworks'
  | 'artists'
  | 'about'
  | 'news'
  | 'legal'
  | 'sponsors'

export const footerLinks: Record<FooterLinkSection, FooterLink[]> = {
  exhibitions: [
    { labelKey: 'siteExCurrent', href: '/exhibitions/current' },
    { labelKey: 'siteExUpcoming', href: '/exhibitions/upcoming' },
    { labelKey: 'siteExPast', href: '/exhibitions/past' },
    { labelKey: 'siteExOnline', href: '/exhibitions/online' },
  ],
  artworks: [
    { labelKey: 'siteCatHangeul', href: '/artworks?category=한글서예' },
    { labelKey: 'siteCatHanja', href: '/artworks?category=한자서예' },
    { labelKey: 'siteCatLiterati', href: '/artworks?category=문인화' },
    { labelKey: 'siteCatInk', href: '/artworks?category=수묵화' },
    { labelKey: 'siteCatFolk', href: '/artworks?category=민화' },
    { labelKey: 'siteCatModern', href: '/artworks?category=현대서예' },
    { labelKey: 'siteCatCalligraphy', href: '/artworks?category=캘리그라피' },
    { labelKey: 'siteCatSeal', href: '/artworks?category=전각' },
    { labelKey: 'siteCatWood', href: '/artworks?category=서각' },
  ],
  artists: [
    { labelKey: 'siteArtistContest', href: '/artists?type=공모작가' },
    { labelKey: 'siteArtistYoung', href: '/artists?type=청년작가' },
    { labelKey: 'siteArtistRecommended', href: '/artists?type=추천작가' },
    { labelKey: 'siteArtistInvited', href: '/artists?type=초대작가' },
  ],
  about: [
    { labelKey: 'siteAboutOverview', href: '/introductions' },
    // 규정 원문은 Google Docs 에서 저장소 regulations/ 로 옮겨 /regulations 에 싣는다 (2026-10-19)
    { labelKey: 'siteAboutArticles', href: '/regulations/articles' },
    { labelKey: 'siteAboutBylaws', href: '/regulations/membership-dues' },
    { labelKey: 'siteAboutOperations', href: '/regulations/operation-judging' },
    { labelKey: 'siteAboutArtistSelection', href: '/regulations/artist-selection' },
    { labelKey: 'siteAboutAppraisal', href: '/regulations/appraisal' },
    { labelKey: 'siteAboutExhibitionRules', href: '/regulations/exhibition' },
    { labelKey: 'siteAboutHistory', href: '/history' },
    { labelKey: 'siteAboutBrand', href: '/brand' },
  ],
  news: [
    { labelKey: 'siteNewsNotices', href: '/notice' },
    { labelKey: 'siteNewsEvents', href: '/events' },
    { labelKey: 'siteNavGallery', href: '/gallery' },
  ],
  legal: [
    { labelKey: 'siteLegalTerms', href: '/terms-of-service' },
    { labelKey: 'siteLegalPrivacy', href: '/privacy-policy' },
    { labelKey: 'siteLegalCopyright', href: '/copyright-policy' },
    { labelKey: 'siteLegalEmail', href: '/email-refuse' },
  ],
  sponsors: [
    {
      labelKey: 'siteSponsorHanja',
      href: 'https://www.hanja.ne.kr/index_original.asp',
      external: true,
      logo: { src: '/sponsor/footer-kta.avif', width: 138, height: 101 },
    },
    {
      labelKey: 'siteSponsorSac',
      href: 'https://www.sac.or.kr/site/main/home',
      external: true,
      logo: { src: '/sponsor/footer-seoul-arts-center.avif', width: 1080, height: 339 },
    },
    {
      labelKey: 'siteSponsorSeoul',
      href: 'https://www.seoul.go.kr/main/index.jsp',
      external: true,
      logo: { src: '/sponsor/footer-seoul.png', width: 174, height: 48 },
    },
    {
      labelKey: 'siteSponsorMcst',
      href: 'https://www.mcst.go.kr/kor/main.jsp',
      external: true,
      logo: { src: '/sponsor/footer-mcst.png', width: 1175, height: 737 },
    },
  ],
}

export const footerSections: { titleKey: string; items: FooterLink[] }[] = [
  {
    titleKey: 'members',
    items: [
      { labelKey: 'advisor', href: '/board-members' },
      { labelKey: 'korea', href: '/artists/country/korea' },
      { labelKey: 'advisory', href: '/board-members' },
      { labelKey: 'china', href: '/artists/country/china' },
      { labelKey: 'directors', href: '/board-members' },
      { labelKey: 'japan', href: '/artists/country/japan' },
      { labelKey: 'siteArtistRecommended', href: '/artists' },
      { labelKey: 'general', href: '/artists' },
      { labelKey: 'siteArtistYoung', href: '/artists' },
    ],
  },
  {
    titleKey: 'information',
    items: [
      { labelKey: 'siteFtAbout', href: '/introductions' },
      { labelKey: 'greetings', href: '/greetings' },
      { labelKey: 'siteAboutBrand', href: '/brand' },
      { labelKey: 'mission', href: '/mission' },
      { labelKey: 'business', href: '/business-plan' },
      { labelKey: 'newsletters', href: 'https://orientalcalligraphy.stibee.com/', external: true },
      { labelKey: 'siteAboutHistory', href: '/history' },
      { labelKey: 'partners', href: '/partners' },
      { labelKey: 'contact', href: '/contact' },
    ],
  },
  {
    titleKey: 'rules',
    items: [
      footerLinks.about[1]!,
      footerLinks.about[3]!,
      footerLinks.about[4]!,
      { labelKey: 'membership', href: '/membership' },
      footerLinks.about[2]!,
      footerLinks.about[5]!,
      footerLinks.about[6]!,
    ],
  },
  {
    titleKey: 'support',
    items: [
      { labelKey: 'contact', href: '/contact' },
      { labelKey: 'siteNewsNotices', href: '/notice' },
      { labelKey: 'forms', href: '/forms' },
      { labelKey: 'fundraising', href: '/fundraising' },
      { labelKey: 'siteNavAcademy', href: '/academy' },
      { labelKey: 'application', href: '/application-for-recommended-invited-calligrapher' },
    ],
  },
]

export type FooterLink = {
  /** lib/i18n/translations/site-chrome.ts 의 번역 키 */
  labelKey: string
  href: string
  external?: boolean
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
    {
      labelKey: 'siteAboutArticles',
      href: 'https://docs.google.com/document/d/1on5DqNNLBXvr_wvvapz5zhWFPR1dPlHKaZ6y3bgIWuE/edit?usp=sharing',
      external: true,
    },
    {
      labelKey: 'siteAboutBylaws',
      href: 'https://docs.google.com/document/d/1LqwokChxq-7qgus7B3ntAKl2skP-Ch31co7kyDs4RDE/edit?usp=sharing',
      external: true,
    },
    {
      labelKey: 'siteAboutOperations',
      href: 'https://docs.google.com/document/d/1x65nBE0Auk-_8UMF0sWpBpbyyI3aKmYKwGGo_Htvenw/edit?usp=sharing',
      external: true,
    },
    {
      labelKey: 'siteAboutArtistSelection',
      href: 'https://docs.google.com/document/d/1dOtCRVEsBZ0dW87lynU-ZulnvaxThhD6vU-28i9tBPY/edit?usp=sharing',
      external: true,
    },
    {
      labelKey: 'siteAboutAppraisal',
      href: 'https://docs.google.com/document/d/1zyRHlG-PqJ2QqAHVqzUNHX5I0ztp4uzIP_YCkAuUrOk/edit?usp=sharing',
      external: true,
    },
    {
      labelKey: 'siteAboutExhibitionRules',
      href: 'https://docs.google.com/document/d/1PCt1HOOuilplQg47c5GrK6nHbWozkzrJWJhLUVnOtOQ/edit?usp=sharing',
      external: true,
    },
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
    { labelKey: 'siteSponsorSamsung', href: 'https://familyoffices.vip/', external: true },
    { labelKey: 'siteSponsorSac', href: 'https://www.sac.or.kr/site/main/home', external: true },
    {
      labelKey: 'siteSponsorHanja',
      href: 'https://www.hanja.ne.kr/index_original.asp',
      external: true,
    },
    {
      labelKey: 'siteSponsorSeoul',
      href: 'https://www.seoul.go.kr/main/index.jsp',
      external: true,
    },
    { labelKey: 'siteSponsorMcst', href: 'https://www.mcst.go.kr/kor/main.jsp', external: true },
  ],
}

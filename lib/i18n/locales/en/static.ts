// 화면 번역을 합친 정적 표 (en). 펼치는 순서가 곧 우선순위다 — 뒤에 오는 키가 앞을 덮는다.
import navigation from './navigation'
import artworks from './artworks'
import home from './home'
import siteChrome from './site-chrome'
import about from './about'
import exhibitions from './exhibitions'
import brand from './brand'
import archive from './archive'
import auth from './auth'
import nativeAuth from './native-auth'
import artistClaim from './artist-claim'
import communityBoard from './community-board'
import faq from './faq'
import inquiry from './inquiry'
import contestEntries from './contest-entries'
import profileEditor from './profile-editor'
import flipbooks from './flipbooks'
import regulations from './regulations'
import kakaoShare from './kakao-share'
import notFound from './not-found'
import discovery from './discovery'
import homepagePrograms from './homepage-programs'
import events from './events'
import artistDetail from './artist-detail'
import greetings from './greetings'
import blog from './blog'
import membership from './membership'
import fundraising from './fundraising'
import partners from './partners'
import academy from './academy'
import awards from './awards'
import application from './application'
import commissioning from './commissioning'

const staticTable: Record<string, string> = {
  ...navigation,
  ...artworks,
  ...home,
  ...siteChrome,
  ...about,
  ...exhibitions,
  ...brand,
  ...archive,
  ...auth,
  ...nativeAuth,
  ...artistClaim,
  ...communityBoard,
  ...faq,
  ...inquiry,
  ...contestEntries,
  ...profileEditor,
  ...flipbooks,
  ...regulations,
  ...kakaoShare,
  ...notFound,
  ...discovery,
  ...homepagePrograms,
  ...events,
  ...artistDetail,
  ...greetings,
  ...blog,
  ...membership,
  ...fundraising,
  ...partners,
  ...academy,
  ...awards,
  ...application,
  ...commissioning,

  // 공통 UI 요소
  loading: 'Loading...',
  error: 'An error occurred',
  retry: 'Retry',
  close: 'Close',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  remove: 'Remove',
  submit: 'Submit',
  reset: 'Reset',

  // 홈 페이지
  artGalleryExhibition: 'The Asian Society of Calligraphic Arts',
  journeyThroughArts: 'TRADITION AND MODERNITY, INCLUSION AND COMMUNICATION',
  // brand-rollout L1·L2 SSOT (brand-guidelines §1·§8)
  homeHeroL1: 'Rooted in Tradition, Renewed Through Calligraphy.',
  homeHeroL2:
    'The Asian Society of Calligraphic Arts seeks to renew tradition through contemporary expression, cultivating a culture in which calligraphy and character mature together.',
  homePhilosophyTitle: 'Embodying Spirit in Letters, Bridging Eras Through Calligraphy',
  homePhilosophyBody:
    'Calligraphy is more than the art of beautiful writing. Each stroke carries the time, breath, and character of the artist — held in the weight of a line, the depth of ink, and the breath of empty space. Guided by the spirit of Beopgo Changsin (creating anew through a deep understanding of tradition) and Inseo Guno (calligraphy and character mature together), the Society cultivates a culture in which calligraphy remains a living art for today and tomorrow.',
  // brand-rollout D3 What We Do (brand-guidelines §2 Section 3 SSOT)
  homeWhatWeDoTitle: 'What We Do',
  homeWhatWeDoExhibitionLabel: 'Exhibitions',
  homeWhatWeDoExhibitionBody:
    'Curating exhibitions across classical Chinese-character calligraphy, Korean Hangeul calligraphy, literati painting, and contemporary expression.',
  homeWhatWeDoContestLabel: 'Competitions',
  homeWhatWeDoContestBody:
    'The Korea Oriental Calligraphy Grand Exhibition and other open calls — discovering artists and presenting new work.',
  homeWhatWeDoEducationLabel: 'Education',
  homeWhatWeDoEducationBody:
    'Structured programs from foundational practice to creative work, appreciation, seal carving, and literati painting.',
  homeWhatWeDoExchangeLabel: 'Exchange',
  homeWhatWeDoExchangeBody:
    'Cultural collaboration with calligraphic and lettering communities at home and abroad.',
  homeWhatWeDoResearchLabel: 'Research',
  homeWhatWeDoResearchBody:
    'Contemporary interpretation of East Asian writing culture and calligraphic aesthetics.',
  // brand-rollout D4 Brand Message (brand-guidelines §2 Section 4 SSOT)
  homeBrandMessageTitle: 'The Rhythm of Hangeul, the Depth of Hanja, the Spirit of Calligraphy',
  homeBrandMessageBody:
    'Hangeul reveals the senses and emotions of daily life through the order of sound; Hanja distills meaning and form to hold long-standing thought and philosophy. Calligraphy brings these two writing worlds together at the tip of the brush — through line, ink, empty space, and breath — and lifts the letter to the realm of art.',
  // brand-rollout community-page D2 Hero (community-marketing-playbook §1.1 SSOT)
  communityHeroL1: 'One Stroke, Together',
  communityHeroBody:
    'The Asian Society of Calligraphic Arts opens a circle of fellow travelers — the 동도 (dongdo) — who learn from tradition, open new ground, and mature alongside their calligraphy.',
  // D3 DaoArchitecture (community-marketing-playbook §1.1·§1.3 SSOT)
  communityDaoTitle: 'The Three Ways',
  communityDaoBeopgoTitle: 'Beopgo · Learning the Old',
  communityDaoBeopgoBody:
    'Through imseo (copying) and the study of classical works, we deepen our grounding in tradition.',
  communityDaoChangsinTitle: 'Changsin · Opening the New',
  communityDaoChangsinBody:
    'We open the borders between classical, Hangeul, literati, and contemporary calligraphy together.',
  communityDaoInseoGunoTitle: 'Inseo Guno · Maturing Together',
  communityDaoInseoGunoBody:
    'We reflect on our own work and build, breath by breath, through the 100-day imseo practice.',
  // D4 ImseoCard (community-marketing-playbook §7 SSOT, OQ#3 채택)
  communityImseoTitle: '100-Day Imseo · The Time of One Stroke',
  communityImseoBody:
    'Each day, copy a single stroke or character through imseo. Build, breath by breath, the time in which calligraphy and character mature together. We hold one breath longer than the rush of result.',
  communityImseoMeta: 'Cohort 1 · 30 dongdo · 100 days',
  communityImseoCtaLabel: 'View Cohort 1 in the Café',
  communityImseoMailLabel: 'Or contact the secretariat · info@orientalcalligraphy.org',
  // OQ#2 deferred — 사무국 결정 대기, 결정 시 1줄 갱신
  communityCafeNaverUrl: '#',
  communityKakaoUrl: '#',
  // D5 CafeEntry (community-marketing-playbook §3 채널 아키텍처 SSOT)
  communityCafeTitle: 'Where the 동도 Gather',
  communityCafeBody: 'A place for sharing work, peer critique, and community announcements.',
  communityCafeNaverLabel: 'Enter the Naver Café',
  communityCafeKakaoLabel: 'Open KakaoTalk Chat',
  // D6 MembershipBranch (OQ#4 채택, BrandMessage 패턴 재사용)
  communityMembershipTitle: 'Becoming a Full Member',
  communityMembershipBody:
    "Full members participate in the Society's governance and regular exhibitions. The application process and bylaws are guided separately.",
  communityMembershipCtaLabel: 'About Full Membership',
  aboutTitle: 'About',
  aboutText:
    'The Asian Society of Calligraphic Arts (ASCA) leads the development and promotion of Oriental calligraphy culture through the harmonious implementation of tradition preservation and creative innovation.',
  gallerySpace: 'Gallery Space',
  whereArtsBecome: 'WHERE ARTS BECOME REALITY',
  ourSpace: 'Our Space',
  ourSpaceText:
    'Located in Seongbuk-gu, Seoul, the Asian Society of Calligraphic Arts provides the optimal environment for experiencing and learning calligraphy culture.',

  // 작품 페이지
  artCollection: 'Art Collection',
  discoverMasterpieces: 'Discover Masterpieces',
  artworksDescription:
    'Experience the beauty of Oriental art born from the harmonious implementation of tradition preservation and creative innovation',
  searchPlaceholder: 'Search by artwork title, artist name, tags...',

  // 공통 용어
  all: 'All',
  category: 'Category',
  style: 'Style',
  sort: 'Sort',
  featured: 'Featured',
  traditional: 'Traditional',
  contemporary: 'Contemporary',
  modern: 'Modern',
  available: 'Available',
  sold: 'Sold',
  views: 'Views',
  likes: 'Likes',
  signOut: 'Sign Out',
}

export default staticTable

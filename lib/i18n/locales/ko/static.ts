// 화면 번역을 합친 정적 표 (ko). 펼치는 순서가 곧 우선순위다 — 뒤에 오는 키가 앞을 덮는다.
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

  // 공통 UI 요소
  loading: '로딩 중...',
  error: '오류가 발생했습니다',
  retry: '다시 시도',
  close: '닫기',
  save: '저장',
  cancel: '취소',
  confirm: '확인',
  delete: '삭제',
  edit: '편집',
  add: '추가',
  remove: '제거',
  submit: '제출',
  reset: '초기화',

  // 홈 페이지
  artGalleryExhibition: '동양서예협회',
  journeyThroughArts: '正法의 계승, 創新의 조화',
  // brand-rollout L1·L2 SSOT (brand-guidelines §1·§8)
  homeHeroL1: '옛 법을 익혀 새로움을 열고, 글씨와 사람이 함께 깊어집니다.',
  homeHeroL2:
    '동양서예협회는 옛 법을 깊이 익혀 오늘의 감각으로 새로움을 열고, 글씨와 사람이 함께 깊어지는 서예 문화를 지향합니다.',
  homePhilosophyTitle: '문자에 정신을 담고, 서예로 시대를 잇습니다',
  homePhilosophyBody:
    '서예는 단순히 글자를 아름답게 쓰는 일이 아닙니다. 한 획의 강약, 먹의 농담, 여백의 호흡 속에는 작가의 시간과 마음, 인격과 수양이 함께 담깁니다. 동양서예협회는 法古創新의 정신으로 고전을 깊이 익히고, 人書俱老의 자세로 글씨와 사람이 함께 성숙하는 서예 문화를 만들어갑니다.',
  // brand-rollout D3 What We Do (brand-guidelines §2 Section 3 SSOT)
  homeWhatWeDoTitle: '동양서예협회가 하는 일',
  homeWhatWeDoExhibitionLabel: '전시',
  homeWhatWeDoExhibitionBody: '한문서예, 한글서예, 문인화, 현대서예를 아우르는 전시 개최',
  homeWhatWeDoContestLabel: '공모전',
  homeWhatWeDoContestBody: '대한민국 동양서예대전 등 작가 발굴과 작품 발표의 장 마련',
  homeWhatWeDoEducationLabel: '교육',
  homeWhatWeDoEducationBody: '기초 서예부터 창작, 감상, 전각, 문인화까지 체계적 교육',
  homeWhatWeDoExchangeLabel: '교류',
  homeWhatWeDoExchangeBody: '국내외 문자예술 단체와의 문화 교류 확대',
  homeWhatWeDoResearchLabel: '연구',
  homeWhatWeDoResearchBody: '동양 문자문화와 서예미학의 현대적 해석',
  // brand-rollout D4 Brand Message (brand-guidelines §2 Section 4 SSOT)
  homeBrandMessageTitle: '한글의 리듬, 한문의 깊이, 서예의 정신',
  homeBrandMessageBody:
    '한글은 소리의 질서를 통해 삶의 감각과 정서를 섬세하게 드러내고, 한문은 뜻과 형상을 응축하여 오랜 사유와 철학을 품습니다. 서예는 이 두 문자 세계를 붓끝에서 만나게 하며, 선과 먹, 여백과 기운을 통해 문자를 예술의 경지로 이끕니다.',
  // brand-rollout community-page D2 Hero (community-marketing-playbook §1.1 SSOT)
  communityHeroL1: '한 획을 함께 긋는 사람들',
  communityHeroBody:
    '동양서예협회는 옛 법을 익혀 새로움을 열고, 글씨와 사람이 함께 깊어지는 동도(同道)들의 자리를 엽니다.',
  // D3 DaoArchitecture (community-marketing-playbook §1.1·§1.3 SSOT)
  communityDaoTitle: '三道 — 함께 걷는 길',
  communityDaoBeopgoTitle: '法古 · 옛 법을 익히다',
  communityDaoBeopgoBody: '임서와 명적을 통해 전통의 깊이를 익힙니다.',
  communityDaoChangsinTitle: '創新 · 새로움을 열다',
  communityDaoChangsinBody: '한문서예와 한글서예, 문인화와 현대서예의 경계를 함께 엽니다.',
  communityDaoInseoGunoTitle: '人書俱老 · 함께 깊어지다',
  communityDaoInseoGunoBody: '자기 글씨를 회고하고 100일 임서로 한 호흡씩 쌓아갑니다.',
  // D4 ImseoCard (community-marketing-playbook §7 SSOT, OQ#3 채택)
  communityImseoTitle: '100일 임서 — 한 획의 시간',
  communityImseoBody:
    '매일 한 획 또는 한 자(字)를 임서로 옮기며, 글씨와 사람이 함께 깊어지는 시간을 만듭니다. 빠른 성과보다 호흡 한 번을 더 둡니다.',
  communityImseoMeta: '1기 정원 30명 · 기간 100일',
  communityImseoCtaLabel: '카페에서 1기 모집 안내 보기',
  communityImseoMailLabel: '또는 사무국 문의 · info@orientalcalligraphy.org',
  // OQ#2 deferred — 사무국 결정 대기, 결정 시 1줄 갱신
  communityCafeNaverUrl: '#',
  communityKakaoUrl: '#',
  // D5 CafeEntry (community-marketing-playbook §3 채널 아키텍처 SSOT)
  communityCafeTitle: '동도들의 자리 — 카페와 오픈채팅',
  communityCafeBody: '작품 공유와 합평, 운영 안내가 오가는 자리입니다.',
  communityCafeNaverLabel: '네이버 카페 입장',
  communityCafeKakaoLabel: '카카오톡 오픈채팅',
  // D6 MembershipBranch (OQ#4 채택, BrandMessage 패턴 재사용)
  communityMembershipTitle: '정회원이 되고 싶으시면',
  communityMembershipBody:
    '정회원은 협회 의사결정과 정기 전시 출품 등에 함께하시는 분들입니다. 절차와 정관은 별도 안내를 따릅니다.',
  communityMembershipCtaLabel: '정회원 안내 보기',
  aboutTitle: '소개',
  aboutText:
    '사단법인 동양서예협회는 正法의 계승 발전과 創新의 조화로운 구현을 통해 동양 서예 문화의 발전과 보급에 앞장서고 있습니다.',
  gallerySpace: '갤러리 공간',
  whereArtsBecome: '예술이 현실이 되는 곳',
  ourSpace: '우리의 공간',
  ourSpaceText:
    '서울 성북구에 위치한 동양서예협회는 서예 문화를 체험하고 학습할 수 있는 최적의 환경을 제공합니다.',

  // 작품 페이지
  artCollection: '작품 컬렉션',
  discoverMasterpieces: '명작을 발견하세요',
  artworksDescription: '正法의 계승과 創新의 조화로 탄생한 동양 예술의 아름다움을 경험하세요',
  searchPlaceholder: '작품명, 작가명, 태그로 검색...',

  // 공통 용어
  all: '전체',
  category: '카테고리',
  style: '스타일',
  sort: '정렬',
  featured: '추천순',
  traditional: '전통',
  contemporary: '현대',
  modern: '모던',
  available: '구매가능',
  sold: '판매완료',
  views: '조회',
  likes: '좋아요',
  signOut: '로그아웃',
}

export default staticTable

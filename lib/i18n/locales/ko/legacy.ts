// 예전 컨텍스트에 내장돼 있던 번역 (ko). 같은 키가 정적 표에 있으면 정적 표가 이긴다.
const legacy: Record<string, string> = {
  // Navigation
  exhibition: '전시',
  artworks: '작품',
  artists: '작가',
  events: '행사',
  catalog: '도록',
  about: '소개',
  organization: '조직',
  support: '지원',
  brand: '브랜드',
  language: '언어',
  news: '소식',
  search: '검색',
  signIn: '로그인',
  signUp: '회원가입',
  menu: '메뉴',

  // Exhibition submenu
  currentExhibitions: '현재 전시',
  upcomingExhibitions: '예정 전시',
  pastExhibitions: '지난 전시',
  onlineExhibitions: '온라인 전시',

  // Artworks submenu
  hangeulCalligraphy: '한글서예',
  hanjaCalligraphy: '한자서예',
  literatiPainting: '문인화',
  inkPainting: '수묵화',
  orientalPainting: '동양화',
  folkPainting: '민화',
  modernCalligraphy: '현대서예',
  calligraphyArt: '캘리그라피',
  sealEngraving: '전각',
  woodEngraving: '서각',
  photography: '사진',
  video: '영상',

  // Artists submenu
  openCallArtists: '공모작가',
  youngArtists: '청년작가',
  recommendedArtists: '추천작가',
  invitedArtists: '초대작가',

  // Common
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

  // Home page
  artGalleryExhibition: '동양서예협회',
  journeyThroughArts: '正法의 계승, 創新의 조화',
  aboutTitle: '소개',
  aboutText:
    '사단법인 동양서예협회는 正法의 계승 발전과 創新의 조화로운 구현을 통해 동양 서예 문화의 발전과 보급에 앞장서고 있습니다.',
  gallerySpace: '갤러리 공간',
  whereArtsBecome: '예술이 현실이 되는 곳',
  ourSpace: '우리의 공간',
  ourSpaceText:
    '서울 성북구에 위치한 동양서예협회는 서예 문화를 체험하고 학습할 수 있는 최적의 환경을 제공합니다.',

  // Artworks page
  artCollection: '작품 컬렉션',
  discoverMasterpieces: '명작을 발견하세요',
  artworksDescription: '正法의 계승과 創新의 조화로 탄생한 동양 예술의 아름다움을 경험하세요',
  searchPlaceholder: '작품명, 작가명, 태그로 검색...',

  // Common UI
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

  // 공지사항 (app/notice)
  notice: '공지사항',
  importantNotice: '중요 공지',
  generalNotice: '일반 공지',
  noticeInquiry: '공지사항 문의',
  noticeInquiryText: '공지사항에 대해 궁금한 점은 협회 사무국으로 연락해 주세요.',
  previous: '이전',
  next: '다음',
}

export default legacy

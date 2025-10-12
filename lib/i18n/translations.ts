import type { Language, TranslationData } from './types'
import { navigationTranslations } from './translations/navigation'
import { artworksTranslations } from './translations/artworks'

// 통합된 번역 데이터
export const translations: TranslationData = {
  ko: {
    ...navigationTranslations.ko,
    ...artworksTranslations.ko,
    
    // 공통 UI 요소
    loading: "로딩 중...",
    error: "오류가 발생했습니다",
    retry: "다시 시도",
    close: "닫기",
    save: "저장",
    cancel: "취소",
    confirm: "확인",
    delete: "삭제",
    edit: "편집",
    add: "추가",
    remove: "제거",
    submit: "제출",
    reset: "초기화",
    
    // 홈 페이지
    artGalleryExhibition: "동양서예협회",
    journeyThroughArts: "正法의 계승, 創新의 조화",
    aboutTitle: "소개",
    aboutText: "사단법인 동양서예협회는 正法의 계승 발전과 創新의 조화로운 구현을 통해 동양 서예 문화의 발전과 보급에 앞장서고 있습니다.",
    gallerySpace: "갤러리 공간",
    whereArtsBecome: "예술이 현실이 되는 곳",
    ourSpace: "우리의 공간",
    ourSpaceText: "서울 성북구에 위치한 동양서예협회는 서예 문화를 체험하고 학습할 수 있는 최적의 환경을 제공합니다.",
    
    // 작품 페이지
    artCollection: "작품 컬렉션",
    discoverMasterpieces: "명작을 발견하세요",
    artworksDescription: "正法의 계승과 創新의 조화로 탄생한 동양 예술의 아름다움을 경험하세요",
    searchPlaceholder: "작품명, 작가명, 태그로 검색...",
    
    // 공통 용어
    all: "전체",
    category: "카테고리",
    style: "스타일",
    sort: "정렬",
    featured: "추천순",
    traditional: "전통",
    contemporary: "현대",
    modern: "모던",
    available: "구매가능",
    sold: "판매완료",
    views: "조회",
    likes: "좋아요",
    signOut: "로그아웃",
  },
  
  en: {
    ...navigationTranslations.en,
    ...artworksTranslations.en,
    
    // 공통 UI 요소
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    submit: "Submit",
    reset: "Reset",
    
    // 홈 페이지
    artGalleryExhibition: "Oriental Calligraphy Association",
    journeyThroughArts: "TRADITION AND MODERNITY, INCLUSION AND COMMUNICATION",
    aboutTitle: "About",
    aboutText: "The Asian Society of Calligraphic Arts (ASCA) leads the development and promotion of Oriental calligraphy culture through the harmonious implementation of tradition preservation and creative innovation.",
    gallerySpace: "Gallery Space",
    whereArtsBecome: "WHERE ARTS BECOME REALITY",
    ourSpace: "Our Space",
    ourSpaceText: "Located in Seongbuk-gu, Seoul, the Oriental Calligraphy Association provides the optimal environment for experiencing and learning calligraphy culture.",
    
    // 작품 페이지
    artCollection: "Art Collection",
    discoverMasterpieces: "Discover Masterpieces",
    artworksDescription: "Experience the beauty of Oriental art born from the harmonious implementation of tradition preservation and creative innovation",
    searchPlaceholder: "Search by artwork title, artist name, tags...",
    
    // 공통 용어
    all: "All",
    category: "Category",
    style: "Style",
    sort: "Sort",
    featured: "Featured",
    traditional: "Traditional",
    contemporary: "Contemporary",
    modern: "Modern",
    available: "Available",
    sold: "Sold",
    views: "Views",
    likes: "Likes",
    signOut: "Sign Out",
  },
  
  ja: {
    ...navigationTranslations.ja,
    ...artworksTranslations.ja,
    
    // 공통 UI 요소
    loading: "読み込み中...",
    error: "エラーが発生しました",
    retry: "再試行",
    close: "閉じる",
    save: "保存",
    cancel: "キャンセル",
    confirm: "確認",
    delete: "削除",
    edit: "編集",
    add: "追加",
    remove: "削除",
    submit: "送信",
    reset: "リセット",
    
    // 홈 페이지
    artGalleryExhibition: "東洋書道協会",
    journeyThroughArts: "正法の継承、創新の調和",
    aboutTitle: "紹介",
    aboutText: "社団法人東洋書道協会は正法の継承発展と創新の調和ある実現を通じて東洋書道文化の発展と普及に先頭に立っています。",
    gallerySpace: "ギャラリー空間",
    whereArtsBecome: "芸術が現実になる場所",
    ourSpace: "私たちの空間",
    ourSpaceText: "ソウル城北区に位置する東洋書道協会は書道文化を体験し学習できる最適な環境を提供します。",
    
    // 작품 페이지
    artCollection: "作品コレクション",
    discoverMasterpieces: "名作を発見しましょう",
    artworksDescription: "正法の継承と創新の調和で誕生した東洋芸術の美しさを体験してください",
    searchPlaceholder: "作品名、作家名、タグで検索...",
    
    // 공통 용어
    all: "全体",
    category: "カテゴリー",
    style: "スタイル",
    sort: "並び替え",
    featured: "おすすめ順",
    traditional: "伝統",
    contemporary: "現代",
    modern: "モダン",
    available: "購入可能",
    sold: "販売完了",
    views: "閲覧",
    likes: "いいね",
    signOut: "ログアウト",
  },
  
  zh: {
    ...navigationTranslations.zh,
    ...artworksTranslations.zh,
    
    // 공통 UI 요소
    loading: "加载中...",
    error: "发生错误",
    retry: "重试",
    close: "关闭",
    save: "保存",
    cancel: "取消",
    confirm: "确认",
    delete: "删除",
    edit: "编辑",
    add: "添加",
    remove: "移除",
    submit: "提交",
    reset: "重置",
    
    // 홈 페이지
    artGalleryExhibition: "东方书法协会",
    journeyThroughArts: "正法的传承，创新的和谐",
    aboutTitle: "关于",
    aboutText: "社团法人东方书法协会通过正法的传承发展与创新的和谐实现，引领东方书法文化的发展与普及。",
    gallerySpace: "画廊空间",
    whereArtsBecome: "艺术成为现实的地方",
    ourSpace: "我们的空间",
    ourSpaceText: "位于首尔城北区的东方书法协会为体验和学习书法文化提供最佳环境。",
    
    // 작품 페이지
    artCollection: "艺术收藏",
    discoverMasterpieces: "发现杰作",
    artworksDescription: "体验由正法传承与创新和谐而诞生的东方艺术之美",
    searchPlaceholder: "按作品标题、艺术家姓名、标签搜索...",
    
    // 공통 용어
    all: "全部",
    category: "分类",
    style: "风格",
    sort: "排序",
    featured: "推荐",
    traditional: "传统",
    contemporary: "当代",
    modern: "现代",
    available: "可购买",
    sold: "已售出",
    views: "浏览",
    likes: "点赞",
    signOut: "退出登录",
  }
}

// 번역 함수
export const getTranslation = (language: Language, key: string): string => {
  const translation = translations[language]?.[key]
  if (translation) {
    return translation
  }
  
  // 폴백: 한국어로 시도
  const fallback = translations.ko[key]
  if (fallback) {
    return fallback
  }
  
  // 마지막 폴백: 키 자체 반환
  return key
}

// 번역 타입 (타입 안전성)
export type TranslationKey = keyof typeof translations.ko

// 클라이언트용 동기 번역 함수 (하위 호환성)
export const t = (key: TranslationKey | string, language: Language = 'ko'): string => {
  return getTranslation(language, key)
}

export default translations
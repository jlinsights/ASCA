"use client"
import { log } from '@/lib/utils/logger';

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { 
  LANGUAGE_METADATA, 
  SUPPORTED_LANGUAGES, 
  DEFAULT_LANGUAGE, 
  LANGUAGE_STORAGE_KEY,
  detectBrowserLanguage,
  isValidLanguage,
  getLanguageMetadata,
  translationLoader,
  getTranslationSync
} from "@/lib/i18n"
import type { Language, LanguageConfig, TranslationNamespaces } from "@/lib/i18n/types"

// 기존 호환성을 위한 타입
type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  // 새로운 기능
  tAsync: (key: string, namespace?: keyof TranslationNamespaces) => Promise<string>
  isLoading: boolean
  isClient: boolean
  metadata: typeof LANGUAGE_METADATA[Language]
  supportedLanguages: typeof SUPPORTED_LANGUAGES
}

// 컨텍스트 기본값
const defaultValue: LanguageContextType = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key: string) => key,
  tAsync: async (key: string) => key,
  isLoading: false,
  isClient: false,
  metadata: LANGUAGE_METADATA[DEFAULT_LANGUAGE],
  supportedLanguages: SUPPORTED_LANGUAGES
}

const LanguageContext = createContext<LanguageContextType>(defaultValue)

// 통합된 번역 데이터 (기존 호환성)
const legacyTranslations: Record<Language, Record<string, string>> = {
  ko: {
    // Navigation
    exhibition: "전시",
    artworks: "작품",
    artists: "작가",
    events: "행사",
    catalog: "도록",
    about: "소개",
    organization: "조직",
    support: "지원",
    brand: "브랜드",
    language: "언어",
    news: "소식",
    search: "검색",
    signIn: "로그인",
    signUp: "회원가입",
    menu: "메뉴",
    
    // Exhibition submenu
    currentExhibitions: "현재 전시",
    upcomingExhibitions: "예정 전시",
    pastExhibitions: "지난 전시",
    onlineExhibitions: "온라인 전시",
    
    // Artworks submenu
    hangeulCalligraphy: "한글서예",
    hanjaCalligraphy: "한자서예",
    literatiPainting: "문인화",
    inkPainting: "수묵화",
    orientalPainting: "동양화",
    folkPainting: "민화",
    modernCalligraphy: "현대서예",
    calligraphyArt: "캘리그라피",
    sealEngraving: "전각",
    woodEngraving: "서각",
    photography: "사진",
    video: "영상",
    
    // Artists submenu
    openCallArtists: "공모작가",
    youngArtists: "청년작가",
    recommendedArtists: "추천작가",
    invitedArtists: "초대작가",
    
    // Common
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
    
    // Home page
    artGalleryExhibition: "동양서예협회",
    journeyThroughArts: "正法의 계승, 創新의 조화",
    aboutTitle: "소개",
    aboutText: "사단법인 동양서예협회는 正法의 계승 발전과 創新의 조화로운 구현을 통해 동양 서예 문화의 발전과 보급에 앞장서고 있습니다.",
    gallerySpace: "갤러리 공간",
    whereArtsBecome: "예술이 현실이 되는 곳",
    ourSpace: "우리의 공간",
    ourSpaceText: "서울 성북구에 위치한 동양서예협회는 서예 문화를 체험하고 학습할 수 있는 최적의 환경을 제공합니다.",
    
    // Artworks page
    artCollection: "작품 컬렉션",
    discoverMasterpieces: "명작을 발견하세요",
    artworksDescription: "正法의 계승과 創新의 조화로 탄생한 동양 예술의 아름다움을 경험하세요",
    searchPlaceholder: "작품명, 작가명, 태그로 검색...",
    
    // Common UI
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
    reset: "초기화"
  },
  
  en: {
    // Navigation
    exhibition: "Exhibition",
    artworks: "Artworks",
    artists: "Artists",
    events: "Events",
    catalog: "Catalog",
    about: "About",
    organization: "Organization",
    support: "Support",
    brand: "Brand",
    language: "Language",
    news: "News",
    search: "Search",
    signIn: "Sign In",
    signUp: "Sign Up",
    menu: "Menu",
    
    // Exhibition submenu
    currentExhibitions: "Current Exhibitions",
    upcomingExhibitions: "Upcoming Exhibitions",
    pastExhibitions: "Past Exhibitions",
    onlineExhibitions: "Online Exhibitions",
    
    // Artworks submenu
    hangeulCalligraphy: "Hangeul Calligraphy",
    hanjaCalligraphy: "Hanja Calligraphy",
    literatiPainting: "Literati Painting",
    inkPainting: "Ink Painting",
    orientalPainting: "Oriental Painting",
    folkPainting: "Folk Painting",
    modernCalligraphy: "Modern Calligraphy",
    calligraphyArt: "Calligraphy Art",
    sealEngraving: "Seal Engraving",
    woodEngraving: "Wood Engraving",
    photography: "Photography",
    video: "Video",
    
    // Artists submenu
    openCallArtists: "Open Call Artists",
    youngArtists: "Young Artists",
    recommendedArtists: "Recommended Artists",
    invitedArtists: "Invited Artists",
    
    // Common
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
    
    // Home page
    artGalleryExhibition: "Oriental Calligraphy Association",
    journeyThroughArts: "TRADITION AND MODERNITY, INCLUSION AND COMMUNICATION",
    aboutTitle: "About",
    aboutText: "The Asian Society of Calligraphic Arts (ASCA) leads the development and promotion of Oriental calligraphy culture through the harmonious implementation of tradition preservation and creative innovation.",
    gallerySpace: "Gallery Space",
    whereArtsBecome: "WHERE ARTS BECOME REALITY",
    ourSpace: "Our Space",
    ourSpaceText: "Located in Seongbuk-gu, Seoul, the Oriental Calligraphy Association provides the optimal environment for experiencing and learning calligraphy culture.",
    
    // Artworks page
    artCollection: "Art Collection",
    discoverMasterpieces: "Discover Masterpieces",
    artworksDescription: "Experience the beauty of Oriental art born from the harmonious implementation of tradition preservation and creative innovation",
    searchPlaceholder: "Search by artwork title, artist name, tags...",
    
    // Common UI
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
    reset: "Reset"
  },
  
  ja: {
    // Navigation
    exhibition: "展示",
    artworks: "作品",
    artists: "作家",
    events: "行事",
    catalog: "図録",
    about: "紹介",
    organization: "組織",
    support: "支援",
    brand: "ブランド",
    language: "言語",
    news: "ニュース",
    search: "検索",
    signIn: "ログイン",
    signUp: "会員登録",
    menu: "メニュー",
    
    // Exhibition submenu
    currentExhibitions: "現在の展示",
    upcomingExhibitions: "予定展示",
    pastExhibitions: "過去の展示",
    onlineExhibitions: "オンライン展示",
    
    // Artworks submenu
    hangeulCalligraphy: "ハングル書道",
    hanjaCalligraphy: "漢字書道",
    literatiPainting: "文人画",
    inkPainting: "水墨画",
    orientalPainting: "東洋画",
    folkPainting: "民画",
    modernCalligraphy: "現代書道",
    calligraphyArt: "カリグラフィー",
    sealEngraving: "篆刻",
    woodEngraving: "書刻",
    photography: "写真",
    video: "映像",
    
    // Artists submenu
    openCallArtists: "公募作家",
    youngArtists: "青年作家",
    recommendedArtists: "推薦作家",
    invitedArtists: "招待作家",
    
    // Common
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
    
    // Home page
    artGalleryExhibition: "東洋書道協会",
    journeyThroughArts: "正法の継承、創新の調和",
    aboutTitle: "紹介",
    aboutText: "社団法人東洋書道協会は正法の継承発展と創新の調和ある実現を通じて東洋書道文化の発展と普及に先頭に立っています。",
    gallerySpace: "ギャラリー空間",
    whereArtsBecome: "芸術が現実になる場所",
    ourSpace: "私たちの空間",
    ourSpaceText: "ソウル城北区に位置する東洋書道協会は書道文化を体験し学習できる最適な環境を提供します。",
    
    // Artworks page
    artCollection: "作品コレクション",
    discoverMasterpieces: "名作を発見しましょう",
    artworksDescription: "正法の継承と創新の調和で誕生した東洋芸術の美しさを体験してください",
    searchPlaceholder: "作品名、作家名、タグで検索...",
    
    // Common UI
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
    reset: "リセット"
  },
  
  zh: {
    // Navigation
    exhibition: "展览",
    artworks: "艺术品",
    artists: "艺术家",
    events: "活动",
    catalog: "目录",
    about: "关于",
    organization: "组织",
    support: "支持",
    brand: "品牌",
    language: "语言",
    news: "新闻",
    search: "搜索",
    signIn: "登录",
    signUp: "注册",
    menu: "菜单",
    
    // Exhibition submenu
    currentExhibitions: "当前展览",
    upcomingExhibitions: "即将举办的展览",
    pastExhibitions: "过去的展览",
    onlineExhibitions: "在线展览",
    
    // Artworks submenu
    hangeulCalligraphy: "韩文书法",
    hanjaCalligraphy: "汉字书法",
    literatiPainting: "文人画",
    inkPainting: "水墨画",
    orientalPainting: "东方画",
    folkPainting: "民画",
    modernCalligraphy: "现代书法",
    calligraphyArt: "书法艺术",
    sealEngraving: "篆刻",
    woodEngraving: "书刻",
    photography: "摄影",
    video: "视频",
    
    // Artists submenu
    openCallArtists: "公开征集艺术家",
    youngArtists: "青年艺术家",
    recommendedArtists: "推荐艺术家",
    invitedArtists: "邀请艺术家",
    
    // Common
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
    
    // Home page
    artGalleryExhibition: "东方书法协会",
    journeyThroughArts: "正法的传承，创新的和谐",
    aboutTitle: "关于",
    aboutText: "社团法人东方书法协会通过正法的传承发展与创新的和谐实现，引领东方书法文化的发展与普及。",
    gallerySpace: "画廊空间",
    whereArtsBecome: "艺术成为现实的地方",
    ourSpace: "我们的空间",
    ourSpaceText: "位于首尔城北区的东方书法协会为体验和学习书法文化提供最佳环境。",
    
    // Artworks page
    artCollection: "艺术收藏",
    discoverMasterpieces: "发现杰作",
    artworksDescription: "体验由正法传承与创新和谐而诞生的东方艺术之美",
    searchPlaceholder: "按作品标题、艺术家姓名、标签搜索...",
    
    // Common UI
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
    reset: "重置"
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // 언어 메타데이터 메모화
  const metadata = useMemo(() => getLanguageMetadata(language), [language])

  // 언어 설정 함수 (최적화됨)
  const setLanguage = useCallback(async (newLanguage: Language) => {
    if (!isValidLanguage(newLanguage) || newLanguage === language) {
      return
    }

    setIsLoading(true)
    
    try {
      // 번역 데이터 미리 로드
      await translationLoader.preload(newLanguage)
      
      // 언어 상태 업데이트
      setLanguageState(newLanguage)
      
      // 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
        document.documentElement.lang = newLanguage
        document.documentElement.dir = metadata.dir
      }
    } catch (error) {
      log.error('Failed to change language:', error)
    } finally {
      setIsLoading(false)
    }
  }, [language, metadata.dir])

  // 동기 번역 함수 (기존 호환성)
  const t = useCallback((key: string): string => {
    // 새로운 시스템에서 먼저 시도
    const cached = getTranslationSync(language, key)
    if (cached !== key) {
      return cached
    }
    
    // 기존 번역 데이터에서 폴백
    return legacyTranslations[language]?.[key] || key
  }, [language])

  // 비동기 번역 함수 (새로운 기능)
  const tAsync = useCallback(async (
    key: string, 
    namespace: keyof TranslationNamespaces = 'common'
  ): Promise<string> => {
    try {
      const translations = await translationLoader.load(language, namespace)
      return translations[key] || t(key)
    } catch (error) {
      log.warn('Async translation failed:', error)
      return t(key)
    }
  }, [language, t])

  // 초기화
  useEffect(() => {
    setIsClient(true)
    
    // 클라이언트에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
      const detectedLanguage = savedLanguage || detectBrowserLanguage()
      
      if (isValidLanguage(detectedLanguage) && detectedLanguage !== language) {
        setLanguage(detectedLanguage)
      }
      
      // HTML 속성 설정
      document.documentElement.lang = language
      document.documentElement.dir = metadata.dir
    }
  }, [language, metadata.dir, setLanguage])

  // 언어 변경 시 번역 데이터 프리로드
  useEffect(() => {
    if (isClient) {
      translationLoader.preload(language).catch((error) => log.warn('Translation preload failed:', error))
    }
  }, [language, isClient])

  const contextValue = useMemo((): LanguageContextType => ({
    language,
    setLanguage,
    t,
    tAsync,
    isLoading,
    isClient,
    metadata,
    supportedLanguages: SUPPORTED_LANGUAGES
  }), [language, setLanguage, t, tAsync, isLoading, isClient, metadata])

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// 성능을 위한 추가 훅들
export function useTranslation() {
  const { t, tAsync, language, isLoading } = useLanguage()
  return { t, tAsync, language, isLoading }
}

export function useLanguageMetadata() {
  const { metadata, supportedLanguages } = useLanguage()
  return { metadata, supportedLanguages, allLanguages: LANGUAGE_METADATA }
}